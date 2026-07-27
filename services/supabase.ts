/**
 * Supabase Client
 *
 * Configured Supabase client for database access
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { Database } from '../types/database';
import { logger } from '../utils/logger';

const supabaseUrl = env.supabase.url || 'https://example.supabase.co';
const supabaseAnonKey = env.supabase.anonKey || 'placeholder-key';

// Create Supabase client with type safety; fall back to placeholders when the real env is missing.
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false, // No auth for MVP
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
