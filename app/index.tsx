/**
 * Home Screen
 *
 * Lists all Decision Twins. Refetches whenever the screen regains focus
 * (e.g. after the Create Twin modal is dismissed) rather than relying on
 * global state -- per PROJECT_SPEC.md's "fetch it when needed" principle.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTwins } from '../hooks/useTwins';
import { TwinCard } from '../components/cards/TwinCard';
import { theme } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { twins, isLoading, error, refresh } = useTwins();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const filteredTwins = search.trim()
    ? twins.filter((twin) => twin.name.toLowerCase().includes(search.trim().toLowerCase()))
    : twins;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Title is the native large header (see app/_layout.tsx) -- only the
            subtitle lives here, to avoid rendering "Decision Twin" twice. */}
        <View className="px-6 pt-1 pb-4">
          <Text className="text-base text-gray-500">Who would you like to ask?</Text>
        </View>

        {twins.length > 0 && (
          <View className="px-6 pb-4">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5">
              <Ionicons name="search" size={18} color={theme.colors.gray[400]} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search twins..."
                placeholderTextColor={theme.colors.gray[400]}
                className="flex-1 ml-2 text-base text-gray-900"
              />
            </View>
          </View>
        )}

        <View className="px-6 flex-1">
          {isLoading && twins.length === 0 ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator color={theme.colors.primary[600]} />
            </View>
          ) : error ? (
            <View className="items-center justify-center py-20 px-4">
              <Text className="text-sm text-red-500 text-center">{error}</Text>
            </View>
          ) : twins.length === 0 ? (
            <View className="items-center justify-center py-20 px-4">
              <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
                <Ionicons name="person-add-outline" size={28} color={theme.colors.primary[600]} />
              </View>
              <Text className="text-base font-semibold text-gray-900 mb-1 text-center">
                You haven't created any Decision Twins yet.
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Create your first Twin to get started.
              </Text>
            </View>
          ) : filteredTwins.length === 0 ? (
            <View className="items-center justify-center py-20 px-4">
              <Text className="text-sm text-gray-500 text-center">
                No twins match "{search}".
              </Text>
            </View>
          ) : (
            filteredTwins.map((twin) => <TwinCard key={twin.id} twin={twin} />)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push('/interview/create-twin')}
        activeOpacity={0.85}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
