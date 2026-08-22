/**
 * Root Layout
 *
 * Configures navigation and global providers, and gates the whole app on
 * auth state: Splash (while the session check resolves) -> Sign In/Sign Up
 * -> the real app. useAuthListener() is mounted exactly once, here, and
 * mirrors Supabase's session into authStore; everything else just reads it
 * via useAuth().
 *
 * Auth gate, corrected: this used to conditionally render two DIFFERENT
 * `<Stack>` trees (one declaring only auth/* screens, one declaring the
 * rest) depending on isAuthenticated. That does not work in expo-router —
 * confirmed live, twice, including after a genuine cold restart and a
 * forced remount via a changed `key`. Reason: declaring a `Stack.Screen`
 * is NOT an allowlist. Every file under app/ is always part of this
 * layout's route table regardless of which ones are explicitly declared;
 * declaring one only overrides its options. So which subset of screens
 * happened to be declared in a given render never actually controlled
 * what was reachable — "/" (app/(tabs)/index.tsx) stayed resolvable no
 * matter which conditional branch was mounted, which is exactly why
 * sign-out never returned to Welcome despite SIGNED_OUT firing correctly.
 *
 * Fix: one Stack, declaring every screen, mounted unconditionally. A
 * separate <Redirect> reacts to isAuthenticated + the actual current path
 * and steers navigation — the same mechanism `Stack.Protected` wraps in
 * newer expo-router, done by hand since this version doesn't have it.
 */

import React from 'react';
import { View } from 'react-native';
import { Stack, Redirect, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthListener } from '../hooks/useAuthListener';
import { useAuth } from '../hooks/useAuth';
import { BrandMark } from '../components/ui/BrandMark';
import '../global.css';

function SplashGate() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <BrandMark size={48} />
    </View>
  );
}

/** Redirects based on isAuthenticated + the real current path -- rendered
 *  as a sibling inside the persistent Stack below, not as a screen itself. */
function AuthGate() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const onAuthScreen = pathname.startsWith('/auth');

  if (!isAuthenticated && !onAuthScreen) {
    return <Redirect href="/auth" />;
  }
  if (isAuthenticated && onAuthScreen) {
    return <Redirect href="/" />;
  }
  return null;
}

export default function RootLayout() {
  useAuthListener();
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashGate />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/index" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        {/* Home/Projects/Chat tab/Conversations/Profile — its own tab bar,
            see app/(tabs)/_layout.tsx. */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="twin/[id]" />
        <Stack.Screen name="project/[id]" />
        {/* Not 'modal', deliberately: modally-presented native-stack
            screens on iOS live in a separate view-controller layer with
            less reliable safe-area/header measurement, which is exactly
            what was breaking KeyboardAvoidingView/useHeaderHeight() here —
            chat/[projectId], a normal push screen with the identical
            KeyboardAvoidingView setup, never had this problem. */}
        <Stack.Screen name="interview/create-twin" />
        <Stack.Screen name="project/create" />
        <Stack.Screen name="chat/[projectId]" />
      </Stack>
    </SafeAreaProvider>
  );
}
