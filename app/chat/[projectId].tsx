/**
 * Chat Screen
 *
 * Conversational UI for asking a Decision Twin about a project.
 * Scripted mock conversation only — no agents, no backend.
 * Wiring to useChat() happens in Phase 3 (see ROADMAP.md).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
// See app/index.tsx -- react-native's own SafeAreaView is deprecated and
// collapses to zero height under the New Architecture on iOS.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatBubble, ChatRole } from '../../components/chat/ChatBubble';
import { ConfidenceBadge } from '../../components/chat/ConfidenceBadge';
import { ReasoningCard } from '../../components/chat/ReasoningCard';
import { MOCK_PROJECTS } from '../project/[id]';

interface MockChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  confidence?: number;
  reasoning?: string[];
}

interface ScriptedResponse {
  text: string;
  confidence: number;
  reasoning: string[];
}

// Placeholder script — replace with the real Decision/Review Agent pipeline in Phase 3.
// Cycles once the user sends more messages than the script has entries.
const SCRIPTED_RESPONSES: ScriptedResponse[] = [
  {
    text: 'Based on your decision profile, delaying by one week reduces delivery risk while maintaining customer trust.',
    confidence: 96,
    reasoning: ['Customer impact', 'Risk assessment', 'Timeline considerations', 'Long-term value'],
  },
  {
    text: 'That’s a safer option — it keeps the core release on schedule while still improving the experience later.',
    confidence: 88,
    reasoning: ['Scope isolation', 'Deadline impact', 'User experience', 'Team capacity'],
  },
  {
    text: 'Unlikely — the security review covers backend changes, and this only touches onboarding UI.',
    confidence: 74,
    reasoning: ['Scope of security review', 'Component isolation', 'Historical precedent', 'Residual risk'],
  },
  {
    text: 'Yes, this falls within standard delegation — no escalation needed for a UI-only scope change.',
    confidence: 91,
    reasoning: ['Delegation rules', 'Scope classification', 'Approval thresholds', 'Team precedent'],
  },
];

const DEFAULT_PROJECT_ID = 'banking-app';

export default function ChatScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const project = MOCK_PROJECTS[projectId ?? ''] ?? MOCK_PROJECTS[DEFAULT_PROJECT_ID];
  const twinFirstName = project.twinName.split(' ')[0];

  const [messages, setMessages] = useState<MockChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [responseIndex, setResponseIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const response = SCRIPTED_RESPONSES[responseIndex % SCRIPTED_RESPONSES.length];
    const userMessage: MockChatMessage = { id: `u${responseIndex}`, role: 'user', text: trimmed };
    const aiMessage: MockChatMessage = { id: `a${responseIndex}`, role: 'ai', ...response };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setResponseIndex((prev) => prev + 1);
    setInputText('');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-sm font-medium text-gray-500">Project:</Text>
            <Text className="text-base font-semibold text-gray-900">{project.name}</Text>
          </View>
          <View className="flex-row items-baseline gap-1.5 mt-0.5">
            <Text className="text-sm font-medium text-gray-500">Twin:</Text>
            <Text className="text-base text-gray-700">{project.twinName}</Text>
          </View>
        </View>

        {/* Conversation */}
        <ScrollView ref={scrollRef} className="flex-1">
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center p-10">
              <Text className="text-base text-gray-500 text-center">
                Ask {twinFirstName} anything about this project.
              </Text>
            </View>
          ) : (
            <View className="p-6">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  role={message.role}
                  message={message.text}
                  footer={
                    message.role === 'ai' ? (
                      <>
                        {message.confidence !== undefined && (
                          <ConfidenceBadge confidence={message.confidence} />
                        )}
                        {message.reasoning && <ReasoningCard reasoning={message.reasoning} />}
                      </>
                    ) : undefined
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-1">
            <Input
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              fullWidth={false}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <Button title="Send" onPress={handleSend} size="sm" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
