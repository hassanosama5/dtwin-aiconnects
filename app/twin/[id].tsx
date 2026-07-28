/**
 * Twin Profile Screen
 *
 * Displays a Decision Twin's real profile (personal_profile from Supabase)
 * and their real projects. Wired to useTwin(id)/useProjects(id) -- replaces
 * the mock/mockDirectory resolution that showed "Twin not found" for any
 * real, Supabase-backed twin (the bug: Home already used useTwins() for the
 * list, but this screen never queried Supabase for the single twin at all).
 */

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { useTwin } from '../../hooks/useTwin';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../types/database';

function ProjectCard({ project, onPress }: { project: Project; onPress: () => void }) {
  const [pressed, setPressed] = useState(false);
  const subtitle = project.description || project.project_profile.goal;

  return (
    <PressableScale onPress={onPress} onPressedChange={setPressed}>
      <Card className="mb-3" elevated={!pressed}>
        <Text className="text-base font-semibold text-gray-900">{project.name}</Text>
        <Text className="text-sm text-gray-600 mt-0.5">{subtitle}</Text>
      </Card>
    </PressableScale>
  );
}

export default function TwinProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { twin, isLoading: isTwinLoading, error: twinError, refresh: refreshTwin } = useTwin(id);
  const { projects, isLoading: isProjectsLoading, error: projectsError } = useProjects(id);

  if (isTwinLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Loading Twin..." />
      </SafeAreaView>
    );
  }

  if (twinError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState message={twinError} onRetry={refreshTwin} />
      </SafeAreaView>
    );
  }

  if (!twin) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState title="Twin not found." />
      </SafeAreaView>
    );
  }

  const profile = twin.personal_profile;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Pinned header — never scrolls away */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-gray-900 mb-1">{twin.name}</Text>
        <Text className="text-base text-gray-600">{twin.role}</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 pb-6">
          <ProfileSectionCard title="Decision Style">
            <Text className="text-sm text-gray-600 leading-5">{profile.decisionStyle}</Text>
          </ProfileSectionCard>

          <ProfileSectionCard title="Core Values">
            <BulletList items={profile.values} />
          </ProfileSectionCard>

          <ProfileSectionCard title="Communication Style">
            <Text className="text-sm text-gray-600 leading-5">{profile.communicationStyle}</Text>
          </ProfileSectionCard>

          {/* Projects — flat list of cards, not nested in another Card */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">Projects</Text>
            {isProjectsLoading ? (
              <Text className="text-sm text-gray-500">Loading projects...</Text>
            ) : projectsError ? (
              <Text className="text-sm text-red-500">{projectsError}</Text>
            ) : projects.length === 0 ? (
              <Text className="text-sm text-gray-500">No projects yet.</Text>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={() => router.push(`/project/${project.id}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Button
          title="Start Interview"
          onPress={() => {
            // TODO: Phase 3 - wire to Interview Agent / useInterview() for re-interviewing an existing twin.
            console.log('Start Interview pressed');
          }}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
