/**
 * Input Component
 *
 * Text input with label and error state.
 */

import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { theme } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = true,
  className = '',
  style,
  ...props
}: InputProps) {
  return (
    <View className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <Text className="text-sm font-medium text-on-surface-variant mb-2">
          {label}
        </Text>
      )}

      <TextInput
        className={`
          border
          ${error ? 'border-red-500' : 'border-surface-border'}
          bg-surface
          rounded-lg
          px-4
          py-3
          text-base
          ${className}
        `}
        // Explicit color, not just the `text-gray-900` className — the typed
        // text wasn't rendering visibly with color set via className alone.
        style={[{ color: theme.colors.textPrimary }, style]}
        placeholderTextColor={theme.colors.gray[400]}
        {...props}
      />

      {error && (
        <Text className="text-sm text-red-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
