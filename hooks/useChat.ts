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

export function useChat(projectId: string): UseChatResult {
  const setAgentExecution = useAppStore((s) => s.setAgentExecution);
  const resetAgentExecution = useAppStore((s) => s.resetAgentExecution);

  const [project, setProject] = useState<Project | null>(null);
  const [twin, setTwin] = useState<Twin | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const twinIdRef = useRef<string | undefined>(undefined);
  const lastFailedMessageRef = useRef<string | null>(null);
  const loadFailedRef = useRef(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSendingRef = useRef(false);

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

    const projectResult = await ProjectTool.get(projectId);
    if (!isMountedRef.current) return;

    if (!projectResult.success) {
      setError(projectResult.error);
      loadFailedRef.current = true;
      setIsInitializing(false);
      return;
    }

    setProject(projectResult.project);
    twinIdRef.current = projectResult.project.twin_id;

    const [twinResult, historyResult] = await Promise.all([
      ProfileTool.get(projectResult.project.twin_id),
      ConversationTool.getHistory(projectId),
    ]);
    if (!isMountedRef.current) return;

    let hasLoadError = false;

    if (twinResult.success) {
      setTwin(twinResult.twin);
    } else {
      setError(twinResult.error);
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
  }, [projectId]);

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
      const twinId = twinIdRef.current;
      if (!twinId) {
        setError('Project context is still loading. Please wait a moment and try again.');
        isSendingRef.current = false;
        return;
      }

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
        isSendingRef.current = false;
        if (isMountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [projectId, setAgentExecution, clearPendingReset, scheduleReset]
  );

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
