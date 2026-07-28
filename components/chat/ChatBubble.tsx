/**
 * Chat Bubble
 *
 * Single message bubble, styled differently for AI vs. user messages.
 */

import React from 'react';
import { View, Text } from 'react-native';

export type ChatRole = 'ai' | 'user';

interface ChatBubbleProps {
  role: ChatRole;
  message: string;
  /** Optional extra content rendered below the bubble (e.g. confidence badge, reasoning). */
  footer?: React.ReactNode;
}

export function ChatBubble({ role, message, footer }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View className={`mb-3 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? 'bg-primary-600 rounded-br-md' : 'bg-gray-100 rounded-bl-md'
        }`}
      >
        <Text className={`text-base leading-5 ${isUser ? 'text-white' : 'text-gray-900'}`}>
          {message}
        </Text>
      </View>
      {footer}
    </View>
  );
}
