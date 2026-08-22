/**
 * Error State
 *
 * Full-bleed centered error message + retry button. Fills whatever
 * container it's placed in — pair with a `flex-1` parent.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, actionLabel = 'Try Again', onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Ionicons name="alert-circle-outline" size={32} color={theme.colors.error} style={{ marginBottom: 12 }} />
      <Text className="text-base text-gray-700 text-center mb-6">{message}</Text>
      {onRetry && <Button title={actionLabel} onPress={onRetry} variant="secondary" />}
    </View>
  );
}
