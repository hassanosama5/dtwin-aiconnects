/**
 * Projects Tab
 *
 * Every project, as one flat searchable list -- Projects are independent
 * workspaces now (see tools/project.ts), not owned by a Twin, so this
 * doesn't group or filter by Twin at all. Each card shows the project, its
 * description, when it was last updated, and — only when there's actually
 * been a conversation — which Twin was last consulted about it. No
 * "Assigned Twin" placeholder for projects nobody's chatted about yet.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PressableScale } from '../../components/ui/PressableScale';
import { useAllProjects } from '../../hooks/useAllProjects';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { RecentConversationItem } from '../../tools/conversation';
import { ProjectWithTwin } from '../../tools/project';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, isLoading, error, refresh } = useAllProjects();
  const { conversations, refresh: refreshActivity } = useRecentActivity(50);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshActivity();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const activityByProject = useMemo(() => {
    const map = new Map<string, RecentConversationItem>();
    for (const item of conversations) map.set(item.projectId, item);
    return map;
  }, [conversations]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) => project.name.toLowerCase().includes(query));
  }, [search, projects]);

  function renderItem({ item }: { item: ProjectWithTwin }) {
    const activity = activityByProject.get(item.id);
    const lastUpdated = activity?.lastMessageAt ?? item.created_at;

    return (
      <PressableScale onPress={() => router.push(`/project/${item.id}`)}>
        <Card className="mb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-base font-semibold text-ink-900">{item.name}</Text>
              <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
                {item.description || item.project_profile.description}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">{formatRelativeTime(lastUpdated)}</Text>
          </View>

          {/* Only shown once this project has actually been discussed with
              a Twin -- no "Assigned Twin" placeholder for a fresh project
              that hasn't been consulted about yet. */}
          {activity && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
              <Avatar name={activity.twinName} imageUrl={activity.twinAvatarUrl} size="sm" />
              <Text className="text-sm text-gray-600 ml-2">Last consulted {activity.twinName}</Text>
            </View>
          )}
        </Card>
      </PressableScale>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-ink-900 mb-3">Projects</Text>
        <Input placeholder="Search projects..." value={search} onChangeText={setSearch} returnKeyType="search" />
      </View>

      {isLoading && projects.length === 0 ? (
        <LoadingState message="Loading projects..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to give your Decision Twins context to reason about."
        />
      ) : filteredProjects.length === 0 ? (
        <Text className="text-sm text-gray-500 text-center py-8">No projects match "{search}".</Text>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}
