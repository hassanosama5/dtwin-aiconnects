/**
 * Interview Progress Bar
 *
 * Thin, restrained progress indicator with a stage label -- so the
 * interview feels finite instead of open-ended. Fill width is driven by
 * code-computed progress (collected/total fields), never guessed.
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressBarProps {
  label: string;
  collected: number;
  total: number;
}

export function ProgressBar({ label, collected, total }: ProgressBarProps) {
  const ratio = total > 0 ? Math.min(collected / total, 1) : 0;
  const width = useSharedValue(ratio);

  useEffect(() => {
    width.value = withTiming(ratio, { duration: 300 });
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View className="px-6 pt-3 pb-2">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xs font-medium text-gray-500">{label}</Text>
        <Text className="text-xs text-gray-400">
          {Math.min(collected, total)} of {total}
        </Text>
      </View>
      <View className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <Animated.View style={fillStyle} className="h-full rounded-full bg-primary-500" />
      </View>
    </View>
  );
}
