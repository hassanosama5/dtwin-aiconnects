/**
 * Chat Screen
 *
 * Main demo screen with agent execution visualization.
 * Phase 2 implementation placeholder.
 */

import React from 'react';
import { View, Text } from 'react-native';
// See app/index.tsx -- react-native's own SafeAreaView is deprecated and
// collapses to zero height under the New Architecture on iOS.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-gray-600">
          Chat Screen - Phase 2
        </Text>
      </View>
    </SafeAreaView>
  );
}
