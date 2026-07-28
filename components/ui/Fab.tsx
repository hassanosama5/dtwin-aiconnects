/**
 * Floating Action Button
 *
 * Circular, bottom-right, shadowed, scales down slightly on press.
 * Uses React Native's built-in Animated API (not Reanimated — see
 * components/shared/InterviewChat.tsx header comment for why).
 */

import React, { useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';

interface FabProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export function Fab({ onPress, accessibilityLabel = 'Create' }: FabProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  }

  function handlePress() {
    // Small "pop" before navigating — a brief expand-then-settle rather than an instant jump.
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 90, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start(() => onPress());
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        position: 'absolute',
        right: 20,
        bottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        className="w-14 h-14 rounded-full items-center justify-center bg-primary-600"
      >
        <Text className="text-white text-3xl" style={{ marginTop: -2 }}>
          +
        </Text>
      </Pressable>
    </Animated.View>
  );
}
