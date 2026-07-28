/**
 * Home Screen
 *
 * Displays all Decision Twins.
 * Sprint 2: static UI, mock data — wiring to useTwins() happens in Phase 3.
 * Sprint 6: loading/empty/error states — real data loading arrives in Phase 3.
 * Sprint 7: FAB, collapsing search bar, pull-to-refresh, card entrance animation.
 * Sprint 7.1: header is now truly pinned above the list (was scrolling away
 * before); newly-created twins are read from the shared mockDirectory via
 * useFocusEffect on every return to this screen, instead of navigation
 * params — more reliable, no stale params, no duplicate Home screens.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Fab } from '../components/ui/Fab';
import { PressableScale } from '../components/ui/PressableScale';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { listCreatedTwins } from '../utils/mockDirectory';

interface MockTwin {
  id: string;
  name: string;
  role: string;
  projectCount: number;
}

// Placeholder data — replace with useTwins() in Phase 3.
const INITIAL_TWINS: MockTwin[] = [
  { id: 'hassan-osama', name: 'Hassan Osama', role: 'Project Manager', projectCount: 3 },
  { id: 'khaled-ashraf', name: 'Khaled Ashraf', role: 'Team Lead', projectCount: 2 },
  { id: 'mona-youssef', name: 'Mona Youssef', role: 'Product Owner', projectCount: 4 },
  { id: 'habiba-anwar', name: 'Habiba Anwar', role: 'Project Manager', projectCount: 3 },
  { id: 'omar-ahmed', name: 'Omar Ahmed', role: 'Project Manager', projectCount: 2 },
];

const LOAD_DELAY_MS = 500;
const REFRESH_DELAY_MS = 700;
const SEARCH_BAR_HEIGHT = 56;
const SEARCH_COLLAPSE_DISTANCE = 60;

// DEV ONLY — flip to true to preview a state without a real backend.
// Remove once useTwins() lands and these states are driven by a real request.
const SIMULATE_EMPTY = false;
const SIMULATE_ERROR = false;

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

function AnimatedTwinCard({
  twin,
  index,
  onPress,
}: {
  twin: MockTwin;
  index: number;
  onPress: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
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
      <PressableScale onPress={onPress} onPressedChange={setPressed}>
        <Card className="mb-3 flex-row items-center" elevated={!pressed}>
          <Avatar name={twin.name} size="md" />
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-gray-900">{twin.name}</Text>
            <Text className="text-sm text-gray-600">{twin.role}</Text>
          </View>
          <Text className="text-sm text-gray-500">
            {twin.projectCount} {twin.projectCount === 1 ? 'Project' : 'Projects'}
          </Text>
        </Card>
      </PressableScale>
    </Animated.View>
  );
}

function toHomeTwin(profile: { id: string; name: string; role: string; projects: unknown[] }): MockTwin {
  return { id: profile.id, name: profile.name, role: profile.role, projectCount: profile.projects.length };
}

export default function HomeScreen() {
  const router = useRouter();

  const [status, setStatus] = useState<ViewStatus>('loading');
  const [twins, setTwins] = useState<MockTwin[]>(INITIAL_TWINS);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const load = useCallback(() => {
    setStatus('loading');
    const timeout = setTimeout(() => {
      if (SIMULATE_ERROR) setStatus('error');
      else if (SIMULATE_EMPTY) setStatus('empty');
      else setStatus('success');
    }, LOAD_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => load(), [load]);

  // Re-sync with newly-created mock twins every time Home comes into focus
  // (e.g. returning from Create Twin) — no navigation params involved, so
  // there's nothing to go stale and nothing that could push a duplicate
  // Home screen. Local/in-memory only — resets on app reload.
  useFocusEffect(
    useCallback(() => {
      const created = listCreatedTwins().map(toHomeTwin);
      setTwins([...INITIAL_TWINS, ...created]);
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setTwins([...INITIAL_TWINS, ...listCreatedTwins().map(toHomeTwin)]);
      setStatus('success');
      setRefreshing(false);
    }, REFRESH_DELAY_MS);
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

  if (status === 'loading') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LoadingState message="Loading Decision Twins..." />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorState message="Couldn't load your Decision Twins." onRetry={load} />
      </SafeAreaView>
    );
  }

  if (status === 'empty') {
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
        keyExtractor={(item: MockTwin) => item.id}
        renderItem={({ item, index }: { item: MockTwin; index: number }) => (
          <AnimatedTwinCard twin={item} index={index} onPress={() => router.push(`/twin/${item.id}`)} />
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
