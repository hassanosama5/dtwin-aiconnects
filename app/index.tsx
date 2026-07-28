/**
 * Home Screen
 *
 * Lists all Decision Twins from the real backend (useTwins()). Refetches
 * whenever the screen regains focus (e.g. after the Create Twin modal is
 * dismissed) rather than relying on global state -- per PROJECT_SPEC.md's
 * "fetch it when needed" principle.
 *
 * UI polish carried over from the Sprint 6/7/7.1 mock-data version: pinned
 * header, a collapsing search bar, pull-to-refresh, and a staggered card
 * entrance animation -- now driven by real twins instead of mock data.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Input } from '../components/ui/Input';
import { Fab } from '../components/ui/Fab';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { TwinCard } from '../components/cards/TwinCard';
import { useTwins } from '../hooks/useTwins';
import { Twin } from '../types/database';

const SEARCH_BAR_HEIGHT = 56;
const SEARCH_COLLAPSE_DISTANCE = 60;

function AnimatedTwinCard({ twin, index }: { twin: Twin; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
    const delay = Math.min(index, 8) * 60;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
    // Animate in once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <TwinCard twin={twin} />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { twins, isLoading, error, refresh } = useTwins();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const filteredTwins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return twins;
    return twins.filter((twin) => twin.name.toLowerCase().includes(query));
  }, [search, twins]);

  const searchBarHeight = scrollY.interpolate({
    inputRange: [0, SEARCH_COLLAPSE_DISTANCE],
    outputRange: [SEARCH_BAR_HEIGHT, 0],
    extrapolate: 'clamp',
  });
  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, SEARCH_COLLAPSE_DISTANCE * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (isLoading && twins.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading Decision Twins..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorState message={error} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  if (twins.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmptyState
          title="No Decision Twins Yet"
          description="Create your first Decision Twin to begin."
          actionLabel="Create Twin"
          onAction={() => router.push('/interview/create-twin')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Pinned header — title never scrolls away */}
      <View className="px-6 pt-6 pb-1 bg-gray-50">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Decision Twin</Text>
        <Text className="text-base text-gray-600">Who would you like to ask?</Text>
      </View>

      {/* Collapsing search bar — also pinned, but shrinks away on scroll */}
      <Animated.View
        style={{ height: searchBarHeight, opacity: searchBarOpacity, overflow: 'hidden' }}
        className="px-6"
      >
        <Input
          placeholder="Search Twins..."
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </Animated.View>

      <Animated.FlatList
        data={filteredTwins}
        keyExtractor={(item: Twin) => item.id}
        renderItem={({ item, index }: { item: Twin; index: number }) => (
          <AnimatedTwinCard twin={item} index={index} />
        )}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 96 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-base text-gray-500 text-center">
              No twins match "{search}".
            </Text>
          </View>
        }
      />

      <Fab onPress={() => router.push('/interview/create-twin')} accessibilityLabel="Create Twin" />
    </SafeAreaView>
  );
}
