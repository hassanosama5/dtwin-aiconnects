/**
 * Chat Bubble
 *
 * Single message bubble, styled differently for AI vs. user messages.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { TypingIndicator } from './TypingIndicator';
import { theme } from '../../constants/theme';

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
      <View className={`mb-3.5 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
        <View
          className={`rounded-3xl px-4 py-3.5 ${
            isUser ? 'bg-primary-600 rounded-br-lg' : 'bg-gray-100 rounded-bl-lg'
          }`}
          style={!isUser ? theme.shadows.sm : undefined}
        >
          {typing ? (
            <View>
              {typingLabel && (
                <Text className="text-xs text-gray-500 mb-1">{typingLabel}</Text>
              )}
              <TypingIndicator />
            </View>
          ) : (
            <Text className={`text-base leading-6 ${isUser ? 'text-white' : 'text-ink-900'}`}>
              {message}
            </Text>
          )}
        </View>
        {footer}
      </View>
    </Animated.View>
  );
}
