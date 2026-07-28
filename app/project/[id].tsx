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

// Placeholder data — replace with useProjects()/useProject(id) in Phase 3.
const MOCK_PROJECT: ProjectProfile & { twinName: string } = {
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
};

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Phase 3 — replace with useProjects()/useProject(id) once the hook exists.
  const project = MOCK_PROJECT;

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
