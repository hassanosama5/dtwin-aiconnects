/**
 * Twin Profile Screen
 *
 * Displays a Decision Twin's profile: decision style, values,
 * communication style, and projects.
 *
 * Static UI only, placeholder data. Wiring to useTwins()/useTwin(id)
 * happens in Phase 3 (see ROADMAP.md).
 * Sprint 6: loading/empty/error states.
 * Sprint 7.1: header is pinned above the scrolling content.
 * Sprint 7.2: twin data now lives in utils/mockDirectory.ts; "Start
 * Interview" launches an update flow that improves this same twin in
 * place. Shows "Last Updated" + a "Profile Evolution" history, and briefly
 * highlights whichever sections the most recent update actually changed.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import {
  getTwin,
  getHistory,
  getLastUpdatedLabel,
  consumeRecentlyChangedFields,
  MockTwinProfile,
} from '../../utils/mockDirectory';

const LOAD_DELAY_MS = 500;

// DEV ONLY — flip to true to preview the error state without a real backend.
// Remove once useTwins()/useTwin(id) lands and this is driven by a real request.
const SIMULATE_ERROR = false;

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

function ProjectCard({
  project,
  onPress,
}: {
  project: MockTwinProfile['projects'][number];
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <PressableScale onPress={onPress} onPressedChange={setPressed}>
      <Card className="mb-3" elevated={!pressed}>
        <Text className="text-base font-semibold text-gray-900">{project.name}</Text>
        <Text className="text-sm text-gray-600 mt-0.5">{project.subtitle}</Text>
      </Card>
    </PressableScale>
  );
}

export default function TwinProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

  // TODO: Phase 3 — replace with useTwins()/useTwin(id) once the hook exists.
  const twin = getTwin(id);
  const history = id ? getHistory(id) : [];
  const lastUpdated = id ? getLastUpdatedLabel(id) : undefined;

  const load = useCallback(() => {
    setStatus('loading');
    const timeout = setTimeout(() => {
      if (SIMULATE_ERROR) setStatus('error');
      else if (!twin) setStatus('empty');
      else setStatus('success');
    }, LOAD_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [twin]);

  useEffect(() => load(), [load]);

  // One-time highlight of whichever sections the most recent "Start
  // Interview" update actually changed — read-once, so it only flashes the
  // first time this screen is seen after applying an update.
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const changed = consumeRecentlyChangedFields(id);
      if (changed.size > 0) setHighlightedFields(changed);
    }, [id])
  );

  if (status === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Loading Twin..." />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState message="Unable to load profile." onRetry={load} />
      </SafeAreaView>
    );
  }

  if (status === 'empty' || !twin) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState title="Twin not found." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Pinned header — never scrolls away */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-gray-900 mb-1">{twin.name}</Text>
        <Text className="text-base text-gray-600">{twin.role}</Text>
        {lastUpdated && (
          <Text className="text-xs text-gray-400 mt-2">Last Updated: {lastUpdated}</Text>
        )}
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 pb-6">
          <ProfileSectionCard title="Decision Style" highlight={highlightedFields.has('Decision Style')}>
            <Text className="text-sm text-gray-600 leading-5">{twin.decisionStyle}</Text>
          </ProfileSectionCard>

          <ProfileSectionCard title="Core Values" highlight={highlightedFields.has('Core Value')}>
            <BulletList items={twin.values} />
          </ProfileSectionCard>

          <ProfileSectionCard
            title="Communication Style"
            highlight={highlightedFields.has('Communication Style')}
          >
            <BulletList items={twin.communicationStyle} />
          </ProfileSectionCard>

          {/* Projects — flat list of cards, not nested in another Card */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">Projects</Text>
            {twin.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => router.push(`/project/${project.id}`)}
              />
            ))}
          </View>

          {history.length > 0 && (
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-3">Profile Evolution</Text>
              <Card>
                {history.map((entry, index) => (
                  <View
                    key={entry.id}
                    className={`flex-row items-start justify-between ${
                      index < history.length - 1 ? 'mb-3' : ''
                    }`}
                  >
                    <Text className="flex-1 text-sm text-gray-700 pr-3">{entry.label}</Text>
                    <Text className="text-xs text-gray-400">{formatHistoryTimestamp(entry.timestamp)}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Button
          title="Start Interview"
          onPress={() => router.push({ pathname: '/interview/update-twin/[id]', params: { id } })}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

function formatHistoryTimestamp(timestamp: number): string {
  const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'Today';
  if (diffMinutes < 60) return 'Today';
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return 'Today';
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'Last Week';
  return `${diffDays}d ago`;
}
