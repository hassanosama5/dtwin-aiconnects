/**
 * Typing Indicator
 *
 * Three softly pulsing dots inside a bubble, shown in the agent's position
 * while a response is in flight. No label needed — the motion itself reads
 * as "responding," matching restrained, non-chatbot-y motion.
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.ease }),
          withTiming(0.3, { duration: 350, easing: Easing.ease })
        ),
        -1
      )
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={style} className="w-1.5 h-1.5 rounded-full bg-gray-400 mx-0.5" />;
}

export function TypingIndicator() {
  return (
    <View className="self-start bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3.5 flex-row items-center">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
