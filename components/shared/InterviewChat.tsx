/**
 * Interview Chat
 *
 * Drives a scripted, mock conversational interview: a brief "preparing"
 * phase, a chat phase (fixed question script, one AI question shown per
 * user reply with a short "AI is typing…" pause and suggestion chips), a
 * loading phase, a success confirmation, then a reveal phase showing a
 * pre-built profile summary.
 *
 * Purely local UI state — no data fetching, no agents. Wiring the real
 * conversation to the Interview Agent happens via hooks/useInterview() in
 * a later phase (see ROADMAP.md); this component only mocks the experience.
 *
 * Animations use React Native's built-in Animated API, not Reanimated —
 * Reanimated is installed but its babel plugin isn't configured, and
 * Reanimated 4 / react-native-worklets generally isn't supported in plain
 * Expo Go without a custom dev client. Animated needs no extra config and
 * covers everything this component needs.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SuggestionChips } from '../ui/SuggestionChips';
import { ChatBubble, ChatRole } from '../chat/ChatBubble';
import { theme } from '../../constants/theme';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

export interface InterviewQuestion {
  text: string;
  suggestions?: string[];
}

type InterviewPhase = 'preparing' | 'chat' | 'loading' | 'reveal' | 'success';

interface InterviewChatProps {
  /** questions[0] is the opening AI message; the rest are asked one per user reply. */
  questions: InterviewQuestion[];
  loadingTitle: string;
  loadingLines: string[];
  /** Shown briefly (with a fade) after Done is pressed, before navigating away. */
  successMessage: string;
  /** Rendered on the reveal screen — receives the user's raw answers in question order. */
  summary: (answers: string[]) => React.ReactNode;
  /** Primary reveal-screen button label. Defaults to "Done". */
  revealButtonLabel?: string;
  /**
   * Fires immediately when the primary reveal button is pressed, with the
   * user's raw answers in question order — e.g. to register mock data
   * using what they actually typed (not a canned summary). Runs before the
   * success animation.
   */
  onComplete?: (answers: string[]) => void;
  /** Fires after the success animation finishes — the actual "leave this screen" action. */
  onDone: () => void;
  /**
   * When provided, the reveal screen shows a secondary button (labeled
   * "Back") that discards the interview and calls this instead of
   * onComplete/onDone — no success animation, no data changes.
   */
  onDiscard?: () => void;
}

const PREPARING_DELAY_MS = 1300;
const AI_TYPING_DELAY_MS = 700;
const TYPING_FADE_OUT_MS = 200;
const LOADING_DELAY_MS = 2000;
const SUCCESS_DELAY_MS = 1000;

function SuccessMessage({ message }: { message: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View className="items-center">
        <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
          <Text className="text-3xl text-primary-600">✓</Text>
        </View>
        <Text className="text-lg font-semibold text-gray-900 text-center">{message}</Text>
      </View>
    </Animated.View>
  );
}

export function InterviewChat({
  questions,
  loadingTitle,
  loadingLines,
  successMessage,
  summary,
  revealButtonLabel = 'Done',
  onComplete,
  onDone,
  onDiscard,
}: InterviewChatProps) {
  const [phase, setPhase] = useState<InterviewPhase>('preparing');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'q0', role: 'ai', text: questions[0].text },
  ]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isTypingFadingOut, setIsTypingFadingOut] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'preparing') return;
    const timeout = setTimeout(() => setPhase('chat'), PREPARING_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timeout = setTimeout(() => setPhase('reveal'), LOADING_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'success') return;
    const timeout = setTimeout(() => onDone(), SUCCESS_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [phase, onDone]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isAiTyping]);

  useEffect(() => {
    const fraction = questions.length > 1 ? questionIndex / (questions.length - 1) : 1;
    Animated.timing(progress, { toValue: fraction, duration: 350, useNativeDriver: false }).start();
  }, [questionIndex, questions.length, progress]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
    };
  }, []);

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || isAiTyping) return;

    const userMessage: ChatMessage = { id: `u${questionIndex}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setAnswers((prev) => [...prev, trimmed]);
    setInputText('');

    const isLastQuestion = questionIndex >= questions.length - 1;
    if (isLastQuestion) {
      setPhase('loading');
      return;
    }

    setIsAiTyping(true);
    setIsTypingFadingOut(false);
    typingTimeoutRef.current = setTimeout(() => {
      const nextIndex = questionIndex + 1;
      const aiMessage: ChatMessage = { id: `q${nextIndex}`, role: 'ai', text: questions[nextIndex].text };
      setMessages((prev) => [...prev, aiMessage]);
      setQuestionIndex(nextIndex);
      // Cross-fade: the next question fades in (ChatBubble's own mount animation)
      // while the typing bubble fades out, instead of an abrupt swap.
      setIsTypingFadingOut(true);
      fadeOutTimeoutRef.current = setTimeout(() => {
        setIsAiTyping(false);
        setIsTypingFadingOut(false);
      }, TYPING_FADE_OUT_MS);
    }, AI_TYPING_DELAY_MS);
  }

  function handleDonePress() {
    onComplete?.(answers);
    setPhase('success');
  }

  if (phase === 'preparing') {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text className="text-base text-gray-600 mt-4 text-center">Preparing your interview...</Text>
      </View>
    );
  }

  if (phase === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2 text-center">
          {loadingTitle}
        </Text>
        {loadingLines.map((line, index) => (
          <Text key={index} className="text-sm text-gray-500 text-center">
            {line}
          </Text>
        ))}
      </View>
    );
  }

  if (phase === 'success') {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <SuccessMessage message={successMessage} />
      </View>
    );
  }

  if (phase === 'reveal') {
    return (
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1">
          <View className="p-6">{summary(answers)}</View>
        </ScrollView>
        <View className="px-6 py-4 bg-white border-t border-gray-200 gap-2">
          <Button title={revealButtonLabel} onPress={handleDonePress} fullWidth />
          {onDiscard && <Button title="Back" variant="secondary" onPress={onDiscard} fullWidth />}
        </View>
      </View>
    );
  }

  const currentSuggestions = questions[questionIndex]?.suggestions ?? [];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Progress bar — pinned above the conversation, never scrolls */}
      <View className="h-1 bg-gray-200 mx-6 mt-3 rounded-full overflow-hidden">
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: theme.colors.primary[600],
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="p-6">
          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role} message={message.text} />
          ))}
          {isAiTyping && <ChatBubble role="ai" typing fadeOut={isTypingFadingOut} />}
        </View>
      </ScrollView>

      {!isAiTyping && currentSuggestions.length > 0 && (
        <View className="px-6 pb-2">
          <SuggestionChips suggestions={currentSuggestions} onSelect={setInputText} />
        </View>
      )}

      <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-200">
        <View className="flex-1">
          <Input
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your answer..."
            fullWidth={false}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isAiTyping}
          />
        </View>
        <Button title="Send" onPress={handleSend} size="sm" disabled={!inputText.trim() || isAiTyping} />
      </View>
    </KeyboardAvoidingView>
  );
}
