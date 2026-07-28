/**
 * Interview Chat
 *
 * Drives a scripted, mock conversational interview: a chat phase (fixed
 * question script, one AI question shown per user reply), a brief loading
 * phase, then a reveal phase showing a pre-built profile summary.
 *
 * Purely local UI state — no data fetching, no agents. Wiring the real
 * conversation to the Interview Agent happens via hooks/useInterview() in
 * a later phase (see ROADMAP.md); this component only mocks the experience.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChatBubble, ChatRole } from '../chat/ChatBubble';
import { theme } from '../../constants/theme';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

type InterviewPhase = 'chat' | 'loading' | 'reveal';

interface InterviewChatProps {
  /** questions[0] is the opening AI message; the rest are asked one per user reply. */
  questions: string[];
  loadingTitle: string;
  loadingLines: string[];
  summary: React.ReactNode;
  onDone: () => void;
}

const LOADING_DELAY_MS = 2000;

export function InterviewChat({ questions, loadingTitle, loadingLines, summary, onDone }: InterviewChatProps) {
  const [phase, setPhase] = useState<InterviewPhase>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'q0', role: 'ai', text: questions[0] },
  ]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timeout = setTimeout(() => setPhase('reveal'), LOADING_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { id: `u${questionIndex}`, role: 'user', text: trimmed };
    setInputText('');

    const isLastQuestion = questionIndex >= questions.length - 1;
    if (isLastQuestion) {
      setMessages((prev) => [...prev, userMessage]);
      setPhase('loading');
      return;
    }

    const nextIndex = questionIndex + 1;
    const aiMessage: ChatMessage = { id: `q${nextIndex}`, role: 'ai', text: questions[nextIndex] };
    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setQuestionIndex(nextIndex);
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

  if (phase === 'reveal') {
    return (
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1">
          <View className="p-6">{summary}</View>
        </ScrollView>
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <Button title="Done" onPress={onDone} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={scrollRef} className="flex-1">
        <View className="p-6">
          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role} message={message.text} />
          ))}
        </View>
      </ScrollView>

      <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-200">
        <View className="flex-1">
          <Input
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your answer..."
            fullWidth={false}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
        </View>
        <Button title="Send" onPress={handleSend} size="sm" />
      </View>
    </KeyboardAvoidingView>
  );
}
