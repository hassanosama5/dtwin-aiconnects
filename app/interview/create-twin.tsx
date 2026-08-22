/**
 * Create Twin Screen
 *
 * Conversational Personal Decision Profile onboarding -- no traditional
 * form. All orchestration (Coordinator, Interview Agent, field tracking,
 * validation, save) lives in useInterview(); this screen only renders
 * state and forwards user input. Real Supabase persistence via
 * ProfileTool -- not the mock in-memory registry other placeholder screens
 * use, since this flow already has a working backend.
 *
 * Exactly one header: the native Stack header is hidden (see
 * app/_layout.tsx) and this screen's own header (with its own back button)
 * is the single source of truth. It used to render both at once -- the
 * native "Create Decision Twin" title bar overlapping this screen's own
 * "Building your Decision Profile" heading directly beneath it.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
} from 'react-native';
// react-native's own SafeAreaView is deprecated and has known inset-
// calculation problems under the New Architecture on iOS -- can collapse
// to zero height, taking flex-1 children down with it, with no crash.
// Same root cause and fix as app/index.tsx.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterview } from '../../hooks/useInterview';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { ProgressBar } from '../../components/chat/ProgressBar';
import { SuggestionChips } from '../../components/chat/SuggestionChips';
import { theme } from '../../constants/theme';

export default function CreateTwinScreen() {
  const router = useRouter();
  const { messages, isLoading, isComplete, error, progress, suggestions, start, sendMessage } =
    useInterview();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading, suggestions]);

  // Keep the latest question/answer in view the instant the keyboard opens.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isComplete) return;
    const timeout = setTimeout(() => router.back(), 1100);
    return () => clearTimeout(timeout);
  }, [isComplete, router]);

  const handleSend = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
    setDraft('');
  };

  if (isComplete) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-lg font-semibold text-on-surface mb-2">
          Creating your Decision Twin…
        </Text>
        <Text className="text-sm text-on-surface-variant text-center">Saving what you've shared.</Text>
      </SafeAreaView>
    );
  }

  const canSend = draft.trim().length > 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1">
        <View className="border-b border-surface-border">
          <View className="flex-row items-center px-2 pt-2">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View className="px-6 pt-1 pb-2">
            <Text className="text-xl font-semibold text-on-surface">Building your Decision Profile</Text>
            <Text className="text-sm text-on-surface-variant mt-1">
              A few questions about how you make decisions.
            </Text>
          </View>
          {progress && (
            <ProgressBar label="Progress" collected={progress.collected} total={progress.total} />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))}
          {isLoading && <TypingIndicator />}
        </ScrollView>

        {/* Composer dock — chips sit directly above the input as quick
            actions on the same surface, not a detached row with its own
            divider. */}
        <View className="border-t border-surface-border bg-background">
          {error && (
            <View className="px-5 pt-2">
              <Text className="text-sm text-red-500">{error}</Text>
            </View>
          )}

          {!isLoading && (
            <SuggestionChips suggestions={suggestions} onSelect={handleSend} disabled={isLoading} />
          )}

          <View className="flex-row items-end px-4 pt-1 pb-3 gap-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type your answer..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              editable={!isLoading}
              className="flex-1 bg-surface-high rounded-2xl px-4 py-3 text-base text-on-surface max-h-28"
            />
            <TouchableOpacity
              onPress={() => handleSend(draft)}
              disabled={!canSend}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                canSend ? 'bg-primary-600' : 'bg-surface-highest'
              }`}
            >
              <Ionicons name="arrow-up" size={20} color={canSend ? theme.colors.textInverse : theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
