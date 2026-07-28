/**
 * Root Layout
 *
 * Configures navigation and global providers.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
          name="project/[id]"
          options={{
            title: 'Project',
          }}
        />
        <Stack.Screen
          name="interview/create-twin"
          options={{
            title: 'Create Decision Twin',
            presentation: 'modal',
            // Explicitly off: without this, native-stack's large-title mode
            // tries to bind to the screen's ScrollView for scroll-driven
            // collapse, but that ScrollView is nested inside
            // KeyboardAvoidingView + SafeAreaView, not a direct child --
            // breaking the binding and causing an immediate, un-scroll-driven
            // collapse. Modal/sheet screens shouldn't use large titles per
            // iOS HIG anyway (reserved for root browsing screens like Home).
            headerLargeTitle: false,
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
    </SafeAreaProvider>
  );
}
