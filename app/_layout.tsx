/**
 * Root Layout
 *
 * Configures navigation and global providers.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Decision Twin',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="twin/[id]"
          options={{
            title: 'Twin Profile',
          }}
        />
        <Stack.Screen
          name="interview/create-twin"
          options={{
            title: 'Create Decision Twin',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="interview/create-project"
          options={{
            title: 'Create Project',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="chat/[projectId]"
          options={{
            title: 'Chat',
          }}
        />
      </Stack>
    </>
  );
}
