import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'foxe_database.json');

// Interface models
export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  timezone: string;
  language: string;
  approvalMode?: string;
  memoryEnabled?: boolean;
  notificationsEnabled?: boolean;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system' | 'sentinel';
  content: string;
  planData?: {
    intent: string;
    targetAgent: string;
    steps: { title: string; tool: string; status: string }[];
  };
  toolInvocations?: { tool: string; input: any; output: any; verified: boolean }[];
  verifiedResult?: { status: string; summary: string; outputRef?: string };
  taskId?: string;
  feedbackRating?: 'like' | 'dislike';
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  conversationId?: string;
  title: string;
  instruction: string;
  status: 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  assignedAgent: string;
  progressPercent: number;
  resultData?: any;
  errorMessage?: string;
  steps: TaskStepRecord[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface EmailJobRecord {
  id: string;
  userId: string;
  taskId: string;
  conversationId?: string;
  connectedGmailAccount: string;
  recipient: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'QUEUED' | 'RUNNING' | 'SENT' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  executionTimestamp?: string;
  completedAt?: string;
  gmailMessageId?: string;
  threadId?: string;
  providerResponse?: any;
  errorDetails?: string;
  retryCount: number;
  maxRetries: number;
  idempotencyKey: string;
}

export interface TaskStepRecord {
  id: string;
  taskId: string;
  stepOrder: number;
  title: string;
  description: string;
  toolName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  executionMs: number;
  createdAt: string;
}

export interface ConnectedAppRecord {
  id: string;
  userId: string;
  provider: 'gmail' | 'calendar' | 'drive' | 'slack' | 'github' | 'plaid';
  name: string;
  accountEmail: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  grantedScopes: string[];
  capabilities: string[];
  lastSyncAt: string;
  inboxPreview?: { id: string; from: string; subject: string; date: string; unread: boolean }[];
  calendarPreview?: { id: string; title: string; start: string; end: string; attendees: string[] }[];
}

export interface AutomationRecord {
  id: string;
  userId: string;
  name: string;
  naturalInstruction: string;
  cronExpression: string;
  frequencyLabel: string;
  targetApp: string;
  timezone: string;
  isActive: boolean;
  notifyOnRun: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  executionHistory: { runAt: string; status: 'SUCCESS' | 'FAILED'; summary: string }[];
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  userId: string;
  taskId: string;
  title: string;
  actionType: 'send_email' | 'delete_file' | 'make_purchase' | 'update_calendar' | 'external_api';
  summary: string;
  details: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  createdAt: string;
}

export interface MemoryRecord {
  id: string;
  userId: string;
  category: 'preference' | 'goal' | 'project' | 'context';
  key: string;
  value: string;
  approvedByUser: boolean;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  storagePath: string;
  extractedText: string;
  summary: string;
  version: number;
  versions: { version: number; date: string; size: number }[];
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task_complete' | 'task_failed' | 'approval_request' | 'automation_run' | 'security_alert';
  relatedTaskId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  action: string;
  agentName: string;
  toolName?: string;
  resource?: string;
  securityDecision: 'PERMITTED' | 'BLOCKED' | 'APPROVED_BY_USER' | 'REJECTED_BY_USER';
  payload?: any;
  createdAt: string;
}

export interface BrowserSessionRecord {
  id: string;
  userId: string;
  url: string;
  title: string;
  interactiveMode: boolean;
  viewportScreenshot?: string;
  extractedContent: string;
  logs: string[];
  status: 'active' | 'idle' | 'stopped';
  updatedAt: string;
}

export interface WorkspaceRecord {
  id: string;
  userId: string;
  environment: string;
  status: 'running' | 'stopped' | 'restarting';
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  uptimeSeconds: number;
  logs: string[];
}

export interface DeviceRecord {
  id: string;
  userId: string;
  platform: 'android' | 'ios';
  deviceName: string;
  osVersion: string;
  automationEnabled: boolean;
  availableApps: { name: string; packageName: string; intentAction: string; permitted: boolean }[];
  status: 'online' | 'offline';
  lastHeartbeat: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  tasks: TaskRecord[];
  connectedApps: ConnectedAppRecord[];
  automations: AutomationRecord[];
  approvals: ApprovalRecord[];
  memories: MemoryRecord[];
  files: FileRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
  browserSession: BrowserSessionRecord;
  workspace: WorkspaceRecord;
  devices: DeviceRecord[];
  emailJobs: EmailJobRecord[];
}

class DatabaseStore {
  public data: DatabaseSchema;
  private isWriting = false;
  private userTokens: Map<string, string> = new Map();
  public isAuthenticated = true;

  constructor() {
    this.data = this.loadInitialData();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadInitialData(): DatabaseSchema {
    this.ensureDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure default timezone is Asia/Kolkata if unset or outdated
        if (parsed.users && parsed.users[0] && (!parsed.users[0].timezone || parsed.users[0].timezone.includes('Los_Angeles'))) {
          parsed.users[0].timezone = 'Asia/Kolkata';
        }
        if (!parsed.emailJobs) {
          parsed.emailJobs = [];
        }
        return parsed;
      } catch (err) {
        console.error('Error reading DB_FILE, seeding default data:', err);
      }
    }

    const defaultSeed: DatabaseSchema = {
      users: [
        {
          id: 'user-foxe-001',
          email: 'admin@foxe-agent.internal',
          fullName: 'Alex Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: 'Administrator',
          timezone: 'Asia/Kolkata',
          language: 'English (US)',
          approvalMode: 'HIGH_RISK_ONLY',
          memoryEnabled: true,
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
        },
      ],
      conversations: [
        {
          id: 'conv-001',
          userId: 'user-foxe-001',
          title: 'Q4 Financial Audit & Flight Logistics',
          model: 'gemini-3.8-flash',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      messages: [
        {
          id: 'msg-seed-1',
          conversationId: 'conv-001',
          sender: 'assistant',
          content: 'FOXE AI Agent online. All security sentinels, browser sandboxes, and connected workspace tools are operational. How can I assist you?',
          createdAt: new Date(Date.now() - 3500000).toISOString(),
        },
      ],
      tasks: [
        {
          id: 'task-101',
          userId: 'user-foxe-001',
          conversationId: 'conv-001',
          title: 'Audit Inactive Subscriptions & Flag Overcharges',
          instruction: 'Connect to financial statement and email receipts to discover subscriptions unused for 60+ days.',
          status: 'WAITING_APPROVAL',
          assignedAgent: 'Finance & Research Agent',
          progressPercent: 75,
          resultData: {
            flaggedCount: 2,
            monthlySavings: '$46.98',
            annualSavings: '$563.76',
            services: ['Paramount+ ($11.99)', 'Bloomberg Digital ($34.99)'],
          },
          steps: [
            {
              id: 'step-1',
              taskId: 'task-101',
              stepOrder: 1,
              title: 'Statement Ingestion',
              description: 'Parsed recurring card charges across last 90 days',
              toolName: 'plaid_fetch_transactions',
              status: 'COMPLETED',
              executionMs: 320,
              createdAt: new Date(Date.now() - 1800000).toISOString(),
            },
            {
              id: 'step-2',
              taskId: 'task-101',
              stepOrder: 2,
              title: 'Usage Cross-Audit',
              description: 'Scanned Gmail login receipts and activity records',
              toolName: 'gmail_search_activity',
              status: 'COMPLETED',
              executionMs: 440,
              createdAt: new Date(Date.now() - 1700000).toISOString(),
            },
            {
              id: 'step-3',
              taskId: 'task-101',
              stepOrder: 3,
              title: 'Sentinel Policy Gate',
              description: 'Cancellation requires human approval card before VM form submit',
              toolName: 'security_sentinel_gate',
              status: 'PENDING',
              executionMs: 0,
              createdAt: new Date(Date.now() - 1600000).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-102',
          userId: 'user-foxe-001',
          conversationId: 'conv-001',
          title: 'Autonomous Flight Radar: SFO to Tokyo Haneda',
          instruction: 'Track nonstop fare drops on Google Flights and hold seats when under $700.',
          status: 'COMPLETED',
          assignedAgent: 'Browser Agent',
          progressPercent: 100,
          resultData: {
            airline: 'United Airlines',
            flightNumber: 'UA875',
            fare: '$642.00',
            discount: '$188 saved',
            heldUntil: '12m remaining',
          },
          steps: [
            {
              id: 'step-102-1',
              taskId: 'task-102',
              stepOrder: 1,
              title: 'Launch Sandboxed Chromium',
              description: 'Instantiated clean residential proxy session',
              toolName: 'browser_open_page',
              status: 'COMPLETED',
              executionMs: 650,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: 'step-102-2',
              taskId: 'task-102',
              stepOrder: 2,
              title: 'Price Extraction & Form Fill',
              description: 'Located non-stop flight at $642.00 and held passenger details',
              toolName: 'browser_fill_form',
              status: 'COMPLETED',
              executionMs: 1240,
              createdAt: new Date(Date.now() - 7100000).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7000000).toISOString(),
          completedAt: new Date(Date.now() - 7000000).toISOString(),
        },
      ],
      connectedApps: [
        {
          id: 'app-gmail',
          userId: 'user-foxe-001',
          provider: 'gmail',
          name: 'Google Workspace Gmail',
          accountEmail: 'alex.vance@workplace.com',
          status: 'connected',
          grantedScopes: ['gmail.readonly', 'gmail.compose', 'gmail.send'],
          capabilities: ['Search Inbox', 'Summarize Threads', 'Draft Replies', 'Send with OK'],
          lastSyncAt: '4 minutes ago',
          inboxPreview: [
            { id: 'gm-1', from: 'Sarah Jenkins (VP Strategy)', subject: 'Q4 Milestone Review & Next Steps', date: '09:14 AM', unread: true },
            { id: 'gm-2', from: 'United Airlines Confirmations', subject: 'Your itinerary hold #UA-89218 is active', date: '08:30 AM', unread: false },
            { id: 'gm-3', from: 'Finance Team', subject: 'October Vendor Invoices Cleared', date: 'Yesterday', unread: false },
          ],
        },
        {
          id: 'app-calendar',
          userId: 'user-foxe-001',
          provider: 'calendar',
          name: 'Google Calendar',
          accountEmail: 'alex.vance@workplace.com',
          status: 'connected',
          grantedScopes: ['calendar.events.readonly', 'calendar.events.freebusy', 'calendar.events'],
          capabilities: ['Check Free Time', 'Create Events', 'Reschedule Conflicts'],
          lastSyncAt: 'Just now',
          calendarPreview: [
            { id: 'cal-1', title: 'Executive Sync with Sarah', start: 'Today, 2:30 PM', end: '3:00 PM', attendees: ['sarah.jenkins@workplace.com'] },
            { id: 'cal-2', title: 'Architecture Review', start: 'Tomorrow, 10:00 AM', end: '11:00 AM', attendees: ['team@workplace.com'] },
          ],
        },
        {
          id: 'app-drive',
          userId: 'user-foxe-001',
          provider: 'drive',
          name: 'Google Drive & Docs',
          accountEmail: 'alex.vance@workplace.com',
          status: 'connected',
          grantedScopes: ['drive.readonly', 'drive.file'],
          capabilities: ['Read Docs', 'Export Spreadsheets', 'Save Verified Outputs'],
          lastSyncAt: '12 minutes ago',
        },
        {
          id: 'app-slack',
          userId: 'user-foxe-001',
          provider: 'slack',
          name: 'Slack Enterprise',
          accountEmail: 'alex.vance@workplace.com',
          status: 'connected',
          grantedScopes: ['channels:read', 'chat:write'],
          capabilities: ['Channel Monitoring', 'Direct Notifications'],
          lastSyncAt: '1 hour ago',
        },
      ],
      automations: [
        {
          id: 'auto-1',
          userId: 'user-foxe-001',
          name: 'Daily 8 AM Morning Briefing',
          naturalInstruction: 'Check my calendar events and unread VIP emails, summarize schedule into a 3-point briefing.',
          cronExpression: '0 8 * * *',
          frequencyLabel: 'Daily at 8:00 AM',
          targetApp: 'Gmail & Google Calendar',
          timezone: 'America/Los_Angeles',
          isActive: true,
          notifyOnRun: true,
          lastRunAt: 'Today, 08:00 AM',
          nextRunAt: 'Tomorrow, 08:00 AM',
          executionHistory: [
            { runAt: 'Today, 08:00 AM', status: 'SUCCESS', summary: 'Briefing generated: 2 meetings, 1 flight hold alert.' },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'auto-2',
          userId: 'user-foxe-001',
          name: 'Hourly Price Drop & Ticket Watcher',
          naturalInstruction: 'Scan United flights SFO-HND every hour and alert if non-stop fare dips below $650.',
          cronExpression: '0 * * * *',
          frequencyLabel: 'Hourly',
          targetApp: 'Browser Agent (Playwright)',
          timezone: 'America/Los_Angeles',
          isActive: true,
          notifyOnRun: true,
          lastRunAt: '1 hour ago',
          nextRunAt: 'In 32 minutes',
          executionHistory: [
            { runAt: '1 hour ago', status: 'SUCCESS', summary: 'Fare held at $642.00. Sentinel card created.' },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      approvals: [
        {
          id: 'appr-101',
          userId: 'user-foxe-001',
          taskId: 'task-101',
          title: 'Authorize Cancellation of Inactive Subscriptions',
          actionType: 'external_api',
          summary: 'Submit automated cancellation for Paramount+ ($11.99/mo) and Bloomberg ($34.99/mo).',
          details: {
            'Subscriptions to Cancel': 'Paramount+ ($11.99), Bloomberg Digital ($34.99)',
            'Estimated Annual Savings': '$563.76 / year',
            'Execution Target': 'Official provider portals via Headless Browser',
            'Card Impact': 'Recurring charges permanently ceased',
          },
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1600000).toISOString(),
        },
      ],
      memories: [
        {
          id: 'mem-1',
          userId: 'user-foxe-001',
          category: 'preference',
          key: 'Preferred Airline Seat',
          value: 'Forward cabin window seat (Rows 10-18)',
          approvedByUser: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'mem-2',
          userId: 'user-foxe-001',
          category: 'goal',
          key: 'Q4 Personal Expense Target',
          value: 'Reduce recurring SaaS/streaming overhead by at least $500 annually',
          approvedByUser: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'mem-3',
          userId: 'user-foxe-001',
          category: 'project',
          key: 'Tokyo Autumn Expedition',
          value: 'Travel window Nov 14 - Nov 21, lodging preferred in Shinjuku/Shibuya',
          approvedByUser: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      files: [
        {
          id: 'file-1',
          userId: 'user-foxe-001',
          filename: 'Q4_Financial_Audit_Report.pdf',
          fileType: 'application/pdf',
          fileSizeBytes: 245760,
          storagePath: '/storage/user-001/Q4_Financial_Audit_Report.pdf',
          extractedText: 'Audit of Q4 Recurring Transactions: Discovered 2 dormant subscriptions totaling $46.98/mo.',
          summary: 'Executive audit report identifying $563.76 in annual recurring SaaS savings.',
          version: 1,
          versions: [{ version: 1, date: 'Today, 09:20 AM', size: 245760 }],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'file-2',
          userId: 'user-foxe-001',
          filename: 'Tokyo_Flight_Itinerary_UA875.txt',
          fileType: 'text/plain',
          fileSizeBytes: 34816,
          storagePath: '/storage/user-001/Tokyo_Flight_Itinerary_UA875.txt',
          extractedText: 'Flight: UA875 Non-stop. SFO to HND. Seat 14A. Fare: $642.00 confirmed.',
          summary: 'Flight itinerary confirmation for Tokyo journey with United Airlines.',
          version: 1,
          versions: [{ version: 1, date: 'Yesterday', size: 34816 }],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-foxe-001',
          title: 'Action Requires Approval',
          message: 'Security Sentinel held subscription cancellation pending your authorization.',
          type: 'approval_request',
          relatedTaskId: 'task-101',
          isRead: false,
          createdAt: new Date(Date.now() - 1600000).toISOString(),
        },
        {
          id: 'notif-2',
          userId: 'user-foxe-001',
          title: 'Flight Price Drop Detected',
          message: 'United Airlines SFO-HND ticket held at $642.00 (saving $188).',
          type: 'task_complete',
          relatedTaskId: 'task-102',
          isRead: false,
          createdAt: new Date(Date.now() - 7000000).toISOString(),
        },
      ],
      auditLogs: [
        {
          id: 'audit-1',
          userId: 'user-foxe-001',
          action: 'HOLD_EXTERNAL_PURCHASE',
          agentName: 'Browser Agent',
          toolName: 'browser_fill_form',
          resource: 'https://united.com/checkout',
          securityDecision: 'APPROVED_BY_USER',
          payload: { flight: 'UA875', fare: 642.00 },
          createdAt: new Date(Date.now() - 7100000).toISOString(),
        },
        {
          id: 'audit-2',
          userId: 'user-foxe-001',
          action: 'SENTINEL_GATE_ENGAGED',
          agentName: 'Security Sentinel',
          toolName: 'security_sentinel_gate',
          resource: 'finance/cancel_subscription',
          securityDecision: 'BLOCKED',
          payload: { reason: 'Irreversible financial cancellation requires explicit OK' },
          createdAt: new Date(Date.now() - 1600000).toISOString(),
        },
      ],
      browserSession: {
        id: 'browser-001',
        userId: 'user-foxe-001',
        url: 'https://www.united.com/checkout/itinerary/UA875',
        title: 'United Airlines - Secure Flight Reservation',
        interactiveMode: false,
        extractedContent: 'United Airlines Checkout: Flight UA875 Nonstop SFO-HND. Fare: $642.00. Passenger: Alex Vance. Seat: 14A. Status: Reservation held.',
        logs: [
          '[CDP] Session launched in Linux Sandbox (Chromium 132 headless)',
          '[Security] Anti-fingerprint proxy engaged: residential_us_west',
          '[Page] GET https://www.united.com/checkout/itinerary/UA875',
          '[DOM] Passenger name injected: Alex Vance',
          '[DOM] Seat 14A selected',
          '[Status] Fare guarantee held at $642.00',
        ],
        status: 'active',
        updatedAt: new Date().toISOString(),
      },
      workspace: {
        id: 'ws-001',
        userId: 'user-foxe-001',
        environment: 'DEVELOPMENT WORKSPACE (ISOLATED RUNTIME)',
        status: 'running',
        cpuPercent: 12,
        memoryPercent: 28,
        diskPercent: 19,
        uptimeSeconds: 7420,
        logs: [
          '[Runtime] Isolated execution workspace active on Node v22.23.2',
          '[TaskScheduler] Cron engine running 2 background automations',
          '[Storage] Persistent database mounted at /data/foxe_database.json',
          '[Sentinel] Security interceptor listening on all outbound tools',
        ],
      },
      devices: [
        {
          id: 'dev-android-01',
          userId: 'user-foxe-001',
          platform: 'android',
          deviceName: 'Google Pixel 9 Pro',
          osVersion: 'Android 15 (AP3A.241005)',
          automationEnabled: true,
          status: 'online',
          lastHeartbeat: '1 minute ago',
          availableApps: [
            { name: 'Gmail', packageName: 'com.google.android.gm', intentAction: 'android.intent.action.VIEW', permitted: true },
            { name: 'Google Calendar', packageName: 'com.google.android.calendar', intentAction: 'android.intent.action.INSERT', permitted: true },
            { name: 'Google Maps', packageName: 'com.google.android.apps.maps', intentAction: 'geo:0,0', permitted: true },
            { name: 'WhatsApp', packageName: 'com.whatsapp', intentAction: 'android.intent.action.SEND', permitted: true },
          ],
        },
        {
          id: 'dev-ios-01',
          userId: 'user-foxe-001',
          platform: 'ios',
          deviceName: 'iPhone 16 Pro Max',
          osVersion: 'iOS 18.2',
          automationEnabled: true,
          status: 'online',
          lastHeartbeat: '3 minutes ago',
          availableApps: [
            { name: 'Apple Mail', packageName: 'com.apple.mobilemail', intentAction: 'message://', permitted: true },
            { name: 'Apple Calendar', packageName: 'com.apple.mobilecal', intentAction: 'calshow:', permitted: true },
            { name: 'Shortcuts Runner', packageName: 'com.apple.shortcuts', intentAction: 'shortcuts://', permitted: true },
          ],
        },
      ],
      emailJobs: [],
    };

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultSeed, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing default database seed:', err);
    }

    return defaultSeed;
  }

  public save() {
    if (this.isWriting) return;
    this.isWriting = true;
    try {
      this.ensureDir();
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Database save failed:', err);
    } finally {
      this.isWriting = false;
    }
  }

  // Dashboard API
  public getDashboardMetrics() {
    const activeTasks = this.data.tasks.filter((t) => t.status === 'RUNNING' || t.status === 'PENDING').length;
    const completedTasks = this.data.tasks.filter((t) => t.status === 'COMPLETED').length;
    const failedTasks = this.data.tasks.filter((t) => t.status === 'FAILED').length;
    const pendingApprovals = this.data.approvals.filter((a) => a.status === 'PENDING').length;
    const connectedAppsCount = this.data.connectedApps.filter((a) => a.status === 'connected').length;
    const upcomingAutomations = this.data.automations.filter((a) => a.isActive).length;

    return {
      activeTasks,
      completedTasks,
      failedTasks,
      pendingApprovals,
      connectedAppsCount,
      upcomingAutomations,
      agentStatus: activeTasks > 0 ? 'Busy (Processing Tasks)' : 'Active (Ready)',
      recentTasks: this.data.tasks.slice(0, 5),
      recentActivity: this.data.auditLogs.slice(0, 6),
      workspaceStatus: this.data.workspace.status,
    };
  }

  // User & Authentication Session
  public getUser(): UserRecord {
    return this.data.users[0];
  }

  public setAuthenticatedUser(email: string, fullName: string, avatarUrl?: string, accessToken?: string): UserRecord {
    const cleanEmail = email.trim().toLowerCase();
    let user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      if (fullName) user.fullName = fullName;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      if (!user.timezone) user.timezone = 'Asia/Kolkata';
    } else {
      user = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        fullName: fullName || cleanEmail.split('@')[0],
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'User',
        timezone: 'Asia/Kolkata',
        language: 'English (US)',
        approvalMode: 'HIGH_RISK_ONLY',
        memoryEnabled: true,
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
      };
      this.data.users.unshift(user);
    }

    // Set as active user (index 0)
    const userIndex = this.data.users.findIndex((u) => u.id === user!.id);
    if (userIndex > 0) {
      const [found] = this.data.users.splice(userIndex, 1);
      this.data.users.unshift(found);
    }

    this.isAuthenticated = true;

    // Automatically connect this same Google account to Gmail in Connected Apps
    let gmailApp = this.data.connectedApps.find((a) => a.provider === 'gmail');
    if (gmailApp) {
      gmailApp.accountEmail = cleanEmail;
      gmailApp.status = 'connected';
      gmailApp.lastSyncAt = 'Just now';
    } else {
      gmailApp = {
        id: `app-gmail-${Date.now()}`,
        userId: user.id,
        provider: 'gmail',
        name: 'Google Workspace Gmail',
        accountEmail: cleanEmail,
        status: 'connected',
        grantedScopes: ['gmail.send', 'gmail.readonly', 'userinfo.email', 'userinfo.profile'],
        capabilities: ['Search Inbox', 'Summarize Threads', 'Send Emails with Approval'],
        lastSyncAt: 'Just now',
        inboxPreview: [
          { id: 'msg-seed-1', from: 'Google Security', subject: 'Account session verified', date: 'Just now', unread: false },
        ],
      };
      this.data.connectedApps.unshift(gmailApp);
    }

    if (accessToken) {
      this.userTokens.set(user.id, accessToken);
      this.userTokens.set('active', accessToken);
    }

    this.addAuditLog(
      'USER_SIGN_IN',
      'Auth Sentinel',
      'google_oauth',
      `users/${user.id}`,
      'PERMITTED',
      { email: cleanEmail, fullName: user.fullName }
    );

    this.save();
    return user;
  }

  public getAccessToken(userId?: string): string | undefined {
    if (userId && this.userTokens.has(userId)) {
      return this.userTokens.get(userId);
    }
    return this.userTokens.get('active');
  }

  public setAccessToken(token: string, userId?: string) {
    if (userId) {
      this.userTokens.set(userId, token);
    }
    this.userTokens.set('active', token);
  }

  public logoutUser() {
    this.isAuthenticated = false;
    this.userTokens.clear();
    this.addAuditLog(
      'USER_SIGN_OUT',
      'Auth Sentinel',
      'session_manager',
      'session/current',
      'PERMITTED',
      { action: 'signed_out' }
    );
    this.save();
  }

  public getSessionStatus() {
    return {
      authenticated: this.isAuthenticated,
      user: this.isAuthenticated ? this.data.users[0] : null,
    };
  }

  public updateUser(updates: Partial<UserRecord>) {
    this.data.users[0] = { ...this.data.users[0], ...updates };
    this.save();
    return this.data.users[0];
  }

  // Conversations & Chat
  public getConversations() {
    return this.data.conversations;
  }

  public createConversation(title: string): ConversationRecord {
    const conv: ConversationRecord = {
      id: `conv-${Date.now()}`,
      userId: this.data.users[0].id,
      title,
      model: 'gemini-3.8-flash',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.conversations.unshift(conv);
    this.save();
    return conv;
  }

  public getMessages(conversationId: string) {
    return this.data.messages.filter((m) => m.conversationId === conversationId);
  }

  public addMessage(msg: Omit<MessageRecord, 'id' | 'createdAt'>): MessageRecord {
    const record: MessageRecord = {
      ...msg,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.messages.push(record);
    this.save();
    return record;
  }

  public setFeedback(messageId: string, rating: 'like' | 'dislike') {
    const msg = this.data.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.feedbackRating = rating;
      this.save();
    }
  }

  // Tasks
  public getTasks() {
    return this.data.tasks;
  }

  public getTaskById(taskId: string) {
    return this.data.tasks.find((t) => t.id === taskId);
  }

  public createTask(title: string, instruction: string, assignedAgent = 'Main Orchestrator'): TaskRecord {
    const task: TaskRecord = {
      id: `task-${Date.now()}`,
      userId: this.data.users[0].id,
      title,
      instruction,
      status: 'RUNNING',
      assignedAgent,
      progressPercent: 10,
      steps: [
        {
          id: `step-${Date.now()}-1`,
          taskId: `task-${Date.now()}`,
          stepOrder: 1,
          title: 'Planning & Intent Verification',
          description: 'Orchestrator breaking command into atomic subtasks',
          toolName: 'orchestrator_planner',
          status: 'COMPLETED',
          executionMs: 140,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.tasks.unshift(task);

    // Record audit log
    this.addAuditLog('TASK_INITIALIZED', assignedAgent, 'orchestrator_planner', `task/${task.id}`, 'PERMITTED', { title });
    this.save();
    return task;
  }

  public updateTaskStatus(taskId: string, status: TaskRecord['status'], progressPercent?: number, resultData?: any, error?: string) {
    const task = this.data.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (progressPercent !== undefined) task.progressPercent = progressPercent;
      if (resultData !== undefined) task.resultData = resultData;
      if (error !== undefined) task.errorMessage = error;
      task.updatedAt = new Date().toISOString();
      if (status === 'COMPLETED') task.completedAt = new Date().toISOString();

      if (status === 'COMPLETED') {
        this.addNotification('Task Completed Successfully', `FOXE finished: "${task.title}"`, 'task_complete', taskId);
      } else if (status === 'FAILED') {
        this.addNotification('Task Execution Failed', `FOXE encountered error: ${error || 'Unknown issue'}`, 'task_failed', taskId);
      }
      this.save();
    }
    return task;
  }

  public deleteTask(taskId: string) {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.data.approvals = this.data.approvals.filter((a) => a.taskId !== taskId);
    this.save();
  }

  public cancelTask(taskId: string) {
    const task = this.data.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'CANCELLED';
      task.updatedAt = new Date().toISOString();
      task.errorMessage = 'Task cancelled by user';
      const appr = this.data.approvals.find((a) => a.taskId === taskId && a.status === 'PENDING');
      if (appr) {
        appr.status = 'REJECTED';
        appr.reviewedAt = new Date().toISOString();
      }

      // Also cancel associated background email job if pending or queued
      const emailJob = this.getEmailJobByTaskId(taskId);
      if (emailJob && (emailJob.status === 'PENDING' || emailJob.status === 'QUEUED')) {
        emailJob.status = 'CANCELLED';
        emailJob.completedAt = new Date().toISOString();
        emailJob.errorDetails = 'Task cancelled by user';
      }

      this.addAuditLog('TASK_CANCELLED', 'Security Sentinel', 'task_manager', `tasks/${taskId}`, 'PERMITTED', { taskId });
      this.addNotification('Task Cancelled', `Task "${task.title}" has been cancelled.`, 'task_failed', taskId);
      this.save();
    }
    return task;
  }

  public retryTask(taskId: string) {
    const task = this.data.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'RUNNING';
      task.progressPercent = 30;
      task.errorMessage = undefined;
      task.updatedAt = new Date().toISOString();
      task.steps.push({
        id: `step-${Date.now()}-retry`,
        taskId,
        stepOrder: (task.steps?.length || 0) + 1,
        title: 'Task Execution Resumed',
        description: 'Re-evaluating parameters and re-attempting execution',
        toolName: 'orchestrator_retry',
        status: 'RUNNING',
        executionMs: 120,
        createdAt: new Date().toISOString(),
      });

      // If associated email job is failed or cancelled, reset to QUEUED
      const emailJob = this.getEmailJobByTaskId(taskId);
      if (emailJob && (emailJob.status === 'FAILED' || emailJob.status === 'CANCELLED')) {
        emailJob.status = 'QUEUED';
        emailJob.retryCount = 0;
        emailJob.errorDetails = undefined;
        emailJob.completedAt = undefined;
      }

      this.addAuditLog('TASK_RETRY', 'Main Orchestrator', 'task_manager', `tasks/${taskId}`, 'PERMITTED', { taskId });
      this.save();
    }
    return task;
  }

  // Email Jobs Management (Persistent Background Queue)
  public getEmailJobs(): EmailJobRecord[] {
    if (!this.data.emailJobs) this.data.emailJobs = [];
    return this.data.emailJobs;
  }

  public getEmailJobById(id: string): EmailJobRecord | undefined {
    return this.getEmailJobs().find((j) => j.id === id);
  }

  public getEmailJobByTaskId(taskId: string): EmailJobRecord | undefined {
    return this.getEmailJobs().find((j) => j.taskId === taskId);
  }

  public createEmailJob(params: {
    userId: string;
    taskId: string;
    conversationId?: string;
    connectedGmailAccount: string;
    recipient: string;
    subject: string;
    message: string;
    idempotencyKey: string;
  }): { job: EmailJobRecord; isDuplicate: boolean } {
    if (!this.data.emailJobs) this.data.emailJobs = [];

    // Duplicate protection / idempotency: check if identical job exists and is active or recently sent
    const existing = this.data.emailJobs.find(
      (j) => j.idempotencyKey === params.idempotencyKey && j.status !== 'FAILED' && j.status !== 'CANCELLED'
    );
    if (existing) {
      return { job: existing, isDuplicate: true };
    }

    const job: EmailJobRecord = {
      id: `job-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId,
      taskId: params.taskId,
      conversationId: params.conversationId,
      connectedGmailAccount: params.connectedGmailAccount,
      recipient: params.recipient,
      subject: params.subject,
      message: params.message,
      status: 'QUEUED',
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
      idempotencyKey: params.idempotencyKey,
    };

    this.data.emailJobs.unshift(job);
    this.save();
    return { job, isDuplicate: false };
  }

  public updateEmailJob(id: string, updates: Partial<EmailJobRecord>): EmailJobRecord | undefined {
    const job = this.getEmailJobById(id);
    if (job) {
      Object.assign(job, updates);
      this.save();
    }
    return job;
  }

  public cancelEmailJob(id: string): EmailJobRecord | undefined {
    const job = this.getEmailJobById(id);
    if (job && (job.status === 'PENDING' || job.status === 'QUEUED')) {
      job.status = 'CANCELLED';
      job.completedAt = new Date().toISOString();
      job.errorDetails = 'Job cancelled by user';
      this.save();
    }
    return job;
  }

  public disconnectApp(appIdOrProvider: string) {
    const app = this.data.connectedApps.find((a) => a.id === appIdOrProvider || a.provider === appIdOrProvider);
    if (app) {
      app.status = 'disconnected';
      app.lastSyncAt = 'Disconnected';
      if (app.provider === 'gmail') {
        this.userTokens.delete('active');
      }
      this.addAuditLog(
        'APP_DISCONNECTED',
        'Security Sentinel',
        'oauth_connector',
        `connected_accounts/${app.provider}`,
        'PERMITTED',
        { provider: app.provider }
      );
      this.save();
    }
    return app;
  }

  // Connected Apps
  public getConnectedApps() {
    return this.data.connectedApps;
  }

  public toggleAppConnection(appId: string) {
    const app = this.data.connectedApps.find((a) => a.id === appId);
    if (app) {
      const nextStatus = app.status === 'connected' ? 'disconnected' : 'connected';
      app.status = nextStatus;
      app.lastSyncAt = nextStatus === 'connected' ? 'Just now' : 'Disconnected';
      this.addAuditLog(
        nextStatus === 'connected' ? 'APP_CONNECTED' : 'APP_DISCONNECTED',
        'Security Sentinel',
        'oauth_connector',
        `connected_accounts/${app.provider}`,
        nextStatus === 'connected' ? 'PERMITTED' : 'PERMITTED',
        { provider: app.provider }
      );
      this.save();
    }
    return app;
  }

  public syncApp(appId: string) {
    const app = this.data.connectedApps.find((a) => a.id === appId);
    if (app) {
      app.lastSyncAt = 'Just now';
      this.save();
    }
    return app;
  }

  // Automations
  public getAutomations() {
    return this.data.automations;
  }

  public createAutomation(name: string, instruction: string, frequencyLabel: string, targetApp: string): AutomationRecord {
    const auto: AutomationRecord = {
      id: `auto-${Date.now()}`,
      userId: this.data.users[0].id,
      name,
      naturalInstruction: instruction,
      cronExpression: frequencyLabel.includes('Hour') ? '0 * * * *' : '0 8 * * *',
      frequencyLabel,
      targetApp,
      timezone: 'America/Los_Angeles',
      isActive: true,
      notifyOnRun: true,
      nextRunAt: 'Tomorrow, 08:00 AM',
      executionHistory: [],
      createdAt: new Date().toISOString(),
    };
    this.data.automations.unshift(auto);
    this.save();
    return auto;
  }

  public toggleAutomation(id: string) {
    const auto = this.data.automations.find((a) => a.id === id);
    if (auto) {
      auto.isActive = !auto.isActive;
      this.save();
    }
    return auto;
  }

  public runAutomation(id: string) {
    const auto = this.data.automations.find((a) => a.id === id);
    if (auto) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      auto.lastRunAt = `Today, ${now}`;
      auto.executionHistory.unshift({
        runAt: `Today, ${now}`,
        status: 'SUCCESS',
        summary: `Executed scheduled routine "${auto.name}". Verified outputs synced.`,
      });
      this.addNotification('Automation Executed', `Automation "${auto.name}" ran successfully.`, 'automation_run');
      this.save();
    }
    return auto;
  }

  public deleteAutomation(id: string) {
    this.data.automations = this.data.automations.filter((a) => a.id !== id);
    this.save();
  }

  // Approvals (Security Sentinel)
  public getApprovals() {
    return this.data.approvals;
  }

  public decideApproval(id: string, decision: 'APPROVED' | 'REJECTED') {
    const appr = this.data.approvals.find((a) => a.id === id);
    if (appr) {
      appr.status = decision;
      appr.reviewedAt = new Date().toISOString();

      this.addAuditLog(
        decision === 'APPROVED' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
        'Security Sentinel',
        appr.actionType,
        `approvals/${id}`,
        decision === 'APPROVED' ? 'APPROVED_BY_USER' : 'REJECTED_BY_USER',
        { title: appr.title, action: appr.actionType }
      );

      // If task exists, update it
      if (appr.taskId) {
        if (decision === 'APPROVED') {
          this.updateTaskStatus(appr.taskId, 'COMPLETED', 100, { approved: true, timestamp: new Date().toISOString() });
        } else {
          this.updateTaskStatus(appr.taskId, 'CANCELLED', undefined, undefined, 'User declined approval request.');
        }
      }

      this.save();
    }
    return appr;
  }

  // Memories
  public getMemories() {
    return this.data.memories;
  }

  public addMemory(category: MemoryRecord['category'], key: string, value: string): MemoryRecord {
    const mem: MemoryRecord = {
      id: `mem-${Date.now()}`,
      userId: this.data.users[0].id,
      category,
      key,
      value,
      approvedByUser: true,
      createdAt: new Date().toISOString(),
    };
    this.data.memories.unshift(mem);
    this.save();
    return mem;
  }

  public deleteMemory(id: string) {
    this.data.memories = this.data.memories.filter((m) => m.id !== id);
    this.save();
  }

  // Files
  public getFiles() {
    return this.data.files;
  }

  public addFile(filename: string, fileType: string, sizeBytes: number, textContent: string): FileRecord {
    const file: FileRecord = {
      id: `file-${Date.now()}`,
      userId: this.data.users[0].id,
      filename,
      fileType,
      fileSizeBytes: sizeBytes,
      storagePath: `/storage/user-001/${filename}`,
      extractedText: textContent,
      summary: `Extracted ${textContent.slice(0, 100)}...`,
      version: 1,
      versions: [{ version: 1, date: 'Just now', size: sizeBytes }],
      createdAt: new Date().toISOString(),
    };
    this.data.files.unshift(file);
    this.save();
    return file;
  }

  public renameFile(id: string, newName: string) {
    const f = this.data.files.find((file) => file.id === id);
    if (f) {
      f.filename = newName;
      this.save();
    }
    return f;
  }

  public deleteFile(id: string) {
    this.data.files = this.data.files.filter((f) => f.id !== id);
    this.save();
  }

  // Notifications
  public getNotifications() {
    return this.data.notifications;
  }

  public addNotification(title: string, message: string, type: NotificationRecord['type'], relatedTaskId?: string) {
    const notif: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: this.data.users[0].id,
      title,
      message,
      type,
      relatedTaskId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationRead(id: string) {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      this.save();
    }
    return n;
  }

  public markAllNotificationsRead() {
    this.data.notifications.forEach((n) => (n.isRead = true));
    this.save();
  }

  public deleteNotification(id: string) {
    this.data.notifications = this.data.notifications.filter((n) => n.id !== id);
    this.save();
  }

  // Audit Logs
  public getAuditLogs() {
    return this.data.auditLogs;
  }

  public addAuditLog(action: string, agentName: string, toolName: string, resource: string, decision: AuditLogRecord['securityDecision'], payload?: any) {
    const log: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: this.data.users[0].id,
      action,
      agentName,
      toolName,
      resource,
      securityDecision: decision,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  // Browser Session
  public getBrowserSession() {
    return this.data.browserSession;
  }

  public updateBrowserSession(updates: Partial<BrowserSessionRecord>) {
    this.data.browserSession = {
      ...this.data.browserSession,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.browserSession;
  }

  // Workspace
  public getWorkspace() {
    return this.data.workspace;
  }

  public updateWorkspaceStatus(status: WorkspaceRecord['status']) {
    this.data.workspace.status = status;
    this.data.workspace.logs.unshift(`[${new Date().toLocaleTimeString()}] Workspace state changed to: ${status}`);
    this.save();
    return this.data.workspace;
  }

  // Devices
  public getDevices() {
    return this.data.devices;
  }

  public toggleDeviceAutomation(deviceId: string) {
    const dev = this.data.devices.find((d) => d.id === deviceId);
    if (dev) {
      dev.automationEnabled = !dev.automationEnabled;
      this.save();
    }
    return dev;
  }
}

export const db = new DatabaseStore();
