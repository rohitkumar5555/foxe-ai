import {
  PermissionApproval,
  TaskStep,
  GoalItem,
  SpaceItem,
  IdeaItem,
  ArtifactItem,
  ConnectorItem,
} from '../types';

export type UserIntent =
  | 'flight_booking'
  | 'subscription_audit'
  | 'price_tracker'
  | 'create_space'
  | 'email_draft'
  | 'fitness_goal'
  | 'general_chat';

export interface PlanResult {
  intent: UserIntent;
  summary: string;
  steps: TaskStep[];
  approval?: PermissionApproval;
  vmDetails?: {
    domain: string;
    url: string;
    pageTitle: string;
    action: string;
    fields: { label: string; value: string; filled: boolean }[];
  };
  artifact?: ArtifactItem;
}

/**
 * Pure function: Detects intent from user input prompt
 */
export function detectUserIntent(prompt: string): UserIntent {
  const lower = prompt.toLowerCase();
  if (lower.includes('flight') || lower.includes('travel') || lower.includes('hotel') || lower.includes('tokyo') || lower.includes('book')) {
    return 'flight_booking';
  }
  if (lower.includes('subscription') || lower.includes('cancel') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('audit')) {
    return 'subscription_audit';
  }
  if (lower.includes('price') || lower.includes('deal') || lower.includes('shop') || lower.includes('amazon') || lower.includes('headphone') || lower.includes('buy')) {
    return 'price_tracker';
  }
  if (lower.includes('space') || lower.includes('mini app') || lower.includes('workflow') || lower.includes('routine') || lower.includes('tracker')) {
    return 'create_space';
  }
  if (lower.includes('email') || lower.includes('send') || lower.includes('draft') || lower.includes('message') || lower.includes('boss') || lower.includes('client')) {
    return 'email_draft';
  }
  if (lower.includes('fitness') || lower.includes('workout') || lower.includes('gym') || lower.includes('calorie') || lower.includes('diet') || lower.includes('health')) {
    return 'fitness_goal';
  }
  return 'general_chat';
}

/**
 * Pure function: Generates multi-step autonomous execution plan and permission approval card
 */
