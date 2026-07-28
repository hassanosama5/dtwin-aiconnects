/**
 * Mock Directory
 *
 * Single in-memory source of truth for mock Twin/Project data: both the
 * seeded demo twins and anything created or updated at runtime (Create
 * Twin, or an "improve this twin" interview via Start Interview).
 *
 * Plain module-level state — not Zustand/Context, no subscriptions. Just a
 * shared lookup table playing the role a real backend will once
 * useTwins()/useProjects() land in Phase 3. Resets whenever the app
 * reloads, as required.
 *
 * A runtime override, once set for an id, always wins over the seed value
 * for that id — this is what lets "Start Interview" improve one of the
 * five seeded twins in place, not just brand-new ones from Create Twin.
 */

export interface MockProjectSummary {
  id: string;
  name: string;
  subtitle: string;
}

export interface MockTwinProfile {
  id: string;
  name: string;
  role: string;
  decisionStyle: string;
  values: string[];
  communicationStyle: string[];
  projects: MockProjectSummary[];
}

export interface MockProjectProfile {
  name: string;
  twinName: string;
  goal: string;
  priorities: string[];
  constraints: string[];
  decisionRules: string[];
  escalationRules: string[];
}

export interface ProfileHistoryEntry {
  id: string;
  label: string;
  timestamp: number;
}

const MAX_HISTORY_ENTRIES = 5;

// ---- Seed data: the demo twins/projects that ship with the app ----

const SEED_TWINS: Record<string, MockTwinProfile> = {
  'hassan-osama': {
    id: 'hassan-osama',
    name: 'Hassan Osama',
    role: 'Project Manager',
    decisionStyle: 'Analytical, data-driven, prefers evidence before making decisions.',
    values: ['Customer First', 'Long-term Thinking', 'Simplicity'],
    communicationStyle: ['Direct', 'Concise', 'Structured'],
    projects: [
      { id: 'banking-app', name: 'Banking App', subtitle: 'Retail Banking' },
      { id: 'payments-platform', name: 'Payments Platform', subtitle: 'Compliance' },
      { id: 'mobile-wallet', name: 'Mobile Wallet', subtitle: 'Innovation' },
    ],
  },
  'khaled-ashraf': {
    id: 'khaled-ashraf',
    name: 'Khaled Ashraf',
    role: 'Team Lead',
    decisionStyle: 'Collaborative, consensus-seeking, weighs team input before deciding.',
    values: ['Team Ownership', 'Quality', 'Transparency'],
    communicationStyle: ['Supportive', 'Clear', 'Open'],
    projects: [
      { id: 'ai-dashboard', name: 'AI Dashboard', subtitle: 'Internal Tooling' },
      { id: 'support-portal', name: 'Support Portal', subtitle: 'Customer Success' },
    ],
  },
  'mona-youssef': {
    id: 'mona-youssef',
    name: 'Mona Youssef',
    role: 'Product Owner',
    decisionStyle: 'Customer-driven, prioritizes impact and speed to market.',
    values: ['User Value', 'Speed', 'Iteration'],
    communicationStyle: ['Persuasive', 'Story-driven', 'Direct'],
    projects: [
      { id: 'loyalty-app', name: 'Loyalty App', subtitle: 'Growth' },
      { id: 'checkout-redesign', name: 'Checkout Redesign', subtitle: 'Conversion' },
      { id: 'referral-program', name: 'Referral Program', subtitle: 'Acquisition' },
      { id: 'subscription-tiers', name: 'Subscription Tiers', subtitle: 'Retention' },
    ],
  },
  'habiba-anwar': {
    id: 'habiba-anwar',
    name: 'Habiba Anwar',
    role: 'Project Manager',
    decisionStyle: 'Pragmatic, balances user needs with delivery speed before committing to a plan.',
    values: ['User Experience', 'Team Wellbeing', 'Clarity'],
    communicationStyle: ['Empathetic', 'Clear', 'Collaborative'],
    projects: [
      { id: 'onboarding-flow', name: 'Onboarding Flow', subtitle: 'Activation' },
      { id: 'design-system', name: 'Design System', subtitle: 'Consistency' },
      { id: 'notifications-center', name: 'Notifications Center', subtitle: 'Engagement' },
    ],
  },
  'omar-ahmed': {
    id: 'omar-ahmed',
    name: 'Omar Ahmed',
    role: 'Project Manager',
    decisionStyle: 'Systematic, prioritizes reliability and long-term maintainability over quick wins.',
    values: ['Reliability', 'Ownership', 'Pragmatism'],
    communicationStyle: ['Precise', 'Documented', 'Direct'],
    projects: [
      { id: 'infra-migration', name: 'Infrastructure Migration', subtitle: 'Platform' },
      { id: 'data-pipeline', name: 'Data Pipeline', subtitle: 'Analytics' },
    ],
  },
};

