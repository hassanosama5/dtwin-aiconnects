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
  ...props
}: InputProps) {
  return (
    <View className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}

      <TextInput
        className={`
          border
          ${error ? 'border-red-500' : 'border-gray-300'}
          bg-white
          rounded-lg
          px-4
          py-3
          text-base
          text-gray-900
          ${className}
        `}
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
