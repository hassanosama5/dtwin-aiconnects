/**
 * Chat Tab (center, emphasized)
 *
 * Not a generic chat screen — per the product rule "chat always happens
 * within a selected project," there is no project-less chat to open here.
 * If a recent conversation exists, this redirects straight into it;
 * otherwise it prompts the user to pick a twin from Home rather than
 * silently doing nothing or inventing a fake generic chat.
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { BrandMark } from '../../components/ui/BrandMark';
import { useRecentActivity } from '../../hooks/useRecentActivity';

export default function ChatTabScreen() {
  const router = useRouter();
  const { conversations, isLoading, refresh } = useRecentActivity(1);

  useFocusEffect(
    React.useCallback(() => {
      void refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    // Only auto-resume when the most recent conversation actually has a
    // resolvable twinId -- older conversations saved before twinId was
    // recorded on the message itself (see tools/conversation.ts) don't, and
    // pushing chat/[projectId] without one just bounces back with "No Twin
    // was selected." Falling through to the "Pick a Twin" prompt below is
    // correct in that case, not a bug.
    if (!isLoading && conversations.length > 0 && conversations[0].twinId) {
      // push, not replace: this screen lives inside the (tabs) navigator,
      // and chat/[projectId] lives in the outer root Stack. replace() here
      // was swapping out the ENTIRE tabs group in the root Stack's history
      // (not just this one tab screen), so the back button — and the
      // whole bottom nav — had nothing left to return to. push() keeps the
      // tab bar underneath, so back() correctly returns to it.
      router.push({
        pathname: '/chat/[projectId]',
        params: { projectId: conversations[0].projectId, twinId: conversations[0].twinId },
      });
    }
  }, [isLoading, conversations, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState message="Finding your last conversation..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
      <View className="mb-4">
        <BrandMark size={40} />
      </View>
      <Text className="text-lg font-semibold text-ink-900 mb-2 text-center">
        Pick a Twin to start chatting
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        Every conversation happens within a specific project — choose a Twin
        and project from Home first.
      </Text>
      <Button title="Go to Home" onPress={() => router.push('/')} />
    </SafeAreaView>
  );
}
