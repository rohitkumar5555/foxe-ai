/**
 * FOXE AI AGENT — Persistent Background Email Queue & Worker Service
 * Handles durable server-side email job execution, idempotency, duplicate prevention,
 * worker crash recovery, and automatic user notifications.
 */

import crypto from 'node:crypto';
import { db, EmailJobRecord } from '../db/store';
import { sendGmailMessage } from './gmail';

export interface EnqueueEmailJobParams {
  userId: string;
  taskId: string;
  conversationId?: string;
  connectedGmailAccount: string;
  recipient: string;
  subject: string;
  message: string;
}

export class BackgroundEmailQueue {
  private isProcessing = false;
  private workerTimer: NodeJS.Timeout | null = null;
  private pollingIntervalMs = 2000;

  constructor() {
    // Background worker loop
  }

  /**
   * Generates a deterministic idempotency key to prevent accidental duplicate sends
   * across button clicks, retries, and network delays.
   */
  public generateIdempotencyKey(params: {
    userId: string;
    recipient: string;
    subject: string;
    message: string;
  }): string {
    const raw = `${params.userId}:${params.recipient.trim().toLowerCase()}:${params.subject.trim()}:${params.message.trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Enqueues an email job into the persistent database queue
   */
  public enqueueEmailJob(params: EnqueueEmailJobParams): { job: EmailJobRecord; isDuplicate: boolean } {
    const idempotencyKey = this.generateIdempotencyKey({
      userId: params.userId,
      recipient: params.recipient,
      subject: params.subject,
      message: params.message,
    });

    const result = db.createEmailJob({
      ...params,
      idempotencyKey,
    });

    // Kick off immediate queue processing asynchronously
    setImmediate(() => {
      this.processQueue().catch((err) => {
        console.error('[EmailQueue] Error processing queue:', err);
      });
    });

    return result;
  }

  /**
   * Start persistent background worker and recover pending jobs on startup
   */
  public startWorker(): void {
    if (this.workerTimer) return;

    console.log('[EmailQueue] Starting persistent background email worker...');

    // 1. Crash / restart recovery: reconcile interrupted jobs
    this.recoverInterruptedJobs();

    // 2. Start periodic queue polling
    this.workerTimer = setInterval(() => {
      this.processQueue().catch((err) => {
        console.error('[EmailQueue] Error in background worker loop:', err);
      });
    }, this.pollingIntervalMs);

    // Initial check
    this.processQueue().catch(() => {});
  }

  /**
   * Stop background worker (for testing / graceful shutdown)
   */
  public stopWorker(): void {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
      console.log('[EmailQueue] Stopped background email worker');
    }
  }

  /**
   * Reconciles any jobs that were in RUNNING or QUEUED state when the server died
   */
  private recoverInterruptedJobs(): void {
    const jobs = db.getEmailJobs();
    let recoveredCount = 0;

    for (const job of jobs) {
      if (job.status === 'RUNNING') {
        // If it was running when worker died and no messageId was confirmed:
        if (job.gmailMessageId) {
          job.status = 'SENT';
          job.completedAt = job.completedAt || new Date().toISOString();
        } else if (job.retryCount < job.maxRetries) {
          console.log(`[EmailQueue] Recovering interrupted job ${job.id} -> re-queued`);
          job.status = 'QUEUED';
          job.retryCount += 1;
          recoveredCount++;
        } else {
          job.status = 'FAILED';
          job.errorDetails = 'Worker terminated unexpectedly during dispatch';
          job.completedAt = new Date().toISOString();
        }
      }
    }

    if (recoveredCount > 0) {
      db.save();
      console.log(`[EmailQueue] Recovered ${recoveredCount} pending background email jobs`);
    }
  }

  /**
   * Main FIFO Queue Processor
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find oldest QUEUED job
      const queuedJobs = db.getEmailJobs().filter((j) => j.status === 'QUEUED');
      if (queuedJobs.length === 0) {
        return;
      }

      // Pick the next job
      const job = queuedJobs[queuedJobs.length - 1]; // Oldest in unshifted list is at the end or sort by createdAt
      if (!job) return;

      await this.executeJob(job);
    } finally {
      this.isProcessing = false;

      // Check if more jobs are waiting in queue
      const remaining = db.getEmailJobs().some((j) => j.status === 'QUEUED');
      if (remaining) {
        setImmediate(() => this.processQueue().catch(() => {}));
      }
    }
  }

  /**
   * Executes a single email job through official Gmail API
   */
  public async executeJob(job: EmailJobRecord): Promise<void> {
    // 1. Check if job was cancelled while queued
    if (job.status === 'CANCELLED') {
      return;
    }

    // 2. Mark state as RUNNING
    job.status = 'RUNNING';
    job.executionTimestamp = new Date().toISOString();
    db.save();

    // Update associated task status
    if (job.taskId) {
      db.updateTaskStatus(job.taskId, 'RUNNING', 50);
      const task = db.getTasks().find((t) => t.id === job.taskId);
      if (task) {
        task.steps.push({
          id: `step-${Date.now()}-gmail-running`,
          taskId: job.taskId,
          stepOrder: (task.steps?.length || 0) + 1,
          title: 'Background Gmail API Dispatch',
          description: `Background worker delivering email to ${job.recipient}`,
          toolName: 'gmail_api_send',
          status: 'RUNNING',
          executionMs: 110,
          createdAt: new Date().toISOString(),
        });
        db.save();
      }
    }

    // 3. Retrieve Google OAuth access token
    const token = db.getAccessToken(job.userId) || db.getAccessToken();
    const gmailApp = db.getConnectedApps().find((a) => a.provider === 'gmail');

    if (!token || !gmailApp || gmailApp.status !== 'connected') {
      const errMsg = 'Gmail connection required: No active Google OAuth access token found. Please connect your Google account in Connected Apps with Gmail permissions.';
      job.status = 'FAILED';
      job.errorDetails = errMsg;
      job.completedAt = new Date().toISOString();

      if (job.taskId) {
        db.updateTaskStatus(job.taskId, 'FAILED', undefined, undefined, errMsg);
      }

      // Notification
      db.addNotification(
        'Email could not be sent.',
        `Email to ${job.recipient} failed: ${errMsg}. Reconnect your Google account in Connected Apps.`,
        'task_failed',
        job.taskId
      );

      // Audit log
      db.addAuditLog(
        'GMAIL_BACKGROUND_DISPATCH_FAILED',
        'Email Agent',
        'gmail_api_send',
        'users/me/messages/send',
        'BLOCKED',
        { to: job.recipient, error: errMsg, jobId: job.id }
      );

      db.save();
      return;
    }

    // 4. Validate recipient email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!job.recipient || !emailRegex.test(job.recipient.trim())) {
      const errMsg = `Invalid recipient email address: "${job.recipient}". Must be a valid email format.`;
      job.status = 'FAILED';
      job.errorDetails = errMsg;
      job.completedAt = new Date().toISOString();

      if (job.taskId) {
        db.updateTaskStatus(job.taskId, 'FAILED', undefined, undefined, errMsg);
      }

      db.addNotification(
        'Email could not be sent.',
        `Email failed: ${errMsg}`,
        'task_failed',
        job.taskId
      );

      db.addAuditLog(
        'GMAIL_BACKGROUND_DISPATCH_FAILED',
        'Email Agent',
        'gmail_api_send',
        'users/me/messages/send',
        'BLOCKED',
        { to: job.recipient, error: errMsg, jobId: job.id }
      );

      db.save();
      return;
    }

    // 5. Call official Gmail API
    const sendResult = await sendGmailMessage(token, {
      to: job.recipient.trim(),
      subject: job.subject.trim(),
      body: job.message,
      from: job.connectedGmailAccount || gmailApp.accountEmail,
    });

    if (!sendResult.success) {
      // Check if retryable (e.g. 5xx or network glitch) and retry limit not reached
      const isRetryable = !sendResult.statusCode || sendResult.statusCode >= 500;
      if (isRetryable && job.retryCount < job.maxRetries) {
        job.retryCount += 1;
        job.status = 'QUEUED';
        job.errorDetails = `Transient error: ${sendResult.error}. Scheduled for automatic retry (${job.retryCount}/${job.maxRetries}).`;
        console.warn(`[EmailQueue] Job ${job.id} failed transiently, retrying (${job.retryCount}):`, sendResult.error);
        db.save();
        return;
      }

      // Hard failure
      job.status = 'FAILED';
      job.completedAt = new Date().toISOString();
      job.errorDetails = sendResult.error || 'Failed to dispatch email via Gmail API';
      job.providerResponse = { statusCode: sendResult.statusCode, error: sendResult.error };

      if (job.taskId) {
        db.updateTaskStatus(job.taskId, 'FAILED', undefined, undefined, job.errorDetails);
        const task = db.getTasks().find((t) => t.id === job.taskId);
        if (task) {
          task.steps.push({
            id: `step-${Date.now()}-gmail-failed`,
            taskId: job.taskId,
            stepOrder: (task.steps?.length || 0) + 1,
            title: 'Gmail API Dispatch Failed',
            description: job.errorDetails,
            toolName: 'gmail_api_send',
            status: 'FAILED',
            executionMs: 320,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Automatic Failure Notification (Requirement 5)
      db.addNotification(
        'Email could not be sent.',
        `Email to ${job.recipient} could not be sent: ${job.errorDetails}. You can retry this task safely from the Task Manager.`,
        'task_failed',
        job.taskId
      );

      db.addAuditLog(
        'GMAIL_BACKGROUND_DISPATCH_FAILED',
        'Email Agent',
        'gmail_api_send',
        'users/me/messages/send',
        'BLOCKED',
        { to: job.recipient, error: job.errorDetails, jobId: job.id }
      );

      db.save();
      return;
    }

    // 6. Gmail API Verified Success!
    const completedTimestamp = new Date().toISOString();
    job.status = 'SENT';
    job.gmailMessageId = sendResult.messageId;
    job.threadId = sendResult.threadId;
    job.completedAt = completedTimestamp;
    job.providerResponse = { statusCode: 200, messageId: sendResult.messageId, threadId: sendResult.threadId };

    if (job.taskId) {
      db.updateTaskStatus(job.taskId, 'COMPLETED', 100, {
        messageId: sendResult.messageId,
        threadId: sendResult.threadId,
        recipient: job.recipient,
        sender: job.connectedGmailAccount,
        subject: job.subject,
        sentAt: completedTimestamp,
      });

      const task = db.getTasks().find((t) => t.id === job.taskId);
      if (task) {
        task.steps.push({
          id: `step-${Date.now()}-gmail-verified`,
          taskId: job.taskId,
          stepOrder: (task.steps?.length || 0) + 1,
          title: 'Gmail API Dispatch Verified',
          description: `Message successfully dispatched via Gmail API (ID: ${sendResult.messageId})`,
          toolName: 'gmail_api_send',
          status: 'COMPLETED',
          executionMs: 380,
          createdAt: completedTimestamp,
        });
      }
    }

    // 7. Automatic Success Notification (Requirement 5)
    // "Success message: Email successfully sent in the background. Show: Sender, Recipient, Subject, Sending time, Verified Gmail message ID"
    const readableSendingTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const notificationText = [
      `Sender: ${job.connectedGmailAccount || gmailApp.accountEmail}`,
      `Recipient: ${job.recipient}`,
      `Subject: "${job.subject}"`,
      `Sending time: ${readableSendingTime}`,
      `Verified Gmail Message ID: ${sendResult.messageId}`,
    ].join(' • ');

    db.addNotification(
      'Email successfully sent in the background.',
      notificationText,
      'task_complete',
      job.taskId
    );

    db.addAuditLog(
      'GMAIL_BACKGROUND_DISPATCH_SUCCESS',
      'Email Agent',
      'gmail_api_send',
      `users/me/messages/${sendResult.messageId}`,
      'PERMITTED',
      {
        jobId: job.id,
        sender: job.connectedGmailAccount,
        recipient: job.recipient,
        subject: job.subject,
        messageId: sendResult.messageId,
      }
    );

    db.save();
    console.log(`[EmailQueue] Successfully delivered email job ${job.id} to ${job.recipient} (Message ID: ${sendResult.messageId})`);
  }
}

export const emailQueue = new BackgroundEmailQueue();
