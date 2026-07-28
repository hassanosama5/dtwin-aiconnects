/**
 * Suggestion Chips
 *
 * Tappable suggestion pills. Selecting one fills a value into the caller's
 * input state — it never sends/submits on its own.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { PressableScale } from './PressableScale';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (value: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion) => (
        <PressableScale key={suggestion} onPress={() => onSelect(suggestion)}>
          <View className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5">
            <Text className="text-sm text-gray-700">{suggestion}</Text>
          </View>
        </PressableScale>
      ))}
    </View>
  );
}
