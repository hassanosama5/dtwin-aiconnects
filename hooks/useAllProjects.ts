/**
 * useAllProjects
 *
 * Fetches every project across every twin, newest first -- for the
 * Projects tab and Home's quick-glance sections. Pure read, so it calls
 * ProjectTool directly rather than round-tripping through the Coordinator.
 */

import { useCallback, useEffect, useState } from 'react';
import { ProjectTool, ProjectWithTwin } from '../tools/project';

export interface UseAllProjectsResult {
  projects: ProjectWithTwin[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAllProjects(): UseAllProjectsResult {
  const [projects, setProjects] = useState<ProjectWithTwin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await ProjectTool.listAll();

    setIsLoading(false);
    if (result.success) {
      setProjects(result.projects);
    } else {
      setError(result.error);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { projects, isLoading, error, refresh };
}
