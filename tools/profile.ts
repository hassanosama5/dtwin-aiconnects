/**
 * Profile Tools
 *
 * Tools for managing person profiles.
 * Phase 2 implementation placeholder.
 */

import { supabase } from '../services/supabase';
import { PersonProfile } from '../types/profile';
import { Twin, TwinInsert } from '../types/database';
import { logger } from '../utils/logger';

/**
 * Save a person profile
 */
export async function savePersonProfile(
  name: string,
  role: string,
  profile: PersonProfile,
  avatarUrl?: string
): Promise<{ success: true; twin: Twin } | { success: false; error: string }> {
  try {
    logger.info('Saving person profile', { name, role });

    const twinData: TwinInsert = {
      name,
      role,
      avatar_url: avatarUrl || null,
      personal_profile: profile,
    };

    const { data, error } = await supabase
      .from('twins')
      .insert([twinData] as any)
      .select()
      .single() as { data: Twin | null; error: any };

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    logger.success('Person profile saved', { twinId: data.id });

    return { success: true, twin: data };
  } catch (error) {
    logger.error('Failed to save person profile', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a person profile
 */
export async function getPersonProfile(
  twinId: string
): Promise<{ success: true; twin: Twin } | { success: false; error: string }> {
  try {
    logger.info('Loading person profile', { twinId });

    const { data, error } = await supabase
      .from('twins')
      .select('*')
      .eq('id', twinId)
      .single() as { data: Twin | null; error: any };

    if (error) throw error;
    if (!data) throw new Error('Twin not found');

    return { success: true, twin: data };
  } catch (error) {
    logger.error('Failed to load person profile', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List all twins
 */
export async function listTwins(): Promise<
  { success: true; twins: Twin[] } | { success: false; error: string }
> {
  try {
    logger.info('Loading all twins');

    const { data, error } = await supabase
      .from('twins')
      .select('*')
      .order('created_at', { ascending: false }) as { data: Twin[] | null; error: any };

    if (error) throw error;

    return { success: true, twins: data || [] };
  } catch (error) {
    logger.error('Failed to load twins', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
