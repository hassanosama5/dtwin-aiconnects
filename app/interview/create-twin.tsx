/**
 * Create Twin Screen
 *
 * Conversational personal interview — no traditional form. All orchestration
 * (Coordinator, Interview Agent, validation, save) lives in useInterview();
 * this screen only renders state and forwards user input.
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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterview } from '../../hooks/useInterview';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { theme } from '../../constants/theme';

export default function CreateTwinScreen() {
  const router = useRouter();
  const { messages, isLoading, isComplete, error, start, sendMessage } = useInterview({
    type: 'personal',
  });
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isComplete) return;
    const timeout = setTimeout(() => router.back(), 1100);
    return () => clearTimeout(timeout);
  }, [isComplete, router]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  if (isComplete) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          Creating your Decision Twin…
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
        <View className="px-6 pt-4 pb-3 border-b border-gray-100">
          <Text className="text-sm text-gray-500">
            A few questions about how you make decisions.
          </Text>
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
            onPress={handleSend}
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
