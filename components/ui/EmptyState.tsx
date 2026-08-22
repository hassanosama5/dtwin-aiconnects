/**
 * Empty State
 *
 * Full-bleed centered title + optional description + optional action
 * button. Fills whatever container it's placed in — pair with a `flex-1`
 * parent.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional brand moment above the title — e.g. <BrandMark />. Left out
   *  for smaller/contextual empty states (e.g. "not found") where a logo
   *  would feel out of place. */
  icon?: React.ReactNode;
  /** Optional extra content rendered below the title/description/action (e.g. suggestion chips). */
  children?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon, children }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-lg font-semibold text-ink-900 text-center mb-2">{title}</Text>
      {description && (
        <Text className="text-sm text-gray-500 text-center mb-6">{description}</Text>
      )}
      {actionLabel && onAction && <Button title={actionLabel} onPress={onAction} />}
      {children}
    </View>
  );
}
