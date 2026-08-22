/**
 * Project Tools
 *
 * Tools for managing project profiles.
 */

import { supabase } from '../services/supabase';
import { ProjectProfile } from '../types/profile';
import { Project, ProjectInsert } from '../types/database';
import { logger } from '../utils/logger';
import { Tool } from './types';

/**
 * Save a project profile. Not agent-driven -- this is called directly from
 * a plain form (app/project/create.tsx). `twinId` is optional: a Project is
 * an independent workspace, not owned by one Twin; which Twin answers
 * questions about it is chosen at chat-time, not fixed at creation.
 */
export async function saveProjectProfile(
  profile: ProjectProfile,
  twinId?: string
): Promise<{ success: true; project: Project } | { success: false; error: string }> {
  try {
    logger.info('Saving project profile', { title: profile.title, twinId });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Must be signed in to create a project');
    }

    const projectData: ProjectInsert = {
      owner_id: userData.user.id,
      twin_id: twinId ?? null,
      name: profile.title,
      description: profile.description || null,
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

/** A project joined with its owning twin's display info -- for screens that
 *  list projects across every twin (the Projects tab, Home's quick view)
 *  rather than one twin's own project list. */
export interface ProjectWithTwin extends Project {
  twins: { name: string; avatar_url: string | null } | null;
}

/**
 * List every project across every twin, newest first.
 */
export async function listAllProjects(): Promise<
  { success: true; projects: ProjectWithTwin[] } | { success: false; error: string }
> {
  try {
    logger.info('Loading all projects');

    const { data, error } = await supabase
      .from('projects')
      .select('*, twins(name, avatar_url)')
      .order('created_at', { ascending: false }) as { data: ProjectWithTwin[] | null; error: any };

    if (error) throw error;

    return { success: true, projects: data || [] };
  } catch (error) {
    logger.error('Failed to load all projects', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ProjectTool
 *
 * Groups the project functions above under one named tool so agents can
 * declare ownership (e.g. `tools: [ProjectTool]`) instead of importing
 * these functions ad hoc.
 */
export const ProjectTool: Tool & {
  save: typeof saveProjectProfile;
  get: typeof getProjectProfile;
  list: typeof listProjects;
  listAll: typeof listAllProjects;
} = {
  name: 'ProjectTool',
  description: 'Save, load, and list project profiles for a Decision Twin.',
  save: saveProjectProfile,
  get: getProjectProfile,
  list: listProjects,
  listAll: listAllProjects,
};