const SEED_PROJECTS: Record<string, MockProjectProfile> = {
  'banking-app': {
    name: 'Banking App',
    twinName: 'Hassan Osama',
    goal: 'Ship the MVP on time while keeping the app secure and reliable for early banking customers.',
    priorities: ['Security', 'Performance', 'Regulatory compliance'],
    constraints: ['Fixed launch deadline', 'Limited QA headcount'],
    decisionRules: [
      'Delay the release only for security issues.',
      'Feature requests that risk the deadline are deferred to the next sprint.',
    ],
    escalationRules: [
      'Budget changes require direct approval.',
      'Any change to the compliance scope must be escalated.',
    ],
  },
  'payments-platform': {
    name: 'Payments Platform',
    twinName: 'Hassan Osama',
    goal: 'Achieve full regulatory compliance ahead of the next audit while keeping transaction latency low.',
    priorities: ['Compliance', 'Reliability', 'Auditability'],
    constraints: ['Audit deadline', 'No downtime during business hours'],
    decisionRules: [
      'Compliance requirements always take priority over new features.',
      'Any schema change requires a rollback plan.',
    ],
    escalationRules: ['Anything affecting settlement accuracy is escalated immediately.'],
  },
  'mobile-wallet': {
    name: 'Mobile Wallet',
    twinName: 'Hassan Osama',
    goal: 'Explore new wallet features that differentiate the product in the market.',
    priorities: ['Innovation', 'User experience', 'Speed of iteration'],
    constraints: ['Small team', 'Experimental budget'],
    decisionRules: [
      'Favor fast, reversible experiments over big upfront designs.',
      'Kill features that don’t show engagement within two sprints.',
    ],
    escalationRules: ['Anything touching stored payment credentials is escalated.'],
  },
  'ai-dashboard': {
    name: 'AI Dashboard',
    twinName: 'Khaled Ashraf',
    goal: 'Give internal teams a single view into model performance and usage.',
    priorities: ['Team adoption', 'Data accuracy', 'Maintainability'],
    constraints: ['Internal tool, limited design resources'],
    decisionRules: [
      'Prioritize requests from teams already using the dashboard daily.',
      'Avoid adding metrics without a clear owner.',
    ],
    escalationRules: ['Data source changes affecting existing metrics are escalated.'],
  },
  'support-portal': {
    name: 'Support Portal',
    twinName: 'Khaled Ashraf',
    goal: 'Reduce average ticket resolution time for customer support.',
    priorities: ['Customer satisfaction', 'Response time', 'Team workload'],
    constraints: ['Fixed support team size'],
    decisionRules: ['Automate repetitive ticket categories before adding new ones manually.'],
    escalationRules: ['Any change affecting SLA commitments is escalated.'],
  },
  'loyalty-app': {
    name: 'Loyalty App',
    twinName: 'Mona Youssef',
    goal: 'Grow repeat purchase rate through a simple, engaging rewards experience.',
    priorities: ['User growth', 'Engagement', 'Simplicity'],
    constraints: ['Marketing launch date is fixed'],
    decisionRules: [
      'Prioritize features that directly increase repeat visits.',
      'Keep the redemption flow to three steps or fewer.',
    ],
    escalationRules: ['Changes to point values or expiry rules are escalated.'],
  },
  'checkout-redesign': {
    name: 'Checkout Redesign',
    twinName: 'Mona Youssef',
    goal: 'Increase checkout conversion rate without disrupting existing payment flows.',
    priorities: ['Conversion rate', 'Trust and clarity', 'Payment reliability'],
    constraints: ['Cannot change the payment provider mid-project'],
    decisionRules: [
      'A/B test any checkout flow change before full rollout.',
      'Never remove a payment method without a replacement.',
    ],
    escalationRules: ['Any drop in successful payment rate is escalated immediately.'],
  },
  'referral-program': {
    name: 'Referral Program',
    twinName: 'Mona Youssef',
    goal: 'Acquire new customers at a lower cost by turning existing users into advocates.',
    priorities: ['Acquisition cost', 'Fraud prevention', 'Simplicity'],
    constraints: ['Fixed reward budget per quarter'],
    decisionRules: [
      'Reward structures must stay simple enough to explain in one sentence.',
      'Any change to payout amounts requires a cost review first.',
    ],
    escalationRules: ['Suspected referral fraud is escalated immediately.'],
  },
  'subscription-tiers': {
    name: 'Subscription Tiers',
    twinName: 'Mona Youssef',
    goal: 'Improve retention by giving customers a clear reason to stay subscribed.',
    priorities: ['Retention', 'Perceived value', 'Billing reliability'],
    constraints: ['Cannot change pricing for existing subscribers mid-cycle'],
    decisionRules: [
      'New tier benefits must not cannibalize the top existing tier.',
      'Pricing changes always apply to new subscribers first.',
    ],
    escalationRules: ['Any billing accuracy issue is escalated immediately.'],
  },
  'onboarding-flow': {
    name: 'Onboarding Flow',
    twinName: 'Habiba Anwar',
    goal: 'Get new users to their first meaningful action as quickly and clearly as possible.',
    priorities: ['Activation rate', 'Clarity', 'Accessibility'],
    constraints: ['Cannot add mandatory steps without design review'],
    decisionRules: [
      'Cut a step before adding a new one.',
      'Every screen must have a single primary action.',
    ],
    escalationRules: ['Any drop in activation rate after a change is escalated.'],
  },
  'design-system': {
    name: 'Design System',
    twinName: 'Habiba Anwar',
    goal: 'Give every screen a consistent, reusable set of components and patterns.',
    priorities: ['Consistency', 'Reusability', 'Accessibility'],
    constraints: ['Small design team, limited bandwidth for one-off requests'],
    decisionRules: [
      'New components are only added once used in two or more screens.',
      'Breaking changes require a migration plan before merging.',
    ],
    escalationRules: ['Any accessibility regression is escalated immediately.'],
  },
  'notifications-center': {
    name: 'Notifications Center',
    twinName: 'Habiba Anwar',
    goal: 'Keep users informed without overwhelming them with noise.',
    priorities: ['Engagement', 'Relevance', 'User control'],
    constraints: ['Cannot send more than one push per day per user'],
    decisionRules: [
      'Users must be able to mute any notification category.',
      'Favor in-app summaries over push for low-urgency updates.',
    ],
    escalationRules: ['Any spike in notification opt-outs is escalated.'],
  },
  'infra-migration': {
    name: 'Infrastructure Migration',
    twinName: 'Omar Ahmed',
    goal: 'Move core services to the new platform with zero unplanned downtime.',
    priorities: ['Reliability', 'Rollback safety', 'Cost'],
    constraints: ['Migration must happen outside business hours'],
    decisionRules: [
      'Every migration step must have a tested rollback path.',
      'No migration proceeds without a passing staging run.',
    ],
    escalationRules: ['Any production incident during migration is escalated immediately.'],
  },
  'data-pipeline': {
    name: 'Data Pipeline',
    twinName: 'Omar Ahmed',
    goal: 'Deliver accurate, timely data to the teams that depend on it.',
    priorities: ['Data accuracy', 'Timeliness', 'Maintainability'],
    constraints: ['Fixed infrastructure budget for this quarter'],
    decisionRules: [
      'Schema changes require notifying all downstream consumers first.',
      'Prefer well-documented batch jobs over one-off scripts.',
    ],
    escalationRules: ['Any data accuracy issue reaching a dashboard is escalated immediately.'],
  },
};