export function generateAgentPlan(prompt: string, intent: UserIntent): PlanResult {
  const idSuffix = Math.floor(Math.random() * 9000 + 1000);

  switch (intent) {
    case 'flight_booking':
      return {
        intent,
        summary: "Found a non-stop United flight to Tokyo for $642 ($188 cheaper). Ready to hold your seat.",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Secure VM Initialization',
            description: 'Spun up isolated headless browser with anti-fingerprint credentials',
            status: 'completed',
            timestamp: '0.4s',
          },
          {
            id: `step-${idSuffix}-2`,
            title: 'Aggregate Flight Quotes',
            description: 'Scanned 14 airline direct sites & OTAs across flexible departure windows',
            status: 'completed',
            timestamp: '1.2s',
          },
          {
            id: `step-${idSuffix}-3`,
            title: 'Seat & Bag Verification',
            description: 'Verified carry-on included and selected window seat 14A',
            status: 'completed',
            timestamp: '1.9s',
          },
          {
            id: `step-${idSuffix}-4`,
            title: 'Awaiting Human-in-the-Loop OK',
            description: 'Ready to proceed to checkout using connected Virtual Card ($642.00)',
            status: 'requires_approval',
            timestamp: 'Now',
          },
        ],
        approval: {
          id: `appr-${idSuffix}`,
          title: 'Confirm Flight Ticket Purchase',
          actionType: 'purchase',
          summary: 'United Airlines non-stop roundtrip (SFO ⇄ HND), Nov 14 - Nov 21',
          amount: '$642.00',
          service: 'United Airlines / Google Flights',
          details: {
            'Flight Route': 'SFO ➔ HND (Direct)',
            'Departure Date': 'Nov 14, 11:30 AM',
            'Return Date': 'Nov 21, 04:45 PM',
            'Passenger': 'Alex Morgan',
            'Payment Method': 'Meta Pay Virtual Card (•••• 8829)',
            'Total Charge': '$642.00 (Price guaranteed)',
          },
          status: 'pending',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        vmDetails: {
          domain: 'united.com',
          url: 'https://www.united.com/checkout/itinerary/UA875',
          pageTitle: 'United Airlines - Secure Review & Purchase',
          action: 'Cart reserved (expires in 12m) — awaiting user authorization',
          fields: [
            { label: 'Passenger Name', value: 'Alex Morgan', filled: true },
            { label: 'Seat Selection', value: '14A (Standard Economy)', filled: true },
            { label: 'Carry-on Bag', value: 'Included (1 piece)', filled: true },
            { label: 'Total Due', value: '$642.00 USD', filled: true },
          ],
        },
        artifact: {
          id: `art-${idSuffix}`,
          title: 'Tokyo Trip Itinerary & Flight Confirmation Draft.pdf',
          category: 'itinerary',
          size: '342 KB',
          createdDate: 'Just now',
          content: 'Flight: UA875 Non-stop\nDepart: San Francisco (SFO)\nArrive: Tokyo Haneda (HND)\nLodging Recommendation: Shinjuku Granbell\nTransit Pass: Suica IC Virtual',
          tags: ['Travel', 'Tokyo', 'Flights', 'Pending'],
        },
      };

    case 'subscription_audit':
      return {
        intent,
        summary: "Found 2 unused subscriptions: Paramount+ ($11.99/mo) and Bloomberg ($34.99/mo). Saving $46.98/mo.",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Bank Statement Scrape',
            description: 'Analyzed recurring transactions from past 90 days',
            status: 'completed',
            timestamp: '0.3s',
          },
          {
            id: `step-${idSuffix}-2`,
            title: 'Usage Cross-Reference',
            description: 'Checked login activity on Paramount+ (0 logins in 64 days) and gym app',
            status: 'completed',
            timestamp: '0.9s',
          },
          {
            id: `step-${idSuffix}-3`,
            title: 'Cancellation Flow Queued',
            description: 'Navigated subscription cancellation portal in VM',
            status: 'requires_approval',
            timestamp: 'Now',
          },
        ],
        approval: {
          id: `appr-${idSuffix}`,
          title: 'Authorize Cancellation of Inactive Subscriptions',
          actionType: 'subscription_cancel',
          summary: 'Cancel Paramount+ ($11.99/mo) and Bloomberg Digital ($34.99/mo)',
          amount: 'Save $46.98/mo',
          service: 'Paramount+ & Bloomberg',
          details: {
            'Subscriptions': 'Paramount+ Premium ($11.99), Bloomberg Digital ($34.99)',
            'Last Usage': 'Over 60 days ago',
            'Annual Savings': '$563.76 / year',
            'Action': 'Automated form submission & confirmation email archive',
          },
          status: 'pending',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        vmDetails: {
          domain: 'paramountplus.com',
          url: 'https://secure.paramountplus.com/account/cancel',
          pageTitle: 'Paramount+ Account Management - Cancel Plan',
          action: 'Reached confirmation screen — waiting for single-click OK',
          fields: [
            { label: 'Reason for canceling', value: 'Not using enough', filled: true },
            { label: 'Current Billing Cycle', value: 'Active until Nov 18', filled: true },
            { label: 'Refund eligibility', value: 'Pro-rated $4.20 credit', filled: true },
          ],
        },
        artifact: {
          id: `art-${idSuffix}`,
          title: '2026 Subscription Audit Report.xlsx',
          category: 'spreadsheet',
          size: '128 KB',
          createdDate: 'Just now',
          content: 'Service, Cost/Mo, Status, Last Used\nParamount+, $11.99, Inactive, 64d ago\nBloomberg, $34.99, Inactive, 81d ago\nSpotify, $10.99, Active, Today\niCloud+, $2.99, Active, Today',
          tags: ['Finance', 'Audit', 'Savings'],
        },
      };

    case 'price_tracker':
      return {
        intent,
        summary: "Tracked Sony WH-1000XM5 headphones across Best Buy, Amazon, and B&H. The price just dropped by $50 to $348.00 at Best Buy with 2-day delivery.",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Price History Cross-Check',
            description: 'Lowest recorded price in 90 days is $348 (matches current deal)',
            status: 'completed',
            timestamp: '0.5s',
          },
          {
            id: `step-${idSuffix}-2`,
            title: 'Cart Pre-Fill',
            description: 'Item held in cart for 30 minutes with price lock',
            status: 'requires_approval',
            timestamp: 'Now',
          },
        ],
        approval: {
          id: `appr-${idSuffix}`,
          title: 'Confirm Purchase: Sony WH-1000XM5',
          actionType: 'purchase',
          summary: 'Best Buy - Silver Finish, Free 2-Day Shipping',
          amount: '$348.00',
          service: 'Best Buy via Meta VM',
          details: {
            'Item': 'Sony WH-1000XM5 Noise-Canceling Headphones',
            'Original Price': '$399.99',
            'Discounted Price': '$348.00 (Save $51.99)',
            'Shipping Address': 'Home (San Francisco, CA)',
            'Delivery Date': 'Wednesday, Nov 12',
          },
          status: 'pending',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };

    case 'email_draft':
      return {
        intent,
        summary: "I've drafted a polite, professional reply to Sarah regarding the Q4 review timeline, highlighting deliverables and scheduling a 20-min sync.",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Thread Context Ingestion',
            description: 'Read 4 preceding messages in Gmail thread',
            status: 'completed',
            timestamp: '0.4s',
          },
          {
            id: `step-${idSuffix}-2`,
            title: 'Calendar Free/Busy Analysis',
            description: 'Found open slots on Thursday at 2:30 PM and 4:00 PM',
            status: 'completed',
            timestamp: '0.7s',
          },
          {
            id: `step-${idSuffix}-3`,
            title: 'Outbound Authorization',
            description: 'Waiting for your review before sending from your connected Gmail',
            status: 'requires_approval',
            timestamp: 'Now',
          },
        ],
        approval: {
          id: `appr-${idSuffix}`,
          title: 'Approve & Send Email to Sarah Jenkins',
          actionType: 'email_send',
          summary: 'Subject: Re: Q4 Strategy Review & Next Steps',
          recipient: 'sarah.jenkins@acme-corp.com',
          service: 'Google Workspace Gmail',
          details: {
            'To': 'sarah.jenkins@acme-corp.com',
            'Subject': 'Re: Q4 Strategy Review & Next Steps',
            'Key Points': 'Agreed on Friday milestone; proposed 20m prep call on Thursday 2:30 PM',
            'Tone': 'Warm, executive, succinct',
          },
          status: 'pending',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };

    case 'create_space':
      return {
        intent,
        summary: "I've created a custom 'Space' tailored to your workflow with automated background routines, real-time widgets, and daily notifications.",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Routine Architecture Generated',
            description: 'Defined schedule, triggers, and data schema',
            status: 'completed',
            timestamp: '0.6s',
          },
          {
            id: `step-${idSuffix}-2`,
            title: 'Widget Deployed to Spaces',
            description: 'Added to your personal Spaces dashboard',
            status: 'completed',
            timestamp: '0.9s',
          },
        ],
      };

    case 'fitness_goal':
      return {
        intent,
        summary: "I've outlined a 4-week Progressive Strength & Mobility program with daily reminders and Apple Health/Whoop sync.",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Schedule Integration',
            description: 'Allocated 45-minute blocks at 7:00 AM on Mon, Wed, Fri',
            status: 'completed',
            timestamp: '0.5s',
          },
          {
            id: `step-${idSuffix}-2`,
            title: 'Goal Registered',
            description: 'Tracking sub-milestones on your Goals dashboard',
            status: 'completed',
            timestamp: '0.8s',
          },
        ],
      };

    default:
      return {
        intent: 'general_chat',
        summary: "I'm on it. What would you like me to do?",
        steps: [
          {
            id: `step-${idSuffix}-1`,
            title: 'Query Ingestion',
            description: 'Parsed context and checked active connected permissions',
            status: 'completed',
            timestamp: '0.2s',
          },
        ],
      };
  }
}

