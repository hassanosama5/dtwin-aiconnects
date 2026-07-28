/**
 * Create Project Screen
 *
 * Adds a new project to an existing Decision Twin -- a conversational,
 * code-driven Project Context interview via useInterview({ twinId, stage:
 * 'project' }), which skips the personal-profile stage entirely since the
 * twin already exists. Real Supabase persistence via ProjectTool -- this
 * screen previously used the fully scripted InterviewChat mock and never
 * called any backend at all, which was the root cause of "nothing persists"
 * (confirmed by inspection: no twinId was even read from route params).
 *
 * If this twin already has a project, skips straight to their Twin Profile
 * (where the real project list now lives) instead of restarting creation.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterview } from '../../hooks/useInterview';
import { useProjects } from '../../hooks/useProjects';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { ProgressBar } from '../../components/chat/ProgressBar';
import { SuggestionChips } from '../../components/chat/SuggestionChips';
import { LoadingState } from '../../components/ui/LoadingState';
import { theme } from '../../constants/theme';

export default function CreateProjectScreen() {
  const { twinId } = useLocalSearchParams<{ twinId: string }>();
  const router = useRouter();
  const { projects, isLoading: isCheckingExisting } = useProjects(twinId);
  const { messages, isLoading, isComplete, error, progress, suggestions, start, sendMessage } =
    useInterview({ twinId, stage: 'project' });
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const hasExistingProject = !isCheckingExisting && projects.length > 0;

  useEffect(() => {
    if (isCheckingExisting || hasExistingProject || !twinId) return;
    start();
  }, [isCheckingExisting, hasExistingProject, twinId, start]);

  useEffect(() => {
    if (hasExistingProject) {
      router.replace(`/twin/${twinId}`);
    }
  }, [hasExistingProject, router, twinId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading, suggestions]);

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

  if (isCheckingExisting || hasExistingProject) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Loading project..." />
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          Creating your Project…
        </Text>
        <Text className="text-sm text-gray-500 text-center">Saving what you've shared.</Text>
      </SafeAreaView>
    );
  }

  const canSend = draft.trim().length > 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView className="flex-1">
        <View className="border-b border-gray-100">
          {progress && (
            <ProgressBar label="Project Context" collected={progress.collected} total={progress.total} />
          )}
          <View className="px-6 pt-1 pb-3">
            <Text className="text-sm text-gray-500">Let's set the context for this project.</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} content={message.content} />
          ))}
          {isLoading && <TypingIndicator />}
        </ScrollView>

        {error && (
          <View className="px-5 pb-2">
            <Text className="text-sm text-red-500">{error}</Text>
          </View>
        )}

        {!isLoading && (
          <SuggestionChips suggestions={suggestions} onSelect={handleSend} disabled={isLoading} />
        )}

        <View className="flex-row items-end px-4 py-3 border-t border-gray-100 gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type your answer..."
            placeholderTextColor={theme.colors.gray[400]}
            multiline
            editable={!isLoading}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base text-gray-900 max-h-28"
          />
          <TouchableOpacity
            onPress={() => handleSend(draft)}
            disabled={!canSend}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              canSend ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <Ionicons name="arrow-up" size={20} color={canSend ? '#ffffff' : theme.colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
