/**
 * Tabs Layout
 *
 * Bottom navigation shell: Home, Projects, Chat, Profile -- 4 tabs, matching
 * the dark Material-3-style bottom nav in the user's mockups (flat icon +
 * label, no raised/emphasized center button). The "Conversations" tab was
 * removed: its only entry points (this tab, and Home's since-removed
 * "Continue Working -> See all" link) were both already gone, and the
 * mockup's own "Conversations" screen is the Chat screen itself, not a
 * separate list.
 */

import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <View
      className={`w-12 h-8 rounded-full items-center justify-center ${
        focused ? 'bg-primary-50' : ''
      }`}
    >
      <Ionicons name={name} size={22} color={focused ? theme.colors.primary[700] : theme.colors.textTertiary} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[700],
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: theme.colors.surface.base,
          borderTopColor: theme.colors.surface.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'folder-open' : 'folder-open-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
