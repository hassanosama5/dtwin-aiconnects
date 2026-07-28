/**
 * Project Screen
 *
 * Displays a project's profile: goal, priorities, constraints, decision
 * rules, and escalation rules, with a primary CTA into Chat.
 *
 * Static UI only, placeholder data. Wiring to useProjects()/useProject(id)
 * happens in Phase 3 (see ROADMAP.md).
 * Sprint 6: loading/empty/error states.
 * Sprint 7.1: header is now pinned above the scrolling content.
 * Sprint 7.2: project data now lives in utils/mockDirectory.ts (seed data +
 * runtime overrides in one place) instead of a local map here.
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
import { getProject } from '../../utils/mockDirectory';

const LOAD_DELAY_MS = 500;

// DEV ONLY — flip to true to preview the error state without a real backend.
// Remove once useProjects()/useProject(id) lands and this is driven by a real request.
const SIMULATE_ERROR = false;

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<ViewStatus>('loading');

  // TODO: Phase 3 — replace with useProjects()/useProject(id) once the hook exists.
  const project = getProject(id);

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
