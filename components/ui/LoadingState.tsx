/**
 * Loading State
 *
 * Full-bleed centered spinner + message. Fills whatever container it's
 * placed in — pair with a `flex-1` parent.
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      <Text className="text-base text-gray-600 mt-4 text-center">{message}</Text>
    </View>
  );
}
