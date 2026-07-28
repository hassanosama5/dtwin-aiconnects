/**
 * useProject
 *
 * Fetches one project by id for the Project screen. Pure read, so it calls
 * ProjectTool directly rather than round-tripping through the Coordinator.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectTool } from '../tools/project';
import { Project } from '../types/database';

export interface UseProjectResult {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProject(projectId: string | undefined): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await ProjectTool.get(projectId);

    setIsLoading(false);
    if (result.success) {
      setProject(result.project);
    } else {
      setError(result.error);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { project, isLoading, error, refresh };
}
