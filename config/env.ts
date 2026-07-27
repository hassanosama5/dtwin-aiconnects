import Constants from 'expo-constants';

/**
 * Environment Configuration
 *
 * All environment variables are accessed through this module.
 * No secrets should ever be hardcoded in the application.
 */

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key] || defaultValue;
  return value;
};

const getOptionalEnvVar = (key: string, defaultValue: string = ''): string => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || defaultValue;
};

export const env = {
  // Anthropic Configuration
  anthropic: {
    apiKey: getEnvVar('EXPO_PUBLIC_ANTHROPIC_API_KEY', ''),
    model: 'claude-haiku-4-5' as const, // Centralized model configuration
    maxTokens: 4096,
    temperature: 0.7,
  },

  // Supabase Configuration
  supabase: {
    url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://example.supabase.co'),
    anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key'),
  },

  // Application Configuration
  app: {
    environment: getOptionalEnvVar('EXPO_PUBLIC_ENV', 'development') as 'development' | 'production',
    enableLogging: getOptionalEnvVar('EXPO_PUBLIC_ENV', 'development') === 'development',
  },
} as const;

// Type-safe environment access
export type Environment = typeof env;