// ---- Runtime state: overrides + history, keyed by id ----

const twinOverrides = new Map<string, MockTwinProfile>();
const projectOverrides = new Map<string, MockProjectProfile>();
const twinHistory = new Map<string, ProfileHistoryEntry[]>();
const pendingHighlights = new Map<string, Set<string>>();

export function getTwin(id: string | undefined): MockTwinProfile | undefined {
  if (!id) return undefined;
  return twinOverrides.get(id) ?? SEED_TWINS[id];
}

export function getProject(id: string | undefined): MockProjectProfile | undefined {
  if (!id) return undefined;
  return projectOverrides.get(id) ?? SEED_PROJECTS[id];
}

/** All twins — seeds (with any override applied) plus anything created that isn't a seed id. */
export function listAllTwins(): MockTwinProfile[] {
  const seedIds = new Set(Object.keys(SEED_TWINS));
  const seedResults = Object.keys(SEED_TWINS).map((id) => twinOverrides.get(id) ?? SEED_TWINS[id]);
  const createdResults = Array.from(twinOverrides.values()).filter((twin) => !seedIds.has(twin.id));
  return [...seedResults, ...createdResults];
}

/** Registers a brand-new twin (Create Twin flow) plus its starter project. */
export function createTwin(twin: MockTwinProfile, project: { id: string } & MockProjectProfile): void {
  twinOverrides.set(twin.id, twin);
  projectOverrides.set(project.id, project);
}

