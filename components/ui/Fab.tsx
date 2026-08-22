/**
 * Floating Action Button
 *
 * Circular, bottom-right, shadowed, scales down slightly on press.
 * Uses React Native's built-in Animated API (not Reanimated — see
 * components/shared/InterviewChat.tsx header comment for why).
 */

import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

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
        ...theme.shadows.lg,
        shadowOpacity: 0.2, // slightly stronger than the default lg preset — FAB floats over content
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
        <Ionicons name="add" size={26} color={theme.colors.textInverse} />
      </Pressable>
    </Animated.View>
  );
}
