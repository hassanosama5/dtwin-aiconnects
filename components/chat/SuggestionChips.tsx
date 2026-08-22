/**
 * Suggestion Chips
 *
 * Quick-reply options for the current question. Tapping a chip sends it
 * immediately; typing a custom answer still works independently (the input
 * bar is a sibling, not replaced by this).
 */

import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

interface ChipProps {
  label: string;
  delay: number;
  onPress: () => void;
  disabled: boolean;
}

function Chip({ label, delay, onPress, disabled }: ChipProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 220 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 220 }));
  }, [delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        className="border border-primary-100 bg-primary-50 rounded-full px-4 py-2 mr-2"
      >
        <Text className="text-sm text-primary-700 font-medium">{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ suggestions, onSelect, disabled = false }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-5 pt-3 pb-2.5"
      contentContainerStyle={{ paddingRight: 12 }}
    >
      {suggestions.map((suggestion, index) => (
        <Chip
          key={suggestion}
          label={suggestion}
          delay={index * 40}
          disabled={disabled}
          onPress={() => onSelect(suggestion)}
        />
      ))}
    </ScrollView>
  );
}
