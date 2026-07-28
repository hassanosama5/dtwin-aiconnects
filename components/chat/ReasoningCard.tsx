/**
 * Reasoning Card
 *
 * Collapsible "Why?" section attached to an AI chat message, revealing
 * the bullet points behind the answer. Initially collapsed.
 */

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BulletList } from '../cards/ProfileSectionCard';

interface ReasoningCardProps {
  reasoning: string[];
}

export function ReasoningCard({ reasoning }: ReasoningCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mt-2 self-start">
      <Pressable onPress={() => setExpanded((prev) => !prev)} className="flex-row items-center">
        <Text className="text-sm font-medium text-primary-600">Why?</Text>
        <Text className="text-xs text-primary-600 ml-1">{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-[260px]">
          <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Reasoning
          </Text>
          <BulletList items={reasoning} />
        </View>
      )}
    </View>
  );
}
