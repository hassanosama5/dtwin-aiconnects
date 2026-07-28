/**
 * Twin Card
 *
 * Home screen list item: avatar, name, role, created date, and a
 * Create Project action. Tapping the person opens their Twin Profile;
 * the Create Project button is a separate, explicit action.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Twin } from '../../types/database';

function formatCreatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TwinCard({ twin }: { twin: Twin }) {
  const router = useRouter();

  return (
    <Card className="mb-3">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/twin/${twin.id}`)}
        className="flex-row items-center"
      >
        <Avatar name={twin.name} imageUrl={twin.avatar_url} size="lg" />
        <View className="flex-1 ml-4">
          <Text className="text-lg font-semibold text-gray-900">{twin.name}</Text>
          <Text className="text-sm text-gray-500">{twin.role}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            Created {formatCreatedDate(twin.created_at)}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="mt-4">
        <Button
          title="Create Project"
          variant="secondary"
          size="sm"
          onPress={() =>
            router.push({
              pathname: '/interview/create-project',
              params: { twinId: twin.id },
            })
          }
        />
      </View>
    </Card>
  );
}
