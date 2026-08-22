/**
 * Sign Up Screen
 *
 * On success with an active session, this screen does nothing further --
 * useAuthListener picks up the new session and the root layout's auth gate
 * redirects into (tabs) declaratively. But if the Supabase project still
 * requires email confirmation, signUp() succeeds with NO session (see
 * services/auth.ts) -- that case is shown explicitly here instead of
 * silently doing nothing, which is what made sign-up look broken before.
 */

import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const result = await signUp(email.trim(), password);

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setNeedsConfirmation(true);
    }
    // Otherwise there's nothing else to do -- see file header comment.
  }

  if (needsConfirmation) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-lg font-semibold text-on-surface mb-2 text-center">Check your email</Text>
        <Text className="text-sm text-on-surface-variant text-center mb-6">
          We sent a confirmation link to {email.trim()}. Confirm your account, then sign in.
        </Text>
        <Button title="Back to Sign In" onPress={() => router.replace('/auth/sign-in')} />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-center">
          <Text className="text-2xl font-bold text-on-surface mb-1">Create your account</Text>
          <Text className="text-sm text-on-surface-variant mb-6">
            A Decision Twin is personal — sign up to create your own.
          </Text>

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
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isSubmitting}
          />

          {error && <Text className="text-sm text-red-500 mt-3">{error}</Text>}

          <View className="mt-6">
            <Button title="Sign Up" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} fullWidth />
          </View>

          <Button
            title="Already have an account? Sign In"
            variant="ghost"
            onPress={() => router.replace('/auth/sign-in')}
            disabled={isSubmitting}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
