/**
 * Project Screen
 *
 * Displays a project's profile: goal, priorities, constraints, decision
 * rules, and escalation rules, with a primary CTA into Chat.
 *
 * Static UI only, placeholder data. Wiring to useProjects()/useProject(id)
 * happens in Phase 3 (see ROADMAP.md).
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { ProjectProfile } from '../../types/profile';

type MockProject = ProjectProfile & { twinName: string };

// Placeholder data — replace with useProjects()/useProject(id) in Phase 3.
// IDs match the mock project ids used in app/twin/[id].tsx.
const MOCK_PROJECTS: Record<string, MockProject> = {
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
};

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Phase 3 — replace with useProjects()/useProject(id) once the hook exists.
  const project = id ? MOCK_PROJECTS[id] : undefined;

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-gray-600">Project not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {project.name}
            </Text>
            <Text className="text-base text-gray-600">
              {project.twinName}&apos;s project
            </Text>
          </View>

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
