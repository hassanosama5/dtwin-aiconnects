/**
 * useTwin
 *
 * Fetches one twin by id for the Twin Profile screen. Pure read, no
 * reasoning involved, so it calls ProfileTool directly rather than
 * round-tripping through the Coordinator (see ARCHITECTURE.md).
 */

import { useCallback, useEffect, useState } from 'react';
import { ProfileTool } from '../tools/profile';
import { Twin } from '../types/database';

export interface UseTwinResult {
  twin: Twin | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTwin(twinId: string | undefined): UseTwinResult {
  const [twin, setTwin] = useState<Twin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!twinId) {
      setTwin(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await ProfileTool.get(twinId);

    setIsLoading(false);
    if (result.success) {
      setTwin(result.twin);
    } else {
      setError(result.error);
    }
  }, [twinId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { twin, isLoading, error, refresh };
}
