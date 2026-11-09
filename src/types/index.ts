export type TabType = 'feed' | 'spaces' | 'goals' | 'ideas' | 'artifacts' | 'connectors';

export interface VmBrowserState {
  isOpen: boolean;
  activeUrl: string;
  title: string;
  isLoading: boolean;
  interactiveMode: boolean; // Take over control mode
  currentStepDescription: string;
  targetDomain: string;
  viewportLogs: string[];
  mockPageContent?: {
    heading: string;
    subheading: string;
    fields: { label: string; value: string; filled: boolean }[];
    statusPill: string;
  };
}

export interface PermissionApproval {
  id: string;
  title: string;
  actionType: 'purchase' | 'email_send' | 'calendar_update' | 'subscription_cancel' | 'reservation';
  summary: string;
  amount?: string;
  recipient?: string;
  service?: string;
  details: Record<string, string>;
  status: 'pending' | 'approved' | 'declined' | 'edited';
  createdAt: string;
}

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_approval';
  actionIcon?: string;
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'muse' | 'system';
  content: string;
  timestamp: string;
  steps?: TaskStep[];
  approvalRequest?: PermissionApproval;
  vmSnapshot?: {
    domain: string;
    action: string;
  };
  artifactRef?: {
    id: string;
    title: string;
    type: 'document' | 'spreadsheet' | 'summary' | 'ticket';
  };
}

export interface SpaceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'finance' | 'wellness' | 'shopping' | 'travel';
  gradient: string;
  lastRun?: string;
  stats: string;
  routinesCount: number;
  tags: string[];
  isCustom?: boolean;
}

export interface GoalSubTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  automatedByMuse?: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'finance' | 'health' | 'career' | 'travel' | 'lifestyle';
  progress: number; // 0 to 100
  targetDate: string;
  status: 'on_track' | 'needs_review' | 'completed' | 'paused';
  subtasks: GoalSubTask[];
  autonomousCadence: string; // e.g. "Daily background check", "Weekly summary"
  impactMetric: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  badge: 'high_savings' | 'time_saver' | 'optimization' | 'habit';
  description: string;
  impact: string;
  suggestedPrompt: string;
  sourceConnector: string;
  isDismissed?: boolean;
}

export interface ArtifactItem {
  id: string;
  title: string;
  category: 'document' | 'spreadsheet' | 'summary' | 'receipt' | 'itinerary';
  size: string;
  createdDate: string;
  content: string;
  dataRows?: Record<string, any>[];
  tags: string[];
}

export interface ConnectorItem {
  id: string;
  name: string;
  category: 'communication' | 'productivity' | 'finance' | 'social' | 'travel';
  icon: string;
  connected: boolean;
  status: 'active' | 'syncing' | 'permission_requested' | 'disconnected';
  permissions: string[];
  lastSync: string;
}
