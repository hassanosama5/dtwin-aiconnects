/**
 * Welcome Screen
 *
 * The unauthenticated entry point: Splash-like branded moment with two
 * explicit paths (Sign In / Create Account) rather than dropping straight
 * into a form. See app/auth/sign-in.tsx and sign-up.tsx for the forms
 * themselves.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Wordmark } from '../../components/ui/Wordmark';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-8">
        <Wordmark width={130} />
        <Text style={theme.typography.scale.caption} className="mt-2">
          Your Digital Professional
        </Text>
        <Text className="text-base text-on-surface-variant text-center mt-6 leading-6">
          Talk to an AI representative that reasons the way you do — for
          every project, every decision.
        </Text>
      </View>

      <View className="px-8 pb-8 gap-3">
        <Button title="Sign In" onPress={() => router.push('/auth/sign-in')} fullWidth />
        <Button
          title="Create Account"
          variant="secondary"
          onPress={() => router.push('/auth/sign-up')}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
