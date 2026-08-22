/**
 * Twin Profile Screen
 *
 * Displays a Decision Twin's real profile (personal_profile from Supabase).
 * "Recently Consulted" shows projects this Twin has actually answered
 * questions about, derived from conversation history — not a twin_id
 * ownership query, since Projects are independent of any one Twin now (see
 * tools/project.ts). A Twin with no conversation history yet simply has an
 * empty list here, which is correct, not broken.
 *
 * Primary CTA uses the shared useAskQuestion() decision (0/1/many projects)
 * — also used by the Home screen's Twin cards, so the rule "chat always
 * happens within a selected project" lives in one place, not two.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { ProjectPickerSheet } from '../../components/twin/ProjectPickerSheet';
import { useTwin } from '../../hooks/useTwin';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { useAskQuestion } from '../../hooks/useAskQuestion';
import { RecentConversationItem } from '../../tools/conversation';
import { theme } from '../../constants/theme';

function RecentProjectCard({ item, onPress }: { item: RecentConversationItem; onPress: () => void }) {
  const [pressed, setPressed] = React.useState(false);

  return (
    <PressableScale onPress={onPress} onPressedChange={setPressed}>
      <Card className="mb-3" elevated={!pressed}>
        <Text className="text-base font-semibold text-gray-900">{item.projectName}</Text>
        <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </Card>
    </PressableScale>
  );
}

export default function TwinProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { twin, isLoading: isTwinLoading, error: twinError, refresh: refreshTwin } = useTwin(id);
  const { conversations, isLoading: isActivityLoading, refresh: refreshActivity } = useRecentActivity(50);
  const { askQuestion, isResolving, picker, closePicker, selectProject } = useAskQuestion();

  useFocusEffect(
    useCallback(() => {
      void refreshActivity();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const recentProjects = useMemo(
    () => conversations.filter((item) => item.twinId === id),
    [conversations, id]
  );

  // Only header on this screen -- the native one is hidden (see
  // app/_layout.tsx), it used to render "Twin Profile" twice: once as the
  // native title, once as the Twin's actual name directly beneath it.
  const backButton = (
    <View className="px-2 pt-2">
      <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={24} color={theme.colors.ink[900]} />
      </TouchableOpacity>
    </View>
  );

  if (isTwinLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <LoadingState message="Loading Twin..." />
      </SafeAreaView>
    );
  }

  if (twinError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <ErrorState message={twinError} onRetry={refreshTwin} />
      </SafeAreaView>
    );
  }

  if (!twin) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <EmptyState title="Twin not found." />
      </SafeAreaView>
    );
  }

  const profile = twin.personal_profile;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {backButton}
      {/* Pinned header — never scrolls away */}
      <View className="px-6 pt-2 pb-5">
        <Text className="text-3xl font-bold text-ink-900 mb-2">{twin.name}</Text>
        <View className="self-start bg-primary-50 rounded-full px-3 py-1">
          <Text className="text-sm font-medium text-primary-700">{twin.role}</Text>
        </View>
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

          {/* Recently Consulted — flat list of cards, not nested in another Card */}
          <View>
            <Text className="text-base font-semibold text-gray-900 mb-3">Recently Consulted</Text>
            {isActivityLoading ? (
              <Text className="text-sm text-gray-500">Loading...</Text>
            ) : recentProjects.length === 0 ? (
              <Text className="text-sm text-gray-500">No conversations yet.</Text>
            ) : (
              recentProjects.map((item) => (
                <RecentProjectCard
                  key={item.projectId}
                  item={item}
                  onPress={() => router.push(`/project/${item.projectId}`)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Primary CTA */}
      <View className="px-6 py-4 bg-background border-t border-gray-200">
        <Button
          title="Ask a Question"
          onPress={() => askQuestion(twin)}
          loading={isResolving}
          fullWidth
        />
      </View>

      {picker && (
        <ProjectPickerSheet
          visible
          twinName={picker.twin.name}
          projects={picker.projects}
          onSelect={selectProject}
          onClose={closePicker}
        />
      )}
    </SafeAreaView>
  );
}
