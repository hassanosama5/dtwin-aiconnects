/**
 * Message Bubble
 *
 * Renders one turn of a conversation. Agent bubbles carry a thin primary
 * accent bar on the leading edge — the one deliberate signature touch on an
 * otherwise quiet, restrained surface — so the Decision Twin's voice reads
 * as distinct without resorting to avatars or chatbot styling. Fades and
 * slides in on mount, matching ChatBubble's entrance in the Chat screen so
 * both conversational surfaces feel like the same product.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface MessageBubbleProps {
  role: 'agent' | 'user';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
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

  if (role === 'user') {
    return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }} className="self-end max-w-[85%]">
        <View className="bg-primary-600 rounded-2xl rounded-br-md px-4 py-3">
          <Text className="text-white text-base leading-relaxed">{content}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className="self-start flex-row max-w-[85%]"
    >
      <View className="w-[3px] rounded-full bg-primary-500 mr-3 my-0.5" />
      <View className="flex-1 bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <Text className="text-gray-900 text-base leading-relaxed">{content}</Text>
      </View>
    </Animated.View>
  );
}
