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
  llm: {
    apiKey: getEnvVar('EXPO_PUBLIC_LITELLM_API_KEY', ''),
    baseURL: getOptionalEnvVar('EXPO_PUBLIC_LITELLM_BASE_URL', 'https://litellm.i-hq.tech/v1'),
    model: getEnvVar('EXPO_PUBLIC_LITELLM_MODEL', 'anthropic/claude-haiku-4-5'),
    maxTokens: 4096,
    temperature: 0.7,
  },

  litellm: {
    apiKey: getEnvVar('EXPO_PUBLIC_LITELLM_API_KEY', ''),
    baseUrl: getEnvVar('EXPO_PUBLIC_LITELLM_BASE_URL', 'https://litellm.i-hq.tech/v1'),
    model: getEnvVar('EXPO_PUBLIC_LITELLM_MODEL', 'anthropic/claude-haiku-4-5'),
  },

  supabase: {
    url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://example.supabase.co'),
    anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key'),
  },

  app: {
    environment: getOptionalEnvVar('EXPO_PUBLIC_ENV', 'development') as 'development' | 'production',
    enableLogging: getOptionalEnvVar('EXPO_PUBLIC_ENV', 'development') === 'development',
  },
} as const;

export type Environment = typeof env;
