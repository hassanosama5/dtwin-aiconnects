/**
 * Home Screen
 *
 * Dark theme, matching the user's "TWIN - Good Morning" mockup: a top bar
 * (avatar, wordmark, notification glyph), a large greeting headline, a pill
 * search bar, two circular-icon quick-action cards (Create Twin / Create
 * Project), a dashed-border contextual tip card, and the "Your Twins" list.
 *
 * Still deliberately minimal per earlier direction: no recent-conversations
 * section, no quick-actions dashboard row beyond the two primary actions.
 * Twin cards remain the main focus; a Twin card's "project count"/"last
 * active" are derived from conversation history, not twin_id ownership
 * (Projects are independent of Twins -- see tools/project.ts).
 *
 * Refetches on focus (e.g. after the Create Twin modal is dismissed) rather
 * than relying on global state, per PROJECT_SPEC.md's "fetch it when needed"
 * principle.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { BrandMark } from '../../components/ui/BrandMark';
import { Wordmark } from '../../components/ui/Wordmark';
import { Avatar } from '../../components/ui/Avatar';
import { TwinCard } from '../../components/cards/TwinCard';
import { useTwins } from '../../hooks/useTwins';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { twins, isLoading, error, refresh } = useTwins();
  // Fetched (not displayed as its own section) purely to back each Twin
  // card's "project count" / "last active" fields -- see file header.
  const { conversations, refresh: refreshActivity } = useRecentActivity(50);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), refreshActivity()]);
  }, [refresh, refreshActivity]);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }

  const activityByTwin = useMemo(() => {
    const map = new Map<string, { projectIds: Set<string>; lastActiveAt: string }>();
    for (const item of conversations) {
      if (!item.twinId) continue;
      const entry = map.get(item.twinId);
      if (entry) {
        entry.projectIds.add(item.projectId);
      } else {
        map.set(item.twinId, { projectIds: new Set([item.projectId]), lastActiveAt: item.lastMessageAt });
      }
    }
    return map;
  }, [conversations]);

  const filteredTwins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return twins;
    return twins.filter((twin) => twin.name.toLowerCase().includes(query));
  }, [search, twins]);

  function handleCreateTwin() {
    router.push('/interview/create-twin');
  }

  function handleCreateProject() {
    router.push('/project/create');
  }

  function renderTwins() {
    if (isLoading && twins.length === 0) {
      return <LoadingState message="Loading Decision Twins..." />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={refresh} />;
    }

    if (twins.length === 0) {
      return (
        <EmptyState
          icon={
            <View className="items-center justify-center" style={{ width: 96, height: 96 }}>
              {/* Soft glow behind the mark, per the mockup's blurred backdrop */}
              <View
                className="absolute rounded-full bg-primary-600"
                style={{ width: 96, height: 96, opacity: 0.16 }}
              />
              <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center">
                <BrandMark size={40} />
              </View>
            </View>
          }
          title="No Twins yet"
          description="Create your first Decision Twin to get personalized advice on your important decisions."
          actionLabel="Create Your First Twin"
          onAction={handleCreateTwin}
        />
      );
    }

    return (
      <View className="px-6">
        <Text className="text-base font-semibold text-on-surface mb-3">Your Twins</Text>
        {filteredTwins.length === 0 ? (
          <Text className="text-sm text-on-surface-variant text-center py-8">No twins match "{search}".</Text>
        ) : (
          filteredTwins.map((twin) => {
            const activity = activityByTwin.get(twin.id);
            return (
              <TwinCard
                key={twin.id}
                twin={twin}
                projectCount={activity?.projectIds.size ?? 0}
                lastActiveAt={activity?.lastActiveAt ?? null}
              />
            );
          })
        )}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.textSecondary}
          />
        }
      >
        {/* Top bar — avatar, centered wordmark, notification glyph */}
        <View className="flex-row items-center justify-between px-6 pt-4">
          <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="Profile">
            <Avatar name={user?.email ?? 'You'} size="sm" />
          </TouchableOpacity>
          <Wordmark width={84} />
          <View className="w-9 h-9 rounded-full bg-surface-high items-center justify-center">
            <Ionicons name="notifications-outline" size={18} color={theme.colors.textSecondary} />
          </View>
        </View>

        {/* Greeting */}
        <View className="px-6 mt-7">
          <Text className="text-[28px] leading-[34px] font-bold text-on-surface">
            {getTimeOfDayGreeting()}
          </Text>
          <Text className="text-base text-on-surface-variant mt-1">
            What decision would you like help with today?
          </Text>
        </View>

        {/* Search */}
        <View className="px-6 mt-5">
          <View className="flex-row items-center bg-surface-high border border-surface-border rounded-full px-4 h-12">
            <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: theme.colors.textPrimary }}
              placeholder="Search Twins..."
              placeholderTextColor={theme.colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Primary actions -- circular-icon quick action cards */}
        <View className="flex-row gap-3 px-6 mt-5">
          <TouchableOpacity
            onPress={handleCreateTwin}
            className="flex-1 bg-surface-high border border-surface-border rounded-2xl p-4 items-start"
          >
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mb-3">
              <Ionicons name="person-add-outline" size={18} color={theme.colors.primary[700]} />
            </View>
            <Text className="text-sm font-semibold text-on-surface">Create Twin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreateProject}
            className="flex-1 bg-surface-high border border-surface-border rounded-2xl p-4 items-start"
          >
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mb-3">
              <Ionicons name="folder-open-outline" size={18} color={theme.colors.primary[700]} />
            </View>
            <Text className="text-sm font-semibold text-on-surface">Create Project</Text>
          </TouchableOpacity>
        </View>

        {/* Contextual tip -- dashed border card, per mockup */}
        <View className="px-6 mt-5">
          <View
            className="rounded-2xl px-4 py-3.5 flex-row items-start"
            style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.surface.border }}
          >
            <Ionicons name="bulb-outline" size={18} color={theme.colors.primary[700]} />
            <Text className="flex-1 text-sm text-on-surface-variant ml-2.5 leading-5">
              Create a Project first so your Twins can give advice grounded in real context.
            </Text>
          </View>
        </View>

        {/* Your Twins */}
        <View className="mt-7 pb-10">{renderTwins()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
