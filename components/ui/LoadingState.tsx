/**
 * Loading State
 *
 * Full-bleed centered brand mark + message. Fills whatever container it's
 * placed in — pair with a `flex-1` parent. Uses a gently pulsing BrandMark
 * instead of a generic spinner, per the "meaningful execution states, not
 * generic AI loading indicators" design principle.
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BrandMark } from './BrandMark';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.ease }),
        withTiming(0.5, { duration: 700, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Animated.View style={animatedStyle}>
        <BrandMark size={36} />
      </Animated.View>
      <Text className="text-base text-gray-600 mt-4 text-center">{message}</Text>
    </View>
  );
}
