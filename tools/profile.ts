/**
 * Profile Tools
 *
 * Tools for managing person profiles.
 */

import { supabase } from '../services/supabase';
import { PersonProfile } from '../types/profile';
import { Twin, TwinInsert } from '../types/database';
import { logger } from '../utils/logger';
import { Tool } from './types';

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

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Must be signed in to create a Decision Twin');
    }

    const twinData: TwinInsert = {
      owner_id: userData.user.id,
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

/**
 * ProfileTool
 *
 * Groups the profile functions above under one named tool so agents can
 * declare ownership (e.g. `tools: [ProfileTool]`) instead of importing
 * these functions ad hoc.
 */
export const ProfileTool: Tool & {
  save: typeof savePersonProfile;
  get: typeof getPersonProfile;
  list: typeof listTwins;
} = {
  name: 'ProfileTool',
  description: 'Save, load, and list Decision Twin personal profiles.',
  save: savePersonProfile,
  get: getPersonProfile,
  list: listTwins,
};
