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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { SuggestionChips } from '../../components/ui/SuggestionChips';
import { BrandMark } from '../../components/ui/BrandMark';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ConfidenceBadge } from '../../components/chat/ConfidenceBadge';
import { ReasoningCard } from '../../components/chat/ReasoningCard';
import { AgentExecution } from '../../components/ui/AgentExecution';
import { useChat } from '../../hooks/useChat';
import { useAppStore, selectAgentExecution } from '../../store/appStore';
import { theme } from '../../constants/theme';

const SUGGESTED_PROMPTS = [
  'What would you prioritize?',
  'What risks do you see?',
  'Should we delay launch?',
  'How would you handle this?',
];

const MIN_COMPOSER_HEIGHT = 40;
const MAX_COMPOSER_HEIGHT = 120; // ~5 lines

export default function ChatScreen() {
  const { projectId, twinId } = useLocalSearchParams<{ projectId: string; twinId: string }>();
  const router = useRouter();
  const {
    project,
    twin,
    messages,
    isInitializing,
    isSending,
    error,
    sendMessage,
    retry,
  } = useChat(projectId ?? '', twinId ?? '');
  const agentExecution = useAppStore(selectAgentExecution);

  const [inputText, setInputText] = useState('');
  const [composerHeight, setComposerHeight] = useState(MIN_COMPOSER_HEIGHT);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  // Keep the newest message in view the instant the keyboard opens, not just
  // when a message is sent/received — otherwise the last-visible message can
  // sit right at the keyboard's top edge until the next send.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    return () => sub.remove();
  }, []);

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

  // A small back button — the native header is hidden on this screen, so
  // these early states (before the real header renders below) still need a
  // way out rather than stranding the user.
  const backButton = (
    <View className="px-4 pt-3">
      <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  // Every real entry point (Ask a Question, Consult a Twin) passes both
  // ids explicitly -- there is no derivation fallback anymore, since a
  // Project no longer has one fixed Twin (see tools/project.ts). Missing
  // twinId means a broken/incomplete link, not a loading state.
  if (!twinId) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <ErrorState
          message="No Twin was selected for this conversation."
          actionLabel="Go Back"
          onRetry={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  if (isInitializing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <LoadingState message="Loading conversation..." />
      </SafeAreaView>
    );
  }

  // A failed project load (as opposed to a softer twin/history hiccup, which
  // still surfaces via the inline banner below) leaves `project` null --
  // nothing else on this screen is usable until that's retried.
  if (!project && error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {backButton}
        <ErrorState message={error} onRetry={retry} />
      </SafeAreaView>
    );
  }

  return (
    // KeyboardAvoidingView wraps SafeAreaView (not the other way around) so
    // its own frame measurement includes the full safe area — otherwise its
    // padding/height math is computed against an already-inset frame and
    // undershoots. No keyboardVerticalOffset needed: the native header is
    // hidden on this screen (see app/_layout.tsx), so there's no header
    // height to compensate for.
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
        {/* Header — pinned, never scrolls. The only header on this screen
            (the native one is off, see app/_layout.tsx): back button, Twin
            name, Project name as a small subtitle. No avatar, no icons —
            kept intentionally minimal rather than crowded. */}
        <View className="flex-row items-center gap-3 px-4 py-3.5 border-b border-surface-border bg-background">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-base font-semibold text-on-surface" numberOfLines={1}>
              {twin?.name ?? 'Unknown twin'}
            </Text>
            <Text className="text-xs text-on-surface-variant" numberOfLines={1}>
              {project?.name ?? 'Unknown project'}
            </Text>
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
              icon={<BrandMark size={36} />}
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
            <View className="flex-row items-center justify-between bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
              <Text className="flex-1 text-sm text-red-400 mr-3">{error}</Text>
              <Button title="Retry" size="sm" variant="secondary" onPress={retry} />
            </View>
          </View>
        )}

        {/* Input — grows from 1 to ~5 lines. Same rounded-pill + circular
            send-button treatment as the Interview screens, so composing a
            message feels like the same product throughout the app. A soft
            glow lifts it off the conversation, reading as a floating
            composer rather than a flat form row. */}
        <View
          className="flex-row items-end gap-2 px-4 py-3 bg-background border-t border-surface-border"
          style={{ ...theme.shadows.md, shadowOffset: { width: 0, height: -2 } }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a question..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            onContentSizeChange={handleComposerSizeChange}
            editable={!isSending}
            className="flex-1 bg-surface-high rounded-2xl px-4 py-3 text-base text-on-surface"
            style={{ height: composerHeight, textAlignVertical: 'top' }}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isSending}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              inputText.trim() && !isSending ? 'bg-primary-600' : 'bg-surface-highest'
            }`}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={theme.colors.textInverse} />
            ) : (
              <Ionicons
                name="arrow-up"
                size={20}
                color={inputText.trim() ? theme.colors.textInverse : theme.colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