/**
 * Pure function: Computes goal progress percentage based on subtasks
 */
export function calculateGoalProgress(subtasks: { completed: boolean }[]): number {
  if (!subtasks || subtasks.length === 0) return 0;
  const completedCount = subtasks.filter((t) => t.completed).length;
  return Math.round((completedCount / subtasks.length) * 100);
}

/**
 * Pure function: Updates approval status and returns updated approval object
 */
export function processApprovalDecision(
  approval: PermissionApproval,
  decision: 'approved' | 'declined' | 'edited'
): PermissionApproval {
  return {
    ...approval,
    status: decision,
  };
}

/**
 * Pure function: Filter and search items in Library / Artifacts
 */
export function filterArtifacts(
  artifacts: ArtifactItem[],
  query: string,
  categoryFilter: string
): ArtifactItem[] {
  return artifacts.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    return matchesCategory && matchesQuery;
  });
}

/**
 * Pure function: Computes savings metric from ideas
 */
export function calculatePotentialSavings(ideas: IdeaItem[]): number {
  return ideas.reduce((total, item) => {
    const match = item.impact.match(/\$(\d+)/);
    if (match && match[1]) {
      return total + parseInt(match[1], 10);
    }
    return total;
  }, 0);
}

/**
 * Initial mock data representing Meta Muse real experience
 */
