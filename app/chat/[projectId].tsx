/**
 * Chat Screen
 *
 * Conversational UI for asking a Decision Twin about a project.
 * Scripted mock conversation only — no agents, no backend.
 * Wiring to useChat() happens in Phase 3 (see ROADMAP.md).
 * Sprint 6: loading/empty/error states + a mock "sending" delay.
 * Sprint 7: growing composer, suggested prompts, "Thinking…" typing bubble.
 * Sprint 7.1: resolves the project via the shared mockDirectory too (so a
 * newly-created twin's starter project works here); typing bubble now
 * reads "Decision Twin is thinking…" and cross-fades into the response
 * instead of swapping abruptly.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { SuggestionChips } from '../../components/ui/SuggestionChips';
import { ChatBubble, ChatRole } from '../../components/chat/ChatBubble';
import { ConfidenceBadge } from '../../components/chat/ConfidenceBadge';
import { ReasoningCard } from '../../components/chat/ReasoningCard';
import { getProject } from '../../utils/mockDirectory';

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

const SUGGESTED_PROMPTS = [
  'What would you prioritize?',
  'What risks do you see?',
  'Should we delay launch?',
  'How would you handle this?',
];

const DEFAULT_PROJECT_ID = 'banking-app';
const LOAD_DELAY_MS = 500;
const SEND_DELAY_MS = 1000;
const TYPING_FADE_OUT_MS = 200;
const MIN_COMPOSER_HEIGHT = 40;
const MAX_COMPOSER_HEIGHT = 120; // ~5 lines
const THINKING_LABEL = 'Decision Twin is thinking...';

// DEV ONLY — flip to true to preview the error state without a real backend.
// Remove once useChat() lands and this is driven by a real request.
const SIMULATE_ERROR = false;

type ViewStatus = 'loading' | 'success' | 'error';

export default function ChatScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const project = getProject(projectId) ?? getProject(DEFAULT_PROJECT_ID)!;
  const twinFirstName = project.twinName.split(' ')[0];

  const [status, setStatus] = useState<ViewStatus>('loading');
  const [messages, setMessages] = useState<MockChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [responseIndex, setResponseIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isTypingFadingOut, setIsTypingFadingOut] = useState(false);
  const [composerHeight, setComposerHeight] = useState(MIN_COMPOSER_HEIGHT);
  const scrollRef = useRef<ScrollView>(null);
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    setStatus('loading');
    const timeout = setTimeout(() => {
      setStatus(SIMULATE_ERROR ? 'error' : 'success');
    }, LOAD_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) clearTimeout(sendTimeoutRef.current);
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
    };
  }, []);

  function handleSend(text?: string) {
    const trimmed = (text ?? inputText).trim();
    if (!trimmed || isSending) return;

    const currentIndex = responseIndex;
    const userMessage: MockChatMessage = { id: `u${currentIndex}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setComposerHeight(MIN_COMPOSER_HEIGHT);
    setIsSending(true);
    setIsTypingFadingOut(false);

    sendTimeoutRef.current = setTimeout(() => {
      const response = SCRIPTED_RESPONSES[currentIndex % SCRIPTED_RESPONSES.length];
      const aiMessage: MockChatMessage = { id: `a${currentIndex}`, role: 'ai', ...response };
      setMessages((prev) => [...prev, aiMessage]);
      setResponseIndex((prev) => prev + 1);
      // Cross-fade: the response fades in (ChatBubble's own mount animation)
      // while the typing bubble fades out, instead of swapping abruptly.
      setIsTypingFadingOut(true);
      fadeOutTimeoutRef.current = setTimeout(() => {
        setIsSending(false);
        setIsTypingFadingOut(false);
      }, TYPING_FADE_OUT_MS);
    }, SEND_DELAY_MS);
  }

  function handleComposerSizeChange(e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) {
    const next = Math.min(
      Math.max(MIN_COMPOSER_HEIGHT, e.nativeEvent.contentSize.height),
      MAX_COMPOSER_HEIGHT
    );
    setComposerHeight(next);
  }

  if (status === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LoadingState message="Loading conversation..." />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState message="Unable to load conversation." onRetry={load} />
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
            <Text className="text-base font-semibold text-gray-900">{project.name}</Text>
          </View>
          <View className="flex-row items-baseline gap-1.5 mt-0.5">
            <Text className="text-sm font-medium text-gray-500">Twin:</Text>
            <Text className="text-base text-gray-700">{project.twinName}</Text>
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
              {isSending && (
                <ChatBubble role="ai" typing typingLabel={THINKING_LABEL} fadeOut={isTypingFadingOut} />
              )}
            </View>
          )}
        </ScrollView>

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
