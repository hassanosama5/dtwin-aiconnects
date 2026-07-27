/**
 * Profile Section Card
 *
 * Titled card used to display one section of a Person/Project profile
 * (e.g. Goal, Priorities, Constraints). Reused across Twin and Project screens.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui/Card';

interface ProfileSectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ProfileSectionCard({ title, children, className = '' }: ProfileSectionCardProps) {
  return (
    <Card className={`mb-4 ${className}`}>
      <Text className="text-base font-semibold text-gray-900 mb-3">{title}</Text>
      {children}
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
