/**
 * useInterview
 *
 * Drives the full two-stage onboarding conversation: a short Personal
 * Decision Profile interview, then an automatic, same-session transition
 * into a Project Context interview once the personal profile is code-
 * verified complete. Owns all orchestration (Coordinator calls, field
 * accumulation, stage transition, completion) so screens only render state
 * and call sendMessage()/selectSuggestion().
 *
 * Validation and persistence are NOT re-implemented here -- InterviewAgent's
 * postProcess() already runs ValidationTool and saves via ProfileTool/
 * ProjectTool once each stage's fields are code-verified complete. This
 * hook only needs to react to `complete` and merge `extracted` each turn.
 */

import { useCallback, useRef, useState } from 'react';
import { createAgentRegistry } from '../agents/AgentRegistry';
import { InterviewMessage } from '../types/conversation';

export type InterviewStage = 'personal' | 'project';

export interface UseInterviewResult {
  messages: InterviewMessage[];
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  stage: InterviewStage;
  progress: { collected: number; total: number } | null;
  suggestions: string[];
  /** Kicks off the interview with the agent's first question. Idempotent. */
  start: () => void;
  sendMessage: (content: string) => void;
}

// One shared registry for the app session — agents are constructed once,
// never per-render. See ARCHITECTURE.md.
const registry = createAgentRegistry();

const KICKOFF_MESSAGE: Record<InterviewStage, string> = {
  personal: "Hi, I'd like to create my Decision Twin.",
  project: "Let's set up my first project.",
};

const TRANSITION_MESSAGE =
  "Great — that's your Decision Profile. Now let's set up your first project.";

function makeId(role: 'agent' | 'user'): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useInterview(): UseInterviewResult {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<InterviewStage>('personal');
  const [progress, setProgress] = useState<{ collected: number; total: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Full visible transcript, for the UI. Never reset.
  const messagesRef = useRef<InterviewMessage[]>([]);
  // Current-stage-only transcript, sent to the Interview Agent. Reset on
  // stage transition -- InterviewAgent counts agent turns in this list to
  // know how many fields it's already asked about *in this stage*.
  const stageMessagesRef = useRef<InterviewMessage[]>([]);
  const collectedFieldsRef = useRef<Record<string, string | string[]>>({});
  const twinIdRef = useRef<string | undefined>(undefined);
  const stageRef = useRef<InterviewStage>('personal');
  const hasStarted = useRef(false);

  const appendVisible = useCallback((message: InterviewMessage) => {
    messagesRef.current = [...messagesRef.current, message];
    setMessages(messagesRef.current);
  }, []);

  const appendStageMessage = useCallback(
    (message: InterviewMessage) => {
      stageMessagesRef.current = [...stageMessagesRef.current, message];
      appendVisible(message);
    },
    [appendVisible]
  );

  const runTurn = useCallback(
    async (stageTranscript: InterviewMessage[]) => {
      setIsLoading(true);
      setError(null);

      const currentStage = stageRef.current;
      const activeWorkflow = currentStage === 'personal' ? 'CREATE_TWIN' : 'CREATE_PROJECT';
      const latest = stageTranscript[stageTranscript.length - 1];
      const message = latest ? latest.content : KICKOFF_MESSAGE[currentStage];

      const result = await registry.coordinator.execute({
        message,
        activeWorkflow,
        messages: stageTranscript.map((m) => ({ role: m.role, content: m.content })),
        collectedFields: collectedFieldsRef.current,
        context: twinIdRef.current ? { twinId: twinIdRef.current } : undefined,
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
        if (interview.twinId) twinIdRef.current = interview.twinId;

        if (currentStage === 'personal') {
          stageRef.current = 'project';
          setStage('project');
          collectedFieldsRef.current = {};
          stageMessagesRef.current = [];
          setProgress(null);
          setSuggestions([]);
          appendVisible({
            id: makeId('agent'),
            role: 'agent',
            content: TRANSITION_MESSAGE,
            timestamp: new Date(),
          });
          void runTurn([]);
          return;
        }

        setIsComplete(true);
        return;
      }

      if (interview.nextQuestion) {
        appendStageMessage({
          id: makeId('agent'),
          role: 'agent',
          content: interview.nextQuestion,
          timestamp: new Date(),
        });
      }
    },
    [appendVisible, appendStageMessage]
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

      appendStageMessage({
        id: makeId('user'),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      });
      void runTurn(stageMessagesRef.current);
    },
    [isLoading, isComplete, appendStageMessage, runTurn]
  );

  return {
    messages,
    isLoading,
    isComplete,
    error,
    stage,
    progress,
    suggestions,
    start,
    sendMessage,
  };
}
