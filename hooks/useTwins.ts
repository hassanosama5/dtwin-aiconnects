/**
 * useTwins
 *
 * Fetches the twin list for the Home screen. Pure read, no reasoning
 * involved, so it calls ProfileTool directly rather than round-tripping
 * through the Coordinator (see ARCHITECTURE.md — the full Agent chain is
 * reserved for requests that actually need LLM reasoning).
 */

import { useCallback, useEffect, useState } from 'react';
import { ProfileTool } from '../tools/profile';
import { Twin } from '../types/database';

export interface UseTwinsResult {
  twins: Twin[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTwins(): UseTwinsResult {
  const [twins, setTwins] = useState<Twin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await ProfileTool.list();

    setIsLoading(false);
    if (result.success) {
      setTwins(result.twins);
    } else {
      setError(result.error);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { twins, isLoading, error, refresh };
}