export const INITIAL_SPACES: SpaceItem[] = [
  {
    id: 'space-1',
    title: 'Bill & Subscription Guard',
    description: 'Monitors renewals and flags unused charges.',
    icon: 'ShieldCheck',
    category: 'finance',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30',
    lastRun: '2h ago',
    stats: 'Saved $184 this year',
    routinesCount: 3,
    tags: ['Automated', 'Plaid'],
  },
  {
    id: 'space-2',
    title: 'Morning Briefing',
    description: 'Daily audio overview of your schedule and key emails.',
    icon: 'Sunrise',
    category: 'productivity',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30',
    lastRun: '7:00 AM',
    stats: 'Daily at 7 AM',
    routinesCount: 4,
    tags: ['Voice', 'Calendar'],
  },
  {
    id: 'space-3',
    title: 'Travel Concierge',
    description: 'Watches flight fare drops and holds bookings in VM.',
    icon: 'Plane',
    category: 'travel',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/30',
    lastRun: 'Yesterday',
    stats: '1 itinerary',
    routinesCount: 5,
    tags: ['Live VM', 'Flights'],
  },
  {
    id: 'space-4',
    title: 'Fitness & Sleep Coach',
    description: 'Calculates recovery scores and logs daily workouts.',
    icon: 'Activity',
    category: 'wellness',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30',
    lastRun: 'Today',
    stats: '14-day streak',
    routinesCount: 2,
    tags: ['Health Connect'],
  },
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Optimize Monthly Recurring Subscriptions',
    category: 'finance',
    progress: 66,
    targetDate: 'Nov 30, 2026',
    status: 'on_track',
    autonomousCadence: 'Daily background VM audit',
    impactMetric: '$564/yr Savings',
    subtasks: [
      { id: 'st-1', title: 'Audit credit card & bank statements for recurring items', completed: true, automatedByMuse: true },
      { id: 'st-2', title: 'Flag unused memberships (Paramount+, Bloomberg)', completed: true, automatedByMuse: true },
      { id: 'st-3', title: 'Execute cancellation via secure browser VM', completed: false, automatedByMuse: true },
      { id: 'st-4', title: 'Negotiate annual discount on Internet service bill', completed: false, automatedByMuse: true },
    ],
  },
  {
    id: 'goal-2',
    title: 'Plan & Book Tokyo Autumn Expedition',
    category: 'travel',
    progress: 50,
    targetDate: 'Dec 15, 2026',
    status: 'on_track',
    autonomousCadence: 'Hourly fare tracker',
    impactMetric: '$320 Fare saved',
    subtasks: [
      { id: 'st-5', title: 'Set up Google Flights & Skyscanner price radar', completed: true, automatedByMuse: true },
      { id: 'st-6', title: 'Hold SFO ⇄ HND nonstop ticket at $642', completed: true, automatedByMuse: true },
      { id: 'st-7', title: 'Obtain user approval card for payment checkout', completed: false, automatedByMuse: false },
      { id: 'st-8', title: 'Reserve 4 nights at Shinjuku hotel & Suica card', completed: false, automatedByMuse: true },
    ],
  },
  {
    id: 'goal-3',
    title: 'Maintain 5-Day Weekly Movement & Sleep Hygiene',
    category: 'health',
    progress: 80,
    targetDate: 'Ongoing',
    status: 'on_track',
    autonomousCadence: 'Sync every morning 6:30 AM',
    impactMetric: '7.8 hrs avg sleep',
    subtasks: [
      { id: 'st-9', title: 'Schedule 45m workout blocks in Google Calendar', completed: true, automatedByMuse: true },
      { id: 'st-10', title: 'Log 8,000+ daily steps across 5 days', completed: true, automatedByMuse: false },
      { id: 'st-11', title: 'Trigger wind-down phone alert at 10:30 PM', completed: true, automatedByMuse: true },
      { id: 'st-12', title: 'Weekly health report compiled to Artifacts', completed: false, automatedByMuse: true },
    ],
  },
];

