/**
 * Home Screen
 *
 * Displays all Decision Twins.
 * Phase 1: Placeholder implementation.
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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

          {/* Placeholder Content */}
          <Card className="mb-4">
            <Text className="text-gray-600 text-center py-8">
              No Decision Twins yet.
            </Text>
            <Text className="text-gray-500 text-center text-sm mb-6">
              Create your first Twin to get started.
            </Text>
          </Card>

          {/* Actions */}
          <Button
            title="Create Twin"
            onPress={() => {
              // TODO: Phase 2 - Navigate to interview screen
              console.log('Create Twin pressed');
            }}
            fullWidth
          />

          {/* Info Card */}
          <Card variant="flat" className="mt-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Phase 1: Foundation Complete ✅
            </Text>
            <Text className="text-sm text-gray-600">
              • Expo + TypeScript configured{'\n'}
              • Supabase client ready{'\n'}
              • Anthropic service ready{'\n'}
              • Type system established{'\n'}
              • UI components built{'\n'}
              • Architecture in place
            </Text>
          </Card>

          {/* Temporary: manual verification only, remove once Home -> Twin -> Project routing exists */}
          <View className="mt-4">
            <Button
              title="Open Project Screen (Testing)"
              variant="secondary"
              onPress={() => router.push('/project/demo')}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
