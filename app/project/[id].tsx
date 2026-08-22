/**
 * Project Screen
 *
 * Displays a project's workspace fields (title, description, objectives,
 * deadline, stakeholders, constraints, notes) with a primary CTA that opens
 * a Twin picker rather than jumping straight into chat with one fixed
 * Twin — a Project is independent of any one Twin now (see
 * tools/project.ts); which Twin answers is chosen here, at consult-time.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { TwinPickerSheet } from '../../components/project/TwinPickerSheet';
import { useProject } from '../../hooks/useProject';
import { useTwins } from '../../hooks/useTwins';
import { theme } from '../../constants/theme';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { project, isLoading, error, refresh } = useProject(id);
  const { twins } = useTwins();
  const [pickerVisible, setPickerVisible] = useState(false);

  // Only header on this screen -- the native one is hidden (see
  // app/_layout.tsx), it used to render "Project" twice: once as the
  // native title, once as the project's actual title directly beneath it.
  const backButton = (
    <View className="px-2 pt-2">
      <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={24} color={theme.colors.ink[900]} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <LoadingState message="Loading Project..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <ErrorState message={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <EmptyState title="Project not found." />
      </SafeAreaView>
    );
  }

  const profile = project.project_profile;

  function handleConsultTwin() {
    if (twins.length === 0) {
      router.push('/interview/create-twin');
      return;
    }
    if (twins.length === 1) {
      router.push({ pathname: '/chat/[projectId]', params: { projectId: id, twinId: twins[0].id } });
      return;
    }
    setPickerVisible(true);
  }

  function handleSelectTwin(twinId: string) {
    setPickerVisible(false);
    router.push({ pathname: '/chat/[projectId]', params: { projectId: id, twinId } });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {backButton}
      {/* Pinned header — never scrolls away */}
      <View className="px-6 pt-2 pb-4">
        <Text className="text-3xl font-bold text-ink-900 mb-1">{profile.title}</Text>
        {profile.deadline && <Text className="text-base text-gray-600">Due {profile.deadline}</Text>}
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 pb-6">
          <ProfileSectionCard title="Description">
            <Text className="text-sm text-gray-600 leading-5">{profile.description}</Text>
          </ProfileSectionCard>

          <ProfileSectionCard title="Objectives">
            <BulletList items={profile.objectives} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Constraints">
            <BulletList items={profile.constraints} />
          </ProfileSectionCard>

          {profile.stakeholders && profile.stakeholders.length > 0 && (
            <ProfileSectionCard title="Stakeholders">
              <BulletList items={profile.stakeholders} />
            </ProfileSectionCard>
          )}

          {profile.notes && (
            <ProfileSectionCard title="Notes" className="mb-0">
              <Text className="text-sm text-gray-600 leading-5">{profile.notes}</Text>
            </ProfileSectionCard>
          )}
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <View className="px-6 py-4 bg-background border-t border-surface-border">
        <Button title="Consult a Twin" onPress={handleConsultTwin} fullWidth />
      </View>

      <TwinPickerSheet
        visible={pickerVisible}
        projectName={profile.title}
        twins={twins}
        onSelect={handleSelectTwin}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