/**
 * Applies an update to an existing twin (seed or previously-created), and
 * records history entries + which fields changed (for the one-time
 * "highlight changed sections" animation on Twin Profile).
 */
export function updateTwin(twin: MockTwinProfile, changedFields: string[], historyLabels: string[]): void {
  twinOverrides.set(twin.id, twin);
  for (const label of historyLabels) {
    addHistoryEntry(twin.id, label);
  }
  pendingHighlights.set(twin.id, new Set(changedFields));
}

function addHistoryEntry(twinId: string, label: string): void {
  const existing = twinHistory.get(twinId) ?? [];
  const entry: ProfileHistoryEntry = { id: `${twinId}-${Date.now()}-${existing.length}`, label, timestamp: Date.now() };
  twinHistory.set(twinId, [entry, ...existing].slice(0, MAX_HISTORY_ENTRIES));
}

export function getHistory(twinId: string): ProfileHistoryEntry[] {
  return twinHistory.get(twinId) ?? [];
}

export function getLastUpdatedLabel(twinId: string): string | undefined {
  const history = twinHistory.get(twinId);
  if (!history || history.length === 0) return undefined;
  return formatRelativeTime(history[0].timestamp);
}

/** Read-once: returns the fields changed by the most recent update, then clears them. */
export function consumeRecentlyChangedFields(twinId: string): Set<string> {
  const fields = pendingHighlights.get(twinId) ?? new Set<string>();
  pendingHighlights.delete(twinId);
  return fields;
}

function formatRelativeTime(timestamp: number): string {
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'Just Now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return 'Today';
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'Last Week';
  return `${diffDays} days ago`;
}
