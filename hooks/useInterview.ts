/**
 * useInterview
 *
 * Drives the Personal Decision Profile conversation for Create Twin. Owns
 * all orchestration (Coordinator calls, field accumulation, completion) so
 * the screen only renders state and calls sendMessage().
 *
 * Validation and persistence are NOT re-implemented here -- InterviewAgent's
 * postProcess() already runs ValidationTool and saves via ProfileTool once
 * the fields are code-verified complete. This hook only needs to react to
 * `complete` and merge `extracted` each turn.
 *
 * Single-stage only: this used to auto-transition into a second "Project
 * Context" interview stage after the personal profile completed, but
 * Projects are an independent workspace now, created via a plain form
 * (app/project/create.tsx) with no agent involved at all — see
 * tools/project.ts. Chaining a project interview after Twin creation would
 * have been exactly the stale, conflicting flow that redesign replaced.
 */

import { useCallback, useRef, useState } from 'react';
import { createAgentRegistry } from '../agents/AgentRegistry';
import { InterviewMessage } from '../types/conversation';

export interface UseInterviewResult {
  messages: InterviewMessage[];
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  progress: { collected: number; total: number } | null;
  suggestions: string[];
  /** Kicks off the interview with the agent's first question. Idempotent. */
  start: () => void;
  sendMessage: (content: string) => void;
}

// One shared registry for the app session — agents are constructed once,
// never per-render. See ARCHITECTURE.md.
const registry = createAgentRegistry();

const KICKOFF_MESSAGE = "Hi, I'd like to create my Decision Twin.";

function makeId(role: 'agent' | 'user'): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useInterview(): UseInterviewResult {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ collected: number; total: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesRef = useRef<InterviewMessage[]>([]);
  const collectedFieldsRef = useRef<Record<string, string | string[]>>({});
  const hasStarted = useRef(false);

  const appendMessage = useCallback((message: InterviewMessage) => {
    messagesRef.current = [...messagesRef.current, message];
    setMessages(messagesRef.current);
  }, []);

  const runTurn = useCallback(async (transcript: InterviewMessage[]) => {
    setIsLoading(true);
    setError(null);

    const latest = transcript[transcript.length - 1];
    const message = latest ? latest.content : KICKOFF_MESSAGE;

    const result = await registry.coordinator.execute({
      message,
      activeWorkflow: 'CREATE_TWIN',
      messages: transcript.map((m) => ({ role: m.role, content: m.content })),
      collectedFields: collectedFieldsRef.current,
    });

    setIsLoading(false);

    if (!result.success || result.output.workflow === 'CHAT') {
      setError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }

    const { interview } = result.output;

    // Replace, not merge -- interview.collectedFields is already the full,
    // normalized, accumulated state (see agents/interview.ts). Merging a
    // delta here was the bug: a value normalized on one turn would never
    // be re-normalized once carried forward as a stale raw copy.
    if (interview.collectedFields) {
      collectedFieldsRef.current = interview.collectedFields;
    }
    setSuggestions(interview.suggestions ?? []);
    setProgress(interview.progress ?? null);

    if (interview.complete) {
      setIsComplete(true);
      return;
    }

    if (interview.nextQuestion) {
      appendMessage({
        id: makeId('agent'),
        role: 'agent',
        content: interview.nextQuestion,
        timestamp: new Date(),
      });
    }
  }, [appendMessage]);

  const start = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    void runTurn([]);
  }, [runTurn]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading || isComplete) return;

      appendMessage({
        id: makeId('user'),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      });
      void runTurn(messagesRef.current);
    },
    [isLoading, isComplete, appendMessage, runTurn]
  );

  return {
    messages,
    isLoading,
    isComplete,
    error,
    progress,
    suggestions,
    start,
    sendMessage,
  };
}
