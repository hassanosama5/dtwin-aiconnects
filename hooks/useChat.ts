/**
 * Chat hook
 *
 * Provides send/receive state for the chat experience while keeping the UI layer simple.
 */

import { useCallback, useMemo, useState } from 'react';
import { runDecisionPipeline } from '../services/decision/pipeline';
import type { ChatMessage } from '../types/conversation';
import { logger } from '../utils/logger';

export interface UseChatOptions {
  twinId: string;
  projectId: string;
}

export function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const pipelineResult = await runDecisionPipeline({
        question: content,
        twinId: options.twinId,
        projectId: options.projectId,
        conversationHistory: [...messages, userMessage],
      });

      if (!pipelineResult.success) {
        throw new Error(pipelineResult.error);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: pipelineResult.result.decision.answer,
        reasoning: pipelineResult.result.decision.reasoning,
        confidence: pipelineResult.result.decision.confidence,
        requiresHuman: pipelineResult.result.review.requiresHuman,
        timestamp: new Date(),
      };

      setMessages((current) => [...current, assistantMessage]);
      logger.success('Chat message processed', { content, assistant: assistantMessage.content });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      logger.error('Chat message failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, options.projectId, options.twinId]);

  return useMemo(() => ({
    messages,
    isLoading,
    error,
    sendMessage,
  }), [messages, isLoading, error, sendMessage]);
}
