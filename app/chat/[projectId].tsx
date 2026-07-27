/**
 * Chat Screen
 *
 * Main demo screen with agent execution visualization.
 * Phase 2 implementation placeholder.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, SafeAreaView, TextInput, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useChat } from '../../hooks/useChat';

export default function ChatScreen() {
  const params = useLocalSearchParams<{ projectId?: string }>();
  const projectId = useMemo(() => params.projectId ?? 'demo-project', [params.projectId]);
  const [draft, setDraft] = useState('');
  const { messages, isLoading, error, sendMessage } = useChat({
    twinId: 'demo-twin',
    projectId,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4">
        <Text className="text-lg font-semibold text-slate-900">Decision Twin Chat</Text>
        <Text className="mt-1 text-sm text-slate-500">Ask a project decision question and review the response.</Text>

        <ScrollView className="mt-4 flex-1" contentContainerClassName="gap-3">
          {messages.map((message) => (
            <View
              key={message.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'self-end bg-slate-900' : 'self-start bg-slate-100'}`}
            >
              <Text className={message.role === 'user' ? 'text-white' : 'text-slate-900'}>{message.content}</Text>
              {message.reasoning && message.reasoning.length > 0 ? (
                <Text className={`mt-2 text-xs ${message.role === 'user' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Confidence: {message.confidence ?? 'n/a'}%
                </Text>
              ) : null}
            </View>
          ))}

          {isLoading ? (
            <View className="self-start rounded-2xl bg-slate-100 px-4 py-3">
              <Text className="text-slate-600">Thinking...</Text>
            </View>
          ) : null}

          {error ? (
            <View className="self-start rounded-2xl bg-rose-50 px-4 py-3">
              <Text className="text-rose-600">{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View className="mt-4 border-t border-slate-200 pt-3">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask a decision question"
            className="rounded-2xl border border-slate-200 px-4 py-3"
            multiline
          />
          <Pressable
            onPress={() => {
              if (!draft.trim()) return;
              void sendMessage(draft.trim());
              setDraft('');
            }}
            className="mt-3 rounded-2xl bg-slate-900 px-4 py-3"
          >
            <Text className="text-center text-white">Send</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
