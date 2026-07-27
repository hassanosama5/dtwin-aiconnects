/**
 * useInterview
 *
 * Drives a Create Twin / Create Project conversation. Owns all interview
 * orchestration (talking to the Coordinator, tracking the transcript,
 * detecting completion) so screens only render state and call sendMessage().
 *
 * Validation and persistence are NOT re-implemented here — InterviewAgent's
 * postProcess() already runs ValidationTool and saves via ProfileTool/
 * ProjectTool once the profile is genuinely complete (agents/interview.ts).
 * This hook only needs to react to the `complete` flag it gets back.
 */

import { useCallback, useRef, useState } from 'react';
import { createAgentRegistry } from '../agents/AgentRegistry';
import { InterviewMessage } from '../types/conversation';

export type InterviewType = 'personal' | 'project';

export interface UseInterviewOptions {
  type: InterviewType;
  /** Required when type === 'project' — which twin the project belongs to. */
  twinId?: string;
}

export interface UseInterviewResult {
  messages: InterviewMessage[];
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  /** Kicks off the interview with the agent's first question. Idempotent. */
  start: () => void;
  sendMessage: (content: string) => void;
}

// One shared registry for the app session — agents are constructed once,
// never per-render. See ARCHITECTURE.md.
const registry = createAgentRegistry();

const KICKOFF_MESSAGE: Record<InterviewType, string> = {
  personal: "Hi, I'd like to create my Decision Twin.",
  project: "I'd like to create a new project for my Decision Twin.",
};

function makeId(role: 'agent' | 'user'): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useInterview({ type, twinId }: UseInterviewOptions): UseInterviewResult {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mirrors `messages` synchronously so a turn always sends the transcript
  // that includes the message that triggered it, without relying on a
  // setState updater to sequence async work (an anti-pattern under Strict
  // Mode / concurrent rendering, where updaters can run more than once).
  const messagesRef = useRef<InterviewMessage[]>([]);
  const hasStarted = useRef(false);

  const appendMessage = useCallback((message: InterviewMessage) => {
    messagesRef.current = [...messagesRef.current, message];
    setMessages(messagesRef.current);
  }, []);

  const activeWorkflow = type === 'personal' ? 'CREATE_TWIN' : 'CREATE_PROJECT';

  const runTurn = useCallback(
    async (transcript: InterviewMessage[]) => {
      setIsLoading(true);
      setError(null);

      const latest = transcript[transcript.length - 1];
      const message = latest ? latest.content : KICKOFF_MESSAGE[type];

      const result = await registry.coordinator.execute({
        message,
        activeWorkflow,
        messages: transcript.map((m) => ({ role: m.role, content: m.content })),
        context: twinId ? { twinId } : undefined,
      });

      setIsLoading(false);

      if (!result.success || result.output.workflow === 'CHAT') {
        setError(result.error ?? 'Something went wrong. Please try again.');
        return;
      }

      const { interview } = result.output;

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
    },
    [type, twinId, activeWorkflow, appendMessage]
  );

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

  return { messages, isLoading, isComplete, error, start, sendMessage };
}
