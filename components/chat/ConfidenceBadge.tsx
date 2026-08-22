/**
 * Confidence Badge
 *
 * Linear progress bar + percentage, showing the Decision Agent's confidence
 * for a response -- matches the mockup's treatment (a filled track, not a
 * pill badge). Display only; the confidence value itself is provided by the
 * caller. The 70% threshold mirrors the Review Agent's own `requiresHuman`
 * cutoff (skills/answerReview.ts) -- a presentation-only read of that
 * number, not a new business rule.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../constants/theme';

const HIGH_CONFIDENCE_THRESHOLD = 70;

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const isHigh = confidence >= HIGH_CONFIDENCE_THRESHOLD;
  const fillColor = isHigh ? theme.colors.primary[600] : theme.colors.warning;
  const clamped = Math.max(0, Math.min(100, confidence));

  return (
    <View className="self-stretch mt-2.5" style={{ maxWidth: 220 }}>
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
          Confidence
        </Text>
        <Text className="text-[11px] font-semibold" style={{ color: fillColor }}>
          {clamped}%
        </Text>
      </View>
      <View className="h-1.5 rounded-full bg-surface-highest overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${clamped}%`, backgroundColor: fillColor }}
        />
      </View>
    </View>
  );
}
