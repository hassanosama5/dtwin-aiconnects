/**
 * Home Screen
 *
 * Displays all Decision Twins.
 * Sprint 2: static UI, mock data — wiring to useTwins() happens in Phase 3.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';

interface MockTwin {
  id: string;
  name: string;
  role: string;
  projectCount: number;
}

// Placeholder data — replace with useTwins() in Phase 3.
const MOCK_TWINS: MockTwin[] = [
  { id: 'hassan-osama', name: 'Hassan Osama', role: 'Project Manager', projectCount: 3 },
  { id: 'khaled-ashraf', name: 'Khaled Ashraf', role: 'Team Lead', projectCount: 2 },
  { id: 'mona-youssef', name: 'Mona Youssef', role: 'Product Owner', projectCount: 4 },
];

function TwinCard({ twin, onPress }: { twin: MockTwin; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-3 flex-row items-center">
        <Avatar name={twin.name} size="md" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900">{twin.name}</Text>
          <Text className="text-sm text-gray-600">{twin.role}</Text>
        </View>
        <Text className="text-sm text-gray-500">
          {twin.projectCount} {twin.projectCount === 1 ? 'Project' : 'Projects'}
        </Text>
      </Card>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Decision Twin
            </Text>
            <Text className="text-base text-gray-600">
              Who would you like to ask?
            </Text>
          </View>

          {/* Twin List */}
          <View className="mb-4">
            {MOCK_TWINS.map((twin) => (
              <TwinCard
                key={twin.id}
                twin={twin}
                onPress={() => router.push(`/twin/${twin.id}`)}
              />
            ))}
          </View>

          {/* Actions */}
          <Button
            title="Create Twin"
            onPress={() => {
              // TODO: Phase 2 - Navigate to interview screen
              console.log('Create Twin pressed');
            }}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
