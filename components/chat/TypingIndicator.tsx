/**
 * Typing Indicator
 *
 * Three bouncing dots, used inside a ChatBubble (via its `typing` prop)
 * to represent "AI is typing…" / "Thinking…".
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

function useDotAnimation(delay: number) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(300),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, value]);

  return value;
}

function Dot({ delay }: { delay: number }) {
  const value = useDotAnimation(delay);
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#9ca3af',
        marginHorizontal: 2,
        opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
        transform: [{ translateY }],
      }}
    />
  );
}

export function TypingIndicator() {
  return (
    <View className="flex-row items-center py-1">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
