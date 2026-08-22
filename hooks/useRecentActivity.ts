/**
 * useRecentActivity
 *
 * Fetches the most recently active conversations (one per project) for the
 * Home screen's "Continue Working" section and the Conversations tab. Pure
 * read, so it calls ConversationTool directly rather than round-tripping
 * through the Coordinator (see ARCHITECTURE.md).
 */

import { useCallback, useEffect, useState } from 'react';
import { ConversationTool, RecentConversationItem } from '../tools/conversation';

export interface UseRecentActivityResult {
  conversations: RecentConversationItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRecentActivity(limit: number = 5): UseRecentActivityResult {
  const [conversations, setConversations] = useState<RecentConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await ConversationTool.listRecent(limit);

    setIsLoading(false);
    if (result.success) {
      setConversations(result.conversations);
    } else {
      setError(result.error);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversations, isLoading, error, refresh };
}