export const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: 'idea-1',
    title: 'Cut unused streaming service',
    badge: 'high_savings',
    description: 'You haven’t opened Paramount+ in 64 days. Canceling now saves $11.99 every month ($143.88/yr).',
    impact: '$144/year',
    suggestedPrompt: 'Audit my streaming subscriptions and cancel Paramount+',
    sourceConnector: 'Plaid Bank Sync',
  },
  {
    id: 'idea-2',
    title: 'Flash fare drop for Tokyo flights',
    badge: 'time_saver',
    description: 'United Airlines non-stop roundtrip dropped by $188 for your travel window in November.',
    impact: 'Save $188',
    suggestedPrompt: 'Lock in the $642 United flight to Tokyo now',
    sourceConnector: 'Google Flights Tracker',
  },
  {
    id: 'idea-3',
    title: 'Calendar overlap resolved',
    badge: 'optimization',
    description: 'Product Sync overlaps with Dentist appointment next Tuesday. Muse can reschedule the internal sync.',
    impact: 'Avoid conflict',
    suggestedPrompt: 'Propose new time for Tuesday Product Sync with team',
    sourceConnector: 'Google Calendar',
  },
  {
    id: 'idea-4',
    title: 'Auto-categorize freelance receipts',
    badge: 'habit',
    description: 'Found 7 business receipts in Gmail from last month. Muse can organize them into a tax-ready spreadsheet.',
    impact: 'Tax ready',
    suggestedPrompt: 'Compile last month’s work receipts into an expense sheet',
    sourceConnector: 'Gmail',
  },
];

export const INITIAL_ARTIFACTS: ArtifactItem[] = [
  {
    id: 'art-1',
    title: 'Tokyo_Expedition_Complete_Itinerary.pdf',
    category: 'itinerary',
    size: '1.4 MB',
    createdDate: 'Yesterday, 4:20 PM',
    content: 'Day 1: Arrival at HND, check-in Shinjuku.\nDay 2: Meiji Shrine, Shibuya Crossing, Omoide Yokocho.\nDay 3: Day trip to Hakone with Romancecar.\nDay 4: Akihabara & Ginza art galleries.\nDay 5: Departure from Haneda.',
    tags: ['Travel', 'Itinerary', 'Tokyo'],
  },
  {
    id: 'art-2',
    title: '2026_Q4_Recurring_Subscriptions_Audit.xlsx',
    category: 'spreadsheet',
    size: '256 KB',
    createdDate: 'Nov 6, 2026',
    content: 'Service, Cost/Mo, Billing Date, Status\nParamount+, $11.99, Nov 18, Queued for Cancel\nBloomberg Digital, $34.99, Nov 22, Queued for Cancel\nSpotify Duo, $14.99, Nov 01, Active\niCloud 2TB, $9.99, Nov 14, Active',
    tags: ['Finance', 'Audit', 'Savings'],
  },
  {
    id: 'art-3',
    title: 'Executive_Meeting_Brief_Nov8.txt',
    category: 'summary',
    size: '48 KB',
    createdDate: 'Today, 8:00 AM',
    content: 'Key topics discussed:\n1. Mobile app release candidate approved\n2. User retention +18% on automated background tasks\n3. Action item: Finalize VM browser security guidelines by Thursday',
    tags: ['Work', 'Executive', 'Notes'],
  },
];

export const INITIAL_CONNECTORS: ConnectorItem[] = [
  {
    id: 'conn-1',
    name: 'Google Workspace',
    category: 'productivity',
    icon: 'Mail',
    connected: true,
    status: 'active',
    permissions: ['Gmail (read/draft)', 'Calendar (read/schedule)', 'Drive (save files)'],
    lastSync: '3 mins ago',
  },
  {
    id: 'conn-2',
    name: 'Instagram & Threads',
    category: 'social',
    icon: 'Camera',
    connected: true,
    status: 'active',
    permissions: ['Direct Messages', 'Post scheduling', 'Insights analytics'],
    lastSync: '12 mins ago',
  },
  {
    id: 'conn-3',
    name: 'Plaid Financial Accounts',
    category: 'finance',
    icon: 'CreditCard',
    connected: true,
    status: 'active',
    permissions: ['Read-only balance', 'Transaction categorize', 'Subscription detect'],
    lastSync: '1 hour ago',
  },
  {
    id: 'conn-4',
    name: 'Spotify & Media',
    category: 'productivity',
    icon: 'Music',
    connected: true,
    status: 'active',
    permissions: ['Playback control', 'Focus playlists', 'Podcast queue'],
    lastSync: 'Just now',
  },
  {
    id: 'conn-5',
    name: 'Apple Health / Health Connect',
    category: 'productivity',
    icon: 'Heart',
    connected: false,
    status: 'disconnected',
    permissions: ['Daily step count', 'Sleep cycles', 'Active energy burn'],
    lastSync: 'Not connected',
  },
  {
    id: 'conn-6',
    name: 'Uber & Ride Services',
    category: 'travel',
    icon: 'Car',
    connected: true,
    status: 'active',
    permissions: ['Ride estimates', 'Automated airport booking (with OK)'],
    lastSync: '2 days ago',
  },
];
