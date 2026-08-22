/**
 * Supabase Client
 *
 * Configured Supabase client for database access
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';
import { Database } from '../types/database';
import { logger } from '../utils/logger';

// Create Supabase client with type safety. AsyncStorage is required for
// persistent sessions on React Native -- supabase-js defaults to
// `localStorage`, which doesn't exist here, so persistSession would
// silently no-op without an explicit storage adapter.
export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, operation: string): never {
  logger.error(`Supabase ${operation} failed`, error);
  throw new Error(`Database operation failed: ${operation}`);
}

// Test connection (useful for debugging)
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('twins').select('count').limit(1);
    if (error) {
      logger.error('Supabase connection test failed', error);
      return false;
    }
    logger.success('Supabase connection successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection test failed', error);
    return false;
  }
}
