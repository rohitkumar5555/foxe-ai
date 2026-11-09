import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../db/store';
import { emailQueue } from './emailQueue';
import { orchestrator } from '../agents/orchestrator';

test('Email Queue: Generates deterministic idempotency keys', () => {
  const key1 = emailQueue.generateIdempotencyKey({
    userId: 'user-001',
    recipient: 'test@example.com',
    subject: 'Hello',
    message: 'Testing email message',
  });

  const key2 = emailQueue.generateIdempotencyKey({
    userId: 'user-001',
    recipient: 'TEST@example.com ',
    subject: 'Hello',
    message: 'Testing email message',
  });

  assert.equal(key1, key2, 'Idempotency key must normalize whitespace and email casing');

  const key3 = emailQueue.generateIdempotencyKey({
    userId: 'user-001',
    recipient: 'other@example.com',
    subject: 'Hello',
    message: 'Testing email message',
  });

  assert.notEqual(key1, key3, 'Different recipient must yield distinct idempotency key');
});

test('Email Queue: Prevents duplicate job creation via idempotency check', () => {
  const task1 = db.createTask('Email Dispatch 1', 'Send hello', 'Email Agent');
  const res1 = emailQueue.enqueueEmailJob({
    userId: 'user-foxe-test',
    taskId: task1.id,
    connectedGmailAccount: 'sender@gmail.com',
    recipient: 'client@example.com',
    subject: 'Invoice #1024',
    message: 'Please find attached invoice.',
  });

  assert.equal(res1.isDuplicate, false, 'First enqueue must not be duplicate');
  assert.equal(res1.job.status, 'QUEUED');

  // Enqueue same parameters
  const task2 = db.createTask('Email Dispatch 2', 'Send hello again', 'Email Agent');
  const res2 = emailQueue.enqueueEmailJob({
    userId: 'user-foxe-test',
    taskId: task2.id,
    connectedGmailAccount: 'sender@gmail.com',
    recipient: 'client@example.com',
    subject: 'Invoice #1024',
    message: 'Please find attached invoice.',
  });

  assert.equal(res2.isDuplicate, true, 'Second enqueue with identical parameters must be detected as duplicate');
  assert.equal(res2.job.id, res1.job.id, 'Duplicate must return existing job record');
});

test('Email Queue: Cancel and retry transitions email job states', () => {
  const task = db.createTask('Email Task Cancel Test', 'Send test email', 'Email Agent');
  const { job } = emailQueue.enqueueEmailJob({
    userId: 'user-cancel-test',
    taskId: task.id,
    connectedGmailAccount: 'sender@gmail.com',
    recipient: 'receiver@example.com',
    subject: 'Meeting Confirmation',
    message: 'See you tomorrow at 10 AM.',
  });

  assert.equal(job.status, 'QUEUED');

  // Cancelling the task cancels the linked email job
  db.cancelTask(task.id);
  const updatedJob = db.getEmailJobById(job.id);
  assert.ok(updatedJob);
  assert.equal(updatedJob.status, 'CANCELLED');

  // Retrying the task resets the linked email job back to QUEUED
  db.retryTask(task.id);
  const retriedJob = db.getEmailJobById(job.id);
  assert.ok(retriedJob);
  assert.equal(retriedJob.status, 'QUEUED');
});

test('Email Queue: Crash recovery recovers interrupted RUNNING jobs on startup', () => {
  const task = db.createTask('Crash Recovery Task', 'Send test email', 'Email Agent');
  const { job } = emailQueue.enqueueEmailJob({
    userId: 'user-crash-test',
    taskId: task.id,
    connectedGmailAccount: 'sender@gmail.com',
    recipient: 'recovery@example.com',
    subject: 'Recovery Test',
    message: 'Testing worker crash recovery.',
  });

  // Simulate server crashed while job was RUNNING
  job.status = 'RUNNING';
  job.retryCount = 0;
  db.save();

  // Trigger recovery via startWorker (or stop and start)
  emailQueue.stopWorker();
  emailQueue.startWorker();

  const recoveredJob = db.getEmailJobById(job.id);
  assert.ok(recoveredJob);
  assert.equal(recoveredJob.status, 'QUEUED', 'Interrupted RUNNING job should be safely re-queued');
  assert.equal(recoveredJob.retryCount, 1, 'Retry count should be incremented');

  emailQueue.stopWorker();
});

test('Orchestrator: Direct chat email command sends in background without approval popup', async () => {
  // Ensure authenticated user with connected Gmail
  db.setAuthenticatedUser('alex.morgan@foxe-agent.io', 'Alex Morgan', undefined, 'mock-access-token');

  const command = 'Send an email to partner@venture.com saying Hello, our term sheet is attached for review.';
  const result = await orchestrator.processUserCommand(command);

  assert.equal(result.intent, 'email_workflow');
  assert.equal(result.requiresApproval, false, 'Explicit chat command must NOT require second approval');
  assert.ok(result.finalAnswer.includes('queued'), 'Assistant must confirm background queued status');
  assert.ok(result.finalAnswer.includes('partner@venture.com'), 'Assistant must show recipient');
  assert.ok(result.taskId, 'Task ID must be created');

  const task = db.getTaskById(result.taskId!);
  assert.ok(task, 'Task must exist in database');

  const job = db.getEmailJobByTaskId(result.taskId!);
  assert.ok(job, 'Background email job must be linked to task');
  assert.equal(job.recipient, 'partner@venture.com');
  assert.ok(job.subject.length > 0);
  assert.ok(job.message.includes('term sheet'));
});

test('Orchestrator: Ambiguous email command asks for clarification', async () => {
  db.setAuthenticatedUser('alex.morgan@foxe-agent.io', 'Alex Morgan', undefined, 'mock-access-token');

  // 1. Missing recipient
  const res1 = await orchestrator.processUserCommand('Send an email saying Hello, how are you?');
  assert.ok(res1.finalAnswer.includes('email address') || res1.finalAnswer.includes('recipient'), 'Should request recipient');

  // 2. Invalid recipient
  const res2 = await orchestrator.processUserCommand('Send an email to invalid-address saying Hello');
  assert.ok(res2.finalAnswer.includes('invalid') || res2.finalAnswer.includes('valid email'), 'Should warn about invalid email');

  // 3. Missing message
  const res3 = await orchestrator.processUserCommand('Send an email to client@acme.com');
  assert.ok(res3.finalAnswer.includes('message') || res3.finalAnswer.includes('say'), 'Should ask for message content');
});

test('Orchestrator: Missing Gmail connection prompts user to connect Gmail', async () => {
  // Disconnect Gmail
  db.disconnectApp('gmail');

  const res = await orchestrator.processUserCommand('Send an email to client@acme.com saying Hello');
  assert.ok(
    res.finalAnswer.includes('Connect') || res.finalAnswer.includes('Connected Apps'),
    'Should prompt user to connect Gmail when disconnected'
  );

  // Restore connection
  db.setAuthenticatedUser('alex.morgan@foxe-agent.io', 'Alex Morgan', undefined, 'valid-token');
});
