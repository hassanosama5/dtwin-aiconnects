/**
 * useChat
 *
 * Drives one project's chat conversation: loads the real project/twin and
 * conversation history, sends questions through the Coordinator -> Middleware
 * -> Decision -> Review pipeline, and appends the resulting answer or
 * escalation notice. Persistence (both the question and the final
 * answer/escalation) already happens inside CoordinatorAgent.runChat() via
 * ConversationTool -- this hook never saves messages itself, only loads them
 * and reflects what the Coordinator already persisted.
 *
 * Drives the shared `agentExecution` store slice (see store/appStore.ts) as
 * the pipeline actually progresses, via CoordinatorRequest.onStageChange --
 * real stage transitions, not a guessed/timed sequence. AgentExecution.tsx
 * already renders from exactly this shape, so no changes to that component
 * are needed.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createAgentRegistry } from '../agents/AgentRegistry';
import { ProfileTool } from '../tools/profile';
import { ProjectTool } from '../tools/project';
import { ConversationTool } from '../tools/conversation';
import { ChatMessage } from '../types/conversation';
import { Project, Twin } from '../types/database';
import { useAppStore } from '../store/appStore';

// One shared registry for the app session -- agents are constructed once,
// never per-render. See ARCHITECTURE.md.
const registry = createAgentRegistry();

const COMPLETION_RESET_DELAY = 1200;

function makeLocalId(role: 'user' | 'assistant'): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseChatResult {
  project: Project | null;
  twin: Twin | null;
  messages: ChatMessage[];
  isInitializing: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
  retry: () => void;
}

export function useChat(projectId: string, twinId: string): UseChatResult {
  const setAgentExecution = useAppStore((s) => s.setAgentExecution);
  const resetAgentExecution = useAppStore((s) => s.resetAgentExecution);

  const [project, setProject] = useState<Project | null>(null);
  const [twin, setTwin] = useState<Twin | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFailedMessageRef = useRef<string | null>(null);
  const loadFailedRef = useRef(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Issue 2: the actual duplicate-request guard. A ref is read and written
  // synchronously, in the same tick as the call that claims it -- unlike
  // `isSending` (state), there is no batching/async window in which two
  // near-simultaneous calls could both observe it as unclaimed.
  const isSendingRef = useRef(false);

  // Issue 4: guards every post-await continuation below. Sidesteps the
  // "abandon everything, don't touch state" problem without touching the
  // underlying requests -- persistence already happens inside
  // CoordinatorAgent.runChat() regardless of whether this hook reacts to
  // the result, so skipping state updates here never cancels anything.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearPendingReset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearPendingReset();
    resetTimeoutRef.current = setTimeout(() => {
      resetTimeoutRef.current = null;
      if (!isMountedRef.current) return;
      resetAgentExecution();
    }, COMPLETION_RESET_DELAY);
  }, [clearPendingReset, resetAgentExecution]);

  const loadContext = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    loadFailedRef.current = false;

    // twinId arrives explicit from the caller now (chosen at chat-time via
    // a Twin/Project picker) rather than derived from project.twin_id --
    // a Project no longer belongs to one fixed Twin, see tools/project.ts.
    const [projectResult, twinResult, historyResult] = await Promise.all([
      ProjectTool.get(projectId),
      ProfileTool.get(twinId),
      ConversationTool.getHistory(projectId),
    ]);
    if (!isMountedRef.current) return;

    // Issue 1: a failed twin load is a failed load, exactly like a failed
    // project or history load -- not a value we quietly leave as null while
    // reporting success. Whichever failure is found first sets the visible
    // error message; either way loadFailedRef flips so retry() re-fetches
    // everything rather than leaving the screen half-populated.
    let hasLoadError = false;

    if (projectResult.success) {
      setProject(projectResult.project);
    } else {
      setError(projectResult.error);
      loadFailedRef.current = true;
      hasLoadError = true;
    }

    if (twinResult.success) {
      setTwin(twinResult.twin);
    } else {
      if (!hasLoadError) {
        setError(twinResult.error);
      }
      loadFailedRef.current = true;
      hasLoadError = true;
    }

    if (historyResult.success) {
      setMessages(historyResult.messages);
    } else {
      if (!hasLoadError) {
        setError(historyResult.error);
      }
      loadFailedRef.current = true;
    }

    setIsInitializing(false);
  }, [projectId, twinId]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    return () => {
      clearPendingReset();
      resetAgentExecution();
    };
  }, [clearPendingReset, resetAgentExecution]);

  const runTurn = useCallback(
    async (content: string) => {
      clearPendingReset();
      setIsSending(true);
      setError(null);
      setAgentExecution('coordinator', 'Coordinator', 25);

      setMessages((prev) => [
        ...prev,
        { id: makeLocalId('user'), role: 'user', content, timestamp: new Date() },
      ]);

      try {
        const result = await registry.coordinator.execute({
          message: content,
          context: { twinId, projectId },
          onStageChange: (stage) => {
            if (!isMountedRef.current) return;
            const label = stage === 'decision' ? 'Decision' : stage === 'review' ? 'Review' : undefined;
            const progress = stage === 'decision' ? 55 : stage === 'review' ? 80 : 100;
            setAgentExecution(stage, label, progress);
          },
        });

        if (!isMountedRef.current) return;

        if (!result.success || result.output.workflow !== 'CHAT') {
          setAgentExecution('error', undefined, 0);
          lastFailedMessageRef.current = content;
          setError(result.error ?? 'Something went wrong. Please try again.');
          scheduleReset();
          return;
        }

        const { decision, review } = result.output;

        const assistantMessage: ChatMessage = review.approved
          ? {
              id: makeLocalId('assistant'),
              role: 'assistant',
              content: decision.answer,
              reasoning: decision.reasoning,
              confidence: decision.confidence,
              timestamp: new Date(),
            }
          : {
              id: makeLocalId('assistant'),
              role: 'assistant',
              content: review.reason ?? 'This decision requires approval from the represented person.',
              confidence: review.confidence,
              requiresHuman: true,
              timestamp: new Date(),
            };

        setMessages((prev) => [...prev, assistantMessage]);
        lastFailedMessageRef.current = null;
        scheduleReset();
      } finally {
        // Issue 2: released unconditionally, on every exit path (success,
        // handled failure, or an unexpected throw) -- never left claimed.
        isSendingRef.current = false;
        if (isMountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [projectId, twinId, setAgentExecution, clearPendingReset, scheduleReset]
  );

  // Issue 2: the single place a turn is allowed to start. Claims the ref
  // synchronously before anything async happens, so two calls arriving in
  // the same event-loop tick cannot both pass.
  const startTurn = useCallback(
    (content: string) => {
      if (isSendingRef.current) return;
      isSendingRef.current = true;
      void runTurn(content);
    },
    [runTurn]
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      startTurn(trimmed);
    },
    [startTurn]
  );

  const retry = useCallback(() => {
    if (loadFailedRef.current) {
      void loadContext();
      return;
    }
    if (lastFailedMessageRef.current) {
      startTurn(lastFailedMessageRef.current);
    }
  }, [loadContext, startTurn]);

  return {
    project,
    twin,
    messages,
    isInitializing,
    isSending,
    error,
    sendMessage,
    retry,
  };
}
