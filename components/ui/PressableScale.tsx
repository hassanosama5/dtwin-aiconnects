/**
 * Pressable Scale
 *
 * Generic press-interaction wrapper: scales down slightly on press, back
 * up on release. Used by TwinCard, ProjectCard, and SuggestionChips so the
 * same tactile feel is shared instead of duplicated.
 */

import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, GestureResponderEvent } from 'react-native';

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  scaleTo?: number;
  /** Fires with true on press-in and false on press-out (e.g. to drop a Card's shadow while pressed). */
  onPressedChange?: (pressed: boolean) => void;
}

export function PressableScale({
  children,
  scaleTo = 0.98,
  onPressedChange,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(event: GestureResponderEvent) {
    onPressedChange?.(true);
    Animated.timing(scale, { toValue: scaleTo, duration: 100, useNativeDriver: true }).start();
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    onPressedChange?.(false);
    Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    onPressOut?.(event);
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
