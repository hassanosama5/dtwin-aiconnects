/**
 * Chat Bubble
 *
 * Single message bubble, styled differently for AI vs. user messages.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { TypingIndicator } from './TypingIndicator';

export type ChatRole = 'ai' | 'user';

interface ChatBubbleProps {
  role: ChatRole;
  /** Ignored when `typing` is true. */
  message?: string;
  /** Renders an animated "typing…" indicator instead of `message`. */
  typing?: boolean;
  /** Small label shown above the typing dots (e.g. "Decision Twin is thinking…"). */
  typingLabel?: string;
  /** Set true to smoothly fade this bubble out (e.g. a typing indicator being replaced by the real response). */
  fadeOut?: boolean;
  /** Optional extra content rendered below the bubble (e.g. confidence badge, reasoning). */
  footer?: React.ReactNode;
}

export function ChatBubble({ role, message, typing, typingLabel, fadeOut, footer }: ChatBubbleProps) {
  const isUser = role === 'user';
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    // Animate in once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fadeOut) return;
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, [fadeOut, opacity]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View className={`mb-3 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser ? 'bg-primary-600 rounded-br-md' : 'bg-gray-100 rounded-bl-md'
          }`}
        >
          {typing ? (
            <View>
              {typingLabel && (
                <Text className="text-xs text-gray-500 mb-1">{typingLabel}</Text>
              )}
              <TypingIndicator />
            </View>
          ) : (
            <Text className={`text-base leading-5 ${isUser ? 'text-white' : 'text-gray-900'}`}>
              {message}
            </Text>
          )}
        </View>
        {footer}
      </View>
    </Animated.View>
  );
}
