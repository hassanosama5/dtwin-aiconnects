/**
 * Profile Section Card
 *
 * Titled card used to display one section of a Person/Project profile
 * (e.g. Goal, Priorities, Constraints). Reused across Twin and Project screens.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';

interface ProfileSectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Briefly flashes the card to draw attention — e.g. a section just changed by a profile-merge update. */
  highlight?: boolean;
}

export function ProfileSectionCard({ title, children, className = '', highlight = false }: ProfileSectionCardProps) {
  const flashOpacity = useRef(new Animated.Value(highlight ? 1 : 0)).current;

  useEffect(() => {
    if (!highlight) return;
    Animated.timing(flashOpacity, { toValue: 0, duration: 900, delay: 150, useNativeDriver: true }).start();
  }, [highlight, flashOpacity]);

  return (
    <Card className={`mb-4 ${className}`}>
      <Text className="text-base font-semibold text-gray-900 mb-3">{title}</Text>
      {children}
      {highlight && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.primary[100],
            opacity: flashOpacity,
            borderRadius: 12,
          }}
        />
      )}
    </Card>
  );
}

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <View className="gap-2">
      {items.map((item, index) => (
        <View key={index} className="flex-row items-start">
          <Text className="text-gray-400 text-sm mr-2">{'•'}</Text>
          <Text className="flex-1 text-sm text-gray-600 leading-5">{item}</Text>
        </View>
      ))}
    </View>
  );
}
