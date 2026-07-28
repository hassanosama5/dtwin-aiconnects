/**
 * Chat Screen
 *
 * Conversational UI for asking a Decision Twin about a project. Wired to the
 * real Coordinator -> Middleware -> Decision -> Review pipeline via
 * useChat() -- no scripted responses, no fake timers. Conversation history
 * and every new answer/escalation are real, persisted rows loaded through
 * ConversationTool (see useChat.ts).
 *
 * UI polish carried over from the mock-data version: shared Loading/Error/
 * Empty state components, a growing composer (1 to ~5 lines), and
 * suggested-prompt chips on an empty conversation. The pipeline's live
 * progress is shown via AgentExecution (Coordinator/Decision/Review +
 * progress bar) rather than a second, separate "typing…" bubble -- the two
 * would just be two indicators for the same wait.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SuggestionChips } from '../../components/ui/SuggestionChips';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ConfidenceBadge } from '../../components/chat/ConfidenceBadge';
import { ReasoningCard } from '../../components/chat/ReasoningCard';
import { AgentExecution } from '../../components/ui/AgentExecution';
import { useChat } from '../../hooks/useChat';
import { useAppStore, selectAgentExecution } from '../../store/appStore';

const SUGGESTED_PROMPTS = [
  'What would you prioritize?',
  'What risks do you see?',
  'Should we delay launch?',
  'How would you handle this?',
];

const MIN_COMPOSER_HEIGHT = 40;
const MAX_COMPOSER_HEIGHT = 120; // ~5 lines

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
  const [composerHeight, setComposerHeight] = useState(MIN_COMPOSER_HEIGHT);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  const twinFirstName = (twin?.name ?? 'the Decision Twin').split(' ')[0];

  function handleSend(text?: string) {
    const trimmed = (text ?? inputText).trim();
    if (!trimmed || isSending) return;
    sendMessage(trimmed);
    setInputText('');
    setComposerHeight(MIN_COMPOSER_HEIGHT);
  }

  function handleComposerSizeChange(e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) {
    const next = Math.min(
      Math.max(MIN_COMPOSER_HEIGHT, e.nativeEvent.contentSize.height),
      MAX_COMPOSER_HEIGHT
    );
    setComposerHeight(next);
  }

  if (isInitializing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Loading conversation..." />
      </SafeAreaView>
    );
  }

  // A failed project load (as opposed to a softer twin/history hiccup, which
  // still surfaces via the inline banner below) leaves `project` null --
  // nothing else on this screen is usable until that's retried.
  if (!project && error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState message={error} onRetry={retry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header — pinned, never scrolls */}
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
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.length === 0 ? (
            <EmptyState
              title="Start a conversation with your Decision Twin."
              description={`Ask ${twinFirstName} anything about this project.`}
            >
              <SuggestionChips suggestions={SUGGESTED_PROMPTS} onSelect={setInputText} />
            </EmptyState>
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

        {/* Input — grows from 1 to ~5 lines */}
        <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-1">
            <Input
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              fullWidth={false}
              multiline
              onContentSizeChange={handleComposerSizeChange}
              style={{ height: composerHeight, textAlignVertical: 'top' }}
              editable={!isSending}
            />
          </View>
          <Button
            title="Send"
            onPress={() => handleSend()}
            size="sm"
            disabled={!inputText.trim()}
            loading={isSending}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
