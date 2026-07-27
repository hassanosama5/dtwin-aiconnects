/**
 * Message Bubble
 *
 * Renders one turn of a conversation. Agent bubbles carry a thin primary
 * accent bar on the leading edge — the one deliberate signature touch on an
 * otherwise quiet, restrained surface — so the Decision Twin's voice reads
 * as distinct without resorting to avatars or chatbot styling.
 */

import React from 'react';
import { View, Text } from 'react-native';

interface MessageBubbleProps {
  role: 'agent' | 'user';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <View className="self-end bg-primary-600 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
        <Text className="text-white text-base leading-relaxed">{content}</Text>
      </View>
    );
  }

  return (
    <View className="self-start flex-row max-w-[85%]">
      <View className="w-[3px] rounded-full bg-primary-500 mr-3 my-0.5" />
      <View className="flex-1 bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <Text className="text-gray-900 text-base leading-relaxed">{content}</Text>
      </View>
    </View>
  );
}
