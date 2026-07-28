/**
 * Project Screen
 *
 * Displays a project's real profile (project_profile from Supabase): goal,
 * priorities, constraints, decision rules, escalation rules, with a primary
 * CTA into Chat. Wired to useProject(id) -- replaces the MOCK_PROJECTS/
 * mockDirectory resolution.
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { useProject } from '../../hooks/useProject';
import { useTwin } from '../../hooks/useTwin';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { project, isLoading, error, refresh } = useProject(id);
  const { twin } = useTwin(project?.twin_id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading Project..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorState message={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState title="Project not found." />
      </SafeAreaView>
    );
  }

  const profile = project.project_profile;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Pinned header — never scrolls away */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-gray-900 mb-1">{project.name}</Text>
        <Text className="text-base text-gray-600">
          {twin ? `${twin.name}'s project` : 'Project'}
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 pb-6">
          <ProfileSectionCard title="Goal">
            <Text className="text-sm text-gray-600 leading-5">{profile.goal}</Text>
          </ProfileSectionCard>

          <ProfileSectionCard title="Priorities">
            <BulletList items={profile.priorities} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Constraints">
            <BulletList items={profile.constraints} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Decision Rules">
            <BulletList items={profile.decisionRules} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Escalation Rules" className="mb-0">
            <BulletList items={profile.escalationRules} />
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
