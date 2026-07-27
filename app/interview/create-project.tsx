/**
 * Create Project Screen
 *
 * Project interview flow.
 * Phase 2 implementation placeholder.
 */

import React from 'react';
import { View, Text } from 'react-native';
// See app/index.tsx -- react-native's own SafeAreaView is deprecated and
// collapses to zero height under the New Architecture on iOS.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateProjectScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-gray-600">
          Create Project Interview - Phase 2
        </Text>
      </View>
    </SafeAreaView>
  );
}
