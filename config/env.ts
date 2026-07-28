import Constants from 'expo-constants';

/**
 * Environment Configuration
 *
 * All environment variables are accessed through this module.
 * No secrets should ever be hardcoded in the application.
 */

const getEnvVar = (key: string): string => {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const getOptionalEnvVar = (
  key: string,
  defaultValue: string = ''
): string => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || defaultValue;
};

export const env = {
  // LLM Configuration (iHQ LiteLLM proxy — OpenAI-compatible endpoint in front of Claude)
  llm: {
    apiKey: getEnvVar('EXPO_PUBLIC_LITELLM_API_KEY'),
    baseURL: getOptionalEnvVar(
      'EXPO_PUBLIC_LITELLM_BASE_URL',
      'https://litellm.i-hq.tech/v1'
    ),
    model: 'anthropic/claude-haiku-4-5' as const,
    maxTokens: 4096,
    temperature: 0.7,
  },

  // Supabase Configuration
  supabase: {
    url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  },

  // Application Configuration
  app: {
    environment: getOptionalEnvVar(
      'EXPO_PUBLIC_ENV',
      'development'
    ) as 'development' | 'production',
    enableLogging:
      getOptionalEnvVar('EXPO_PUBLIC_ENV', 'development') === 'development',
  },
} as const;

// Type-safe environment access
export type Environment = typeof env;