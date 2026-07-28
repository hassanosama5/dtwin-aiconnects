/**
 * Twin Profile Screen
 *
 * Displays a Decision Twin's profile: decision style, values,
 * communication style, and projects.
 *
 * Static UI only, placeholder data. Wiring to useTwins()/useTwin(id)
 * happens in Phase 3 (see ROADMAP.md).
 */

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
// See app/index.tsx -- react-native's own SafeAreaView is deprecated and
// collapses to zero height under the New Architecture on iOS.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';

interface MockProject {
  id: string;
  name: string;
  subtitle: string;
}

interface MockTwinProfile {
  name: string;
  role: string;
  decisionStyle: string;
  values: string[];
  communicationStyle: string[];
  projects: MockProject[];
}

// Placeholder data — replace with useTwins()/useTwin(id) in Phase 3.
const MOCK_TWIN_PROFILES: Record<string, MockTwinProfile> = {
  'hassan-osama': {
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

const DEFAULT_TWIN_ID = 'hassan-osama';

function ProjectCard({ project, onPress }: { project: MockProject; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-3">
        <Text className="text-base font-semibold text-gray-900">{project.name}</Text>
        <Text className="text-sm text-gray-600 mt-0.5">{project.subtitle}</Text>
      </Card>
    </Pressable>
  );
}

export default function TwinProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Phase 3 — replace with useTwins()/useTwin(id) once the hook exists.
  const twin = MOCK_TWIN_PROFILES[id ?? ''] ?? MOCK_TWIN_PROFILES[DEFAULT_TWIN_ID];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-1">{twin.name}</Text>
            <Text className="text-base text-gray-600">{twin.role}</Text>
          </View>

          <ProfileSectionCard title="Decision Style">
            <Text className="text-sm text-gray-600 leading-5">{twin.decisionStyle}</Text>
          </ProfileSectionCard>

          <ProfileSectionCard title="Core Values">
            <BulletList items={twin.values} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Communication Style">
            <BulletList items={twin.communicationStyle} />
          </ProfileSectionCard>

          {/* Projects — flat list of cards, not nested in another Card */}
          <View>
            <Text className="text-base font-semibold text-gray-900 mb-3">Projects</Text>
            {twin.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => router.push(`/project/${project.id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Button
          title="Start Interview"
          onPress={() => {
            // TODO: Phase 2/3 - wire to Interview Agent / useInterview()
            console.log('Start Interview pressed');
          }}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
