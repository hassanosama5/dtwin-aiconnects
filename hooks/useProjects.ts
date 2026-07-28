/**
 * useProjects
 *
 * Fetches the project list for one twin -- used by the Twin Profile screen
 * to show real projects, and by Create Project to check whether this twin
 * already has one before starting a fresh interview. Pure read, so it calls
 * ProjectTool directly rather than round-tripping through the Coordinator.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectTool } from '../tools/project';
import { Project } from '../types/database';

export interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProjects(twinId: string | undefined): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!twinId) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await ProjectTool.list(twinId);

    setIsLoading(false);
    if (result.success) {
      setProjects(result.projects);
    } else {
      setError(result.error);
    }
  }, [twinId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { projects, isLoading, error, refresh };
}
