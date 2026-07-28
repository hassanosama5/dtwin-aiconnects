/**
 * Project Screen
 *
 * Displays a project's profile: goal, priorities, constraints, decision
 * rules, and escalation rules, with a primary CTA into Chat.
 *
 * Static UI only, placeholder data. Wiring to useProjects()/useProject(id)
 * happens in Phase 3 (see ROADMAP.md).
 * Sprint 6: loading/empty/error states.
 * Sprint 7.1: header is now pinned above the scrolling content; unknown
 * ids fall back to the shared mockDirectory so a newly-created twin's
 * starter project resolves instead of "Project not found."
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { ProjectProfile } from '../../types/profile';
import { getCreatedProject } from '../../utils/mockDirectory';

export type MockProject = ProjectProfile & { twinName: string };

// Placeholder data — replace with useProjects()/useProject(id) in Phase 3.
// IDs match the mock project ids used in app/twin/[id].tsx.
// Exported so app/chat/[projectId].tsx (Sprint 5) can reuse the same data for its header.
export const MOCK_PROJECTS: Record<string, MockProject> = {
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
    escalationRules: [
      'Anything affecting settlement accuracy is escalated immediately.',
    ],
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
    decisionRules: [
      'Automate repetitive ticket categories before adding new ones manually.',
    ],
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

const LOAD_DELAY_MS = 500;

// DEV ONLY — flip to true to preview the error state without a real backend.
// Remove once useProjects()/useProject(id) lands and this is driven by a real request.
const SIMULATE_ERROR = false;

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

/** Resolves a project id against the static mock map, then the shared mockDirectory. */
export function getProjectById(id: string | undefined): MockProject | undefined {
  if (!id) return undefined;
  return MOCK_PROJECTS[id] ?? getCreatedProject(id);
}

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<ViewStatus>('loading');

  // TODO: Phase 3 — replace with useProjects()/useProject(id) once the hook exists.
  const project = getProjectById(id);

  const load = useCallback(() => {
    setStatus('loading');
    const timeout = setTimeout(() => {
      if (SIMULATE_ERROR) setStatus('error');
      else if (!project) setStatus('empty');
      else setStatus('success');
    }, LOAD_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [project]);

  useEffect(() => load(), [load]);

  if (status === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading Project..." />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorState message="Unable to load project." onRetry={load} />
      </SafeAreaView>
    );
  }

  if (status === 'empty' || !project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState title="Project not found." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Pinned header — never scrolls away */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-gray-900 mb-1">{project.name}</Text>
        <Text className="text-base text-gray-600">{project.twinName}&apos;s project</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 pb-6">
          <ProfileSectionCard title="Goal">
            <Text className="text-sm text-gray-600 leading-5">{project.goal}</Text>
          </ProfileSectionCard>

          <ProfileSectionCard title="Priorities">
            <BulletList items={project.priorities} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Constraints">
            <BulletList items={project.constraints} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Decision Rules">
            <BulletList items={project.decisionRules} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Escalation Rules" className="mb-0">
            <BulletList items={project.escalationRules} />
          </ProfileSectionCard>
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Button
          title="Chat with Decision Twin"
          onPress={() => router.push(`/chat/${id}`)}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
