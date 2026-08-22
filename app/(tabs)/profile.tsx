/**
 * Profile Tab
 *
 * Real session data (email) + sign out. Signing out clears the Supabase
 * session; useAuthListener picks up the change and the root layout's auth
 * gate swaps back to the Sign In screen automatically -- this screen
 * doesn't navigate manually.
 */

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);
    const result = await signOut();
    setIsSigningOut(false);
    if (!result.success) {
      setError(result.error);
    }
  }

  const email = user?.email ?? 'Unknown account';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-ink-900">Profile</Text>
      </View>

      <View className="px-6">
        <Card className="items-center py-6 mb-4">
          <Avatar name={email} size="xl" />
          <Text className="text-base font-semibold text-ink-900 mt-3">{email}</Text>
        </Card>

        {error && <Text className="text-sm text-red-500 mb-3 text-center">{error}</Text>}

        <Button title="Sign Out" variant="secondary" onPress={handleSignOut} loading={isSigningOut} fullWidth />
      </View>
    </SafeAreaView>
  );
}
