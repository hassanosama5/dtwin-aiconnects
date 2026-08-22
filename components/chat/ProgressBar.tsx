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
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

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
    <View className="px-6 pt-3 pb-2.5">
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</Text>
        <Text className="text-xs font-medium text-gray-400">
          {Math.min(collected, total)} of {total}
        </Text>
      </View>
      <View className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <Animated.View style={[fillStyle, { height: '100%' }]}>
          <LinearGradient
            colors={[theme.colors.gradient.from, theme.colors.gradient.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 9999 }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
