/**
 * Confidence Badge
 *
 * Small pill showing the Decision Agent's confidence for a response.
 * Display only — the confidence value itself is provided by the caller.
 */

import React from 'react';
import { View, Text } from 'react-native';

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <View className="self-start bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 mt-2">
      <Text className="text-xs font-medium text-gray-600">{confidence}% Confidence</Text>
    </View>
  );
}
