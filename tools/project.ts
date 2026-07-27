/**
 * Project Tools
 *
 * Tools for managing project profiles.
 * Phase 2 implementation placeholder.
 */

import { supabase } from '../services/supabase';
import { ProjectProfile } from '../types/profile';
import { Project, ProjectInsert } from '../types/database';
import { logger } from '../utils/logger';

/**
 * Save a project profile
 */
export async function saveProjectProfile(
  twinId: string,
  name: string,
  profile: ProjectProfile,
  description?: string
): Promise<{ success: true; project: Project } | { success: false; error: string }> {
  try {
    logger.info('Saving project profile', { twinId, name });

    const projectData: ProjectInsert = {
      twin_id: twinId,
      name,
      description: description || null,
      project_profile: profile,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData] as any)
      .select()
      .single() as { data: Project | null; error: any };

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    logger.success('Project profile saved', { projectId: data.id });

    return { success: true, project: data };
  } catch (error) {
    logger.error('Failed to save project profile', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a project profile
 */
export async function getProjectProfile(
  projectId: string
): Promise<{ success: true; project: Project } | { success: false; error: string }> {
  try {
    logger.info('Loading project profile', { projectId });

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single() as { data: Project | null; error: any };

    if (error) throw error;
    if (!data) throw new Error('Project not found');

    return { success: true, project: data };
  } catch (error) {
    logger.error('Failed to load project profile', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List projects for a twin
 */
export async function listProjects(
  twinId: string
): Promise<{ success: true; projects: Project[] } | { success: false; error: string }> {
  try {
    logger.info('Loading projects for twin', { twinId });

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('twin_id', twinId)
      .order('created_at', { ascending: false }) as { data: Project[] | null; error: any };

    if (error) throw error;

    return { success: true, projects: data || [] };
  } catch (error) {
    logger.error('Failed to load projects', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
