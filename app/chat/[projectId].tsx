/**
 * Chat Screen
 *
 * Conversational UI for asking a Decision Twin about a project. Wired to the
 * real Coordinator -> Middleware -> Decision -> Review pipeline via
 * useChat() -- no scripted responses, no fake timers. Conversation history
 * and every new answer/escalation are real, persisted rows loaded through
 * ConversationTool (see useChat.ts).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ConfidenceBadge } from '../../components/chat/ConfidenceBadge';
import { ReasoningCard } from '../../components/chat/ReasoningCard';
import { AgentExecution } from '../../components/ui/AgentExecution';
import { useChat } from '../../hooks/useChat';
import { useAppStore, selectAgentExecution } from '../../store/appStore';
import { theme } from '../../constants/theme';

export default function ChatScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const {
    project,
    twin,
    messages,
    isInitializing,
    isSending,
    error,
    sendMessage,
    retry,
  } = useChat(projectId ?? '');
  const agentExecution = useAppStore(selectAgentExecution);

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  const twinFirstName = (twin?.name ?? 'the Decision Twin').split(' ')[0];

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;
    sendMessage(trimmed);
    setInputText('');
  }

  if (isInitializing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color={theme.colors.primary[600]} />
      </SafeAreaView>
    );
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
            <Text className="text-base font-semibold text-gray-900">
              {project?.name ?? 'Unknown project'}
            </Text>
          </View>
          <View className="flex-row items-baseline gap-1.5 mt-0.5">
            <Text className="text-sm font-medium text-gray-500">Twin:</Text>
            <Text className="text-base text-gray-700">{twin?.name ?? 'Unknown twin'}</Text>
          </View>
        </View>

        {/* Conversation */}
        <ScrollView ref={scrollRef} className="flex-1">
          {messages.length === 0 && !isSending ? (
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
                  role={message.role === 'user' ? 'user' : 'ai'}
                  message={message.content}
                  footer={
                    message.role !== 'user' ? (
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

              <AgentExecution
                state={agentExecution.state}
                currentAgent={agentExecution.currentAgent}
                progress={agentExecution.progress}
              />
            </View>
          )}
        </ScrollView>

        {error && (
          <View className="px-6 pb-2">
            <View className="flex-row items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <Text className="flex-1 text-sm text-red-600 mr-3">{error}</Text>
              <Button title="Retry" size="sm" variant="secondary" onPress={retry} />
            </View>
          </View>
        )}

        {/* Input */}
        <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-1">
            <Input
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              fullWidth={false}
              editable={!isSending}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <Button title="Send" onPress={handleSend} size="sm" disabled={isSending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
