/**
 * Home Screen
 *
 * Lists all Decision Twins from the real backend (useTwins()). Refetches
 * whenever the screen regains focus rather than relying on global state.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { TwinCard } from '../components/cards/TwinCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Fab } from '../components/ui/Fab';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import { useTwins } from '../hooks/useTwins';
import { Twin } from '../types/database';

function AnimatedTwinCard({ twin, index }: { twin: Twin; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
    const delay = Math.min(index, 8) * 60;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TwinCard twin={twin} />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { twins, isLoading, error, refresh } = useTwins();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const filteredTwins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return twins;

    return twins.filter((twin) =>
      [twin.name, twin.role, twin.personal_profile?.decisionStyle ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [search, twins]);

  if (isLoading && twins.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading Decision Twins..." />
      </SafeAreaView>
    );
  }

  if (error && twins.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorState message={error} onRetry={() => void refresh()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-2 bg-gray-50">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Decision Twin</Text>
        <Text className="text-base text-gray-600">Who would you like to ask?</Text>
      </View>

      <View className="px-4 pb-3">
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search twins"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-24"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} />}
      >
        {filteredTwins.length === 0 ? (
          <EmptyState
            title={search ? 'No twins match your search.' : 'No Decision Twins yet.'}
            description={search ? 'Try another name or role.' : 'Create your first Twin to get started.'}
          />
        ) : (
          filteredTwins.map((twin, index) => <AnimatedTwinCard key={twin.id} twin={twin} index={index} />)
        )}
      </ScrollView>

      <Fab onPress={() => router.push('/interview/create-twin')} accessibilityLabel="Create Twin" />
    </SafeAreaView>
  );
}
