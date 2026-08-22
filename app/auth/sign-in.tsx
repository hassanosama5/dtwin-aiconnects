/**
 * Sign In Screen
 *
 * On success this screen does NOT navigate manually -- useAuthListener
 * (mounted once at the root layout) picks up the new session via
 * onAuthStateChange, and the root layout's auth gate reacts to that and
 * redirects into (tabs) declaratively.
 */

import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const result = await signIn(email.trim(), password);

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
    }
    // On success there's nothing else to do -- see file header comment.
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-center">
          <Text className="text-2xl font-bold text-on-surface mb-1">Welcome back</Text>
          <Text className="text-sm text-on-surface-variant mb-6">Sign in to see your Decision Twins.</Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            editable={!isSubmitting}
          />
          <View className="h-4" />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isSubmitting}
          />

          {error && <Text className="text-sm text-red-500 mt-3">{error}</Text>}

          <View className="mt-6">
            <Button title="Sign In" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} fullWidth />
          </View>

          <Button
            title="Don't have an account? Create one"
            variant="ghost"
            onPress={() => router.replace('/auth/sign-up')}
            disabled={isSubmitting}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
