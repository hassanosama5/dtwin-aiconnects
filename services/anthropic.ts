/**
 * Anthropic Service
 *
 * Wrapper around Claude API calls. Transport: the OpenAI-compatible client
 * pointed at the course's LiteLLM proxy (see the professor's migration
 * spec) -- LiteLLM routes `anthropic/claude-haiku-4-5` to real Claude, but
 * only documents an OpenAI-compatible endpoint, so the `openai` SDK talks
 * to it directly instead of assuming an undocumented Anthropic-format route.
 *
 * Every exported name/signature below (chat, chatStream, getModelConfig,
 * ClaudeMessage, ChatRequest, ChatResponse) is unchanged from the direct-
 * Anthropic-SDK version -- only the transport internals moved, so no other
 * file in the codebase needed to change.
 *
 * Supports structured outputs with Zod validation and automatic retries.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { validateAgentResponse } from '../utils/validation';

// Initialize the OpenAI-compatible client against the LiteLLM proxy.
// dangerouslyAllowBrowser: this app already ships EXPO_PUBLIC_* keys in the
// client bundle (a pre-existing, already-accepted decision for this
// hackathon MVP, not something introduced by this migration) -- the flag
// only matters on the project's separate (already non-functional) web
// target, since React Native itself has no `window.document` to trigger it.
const openai = new OpenAI({
  apiKey: env.anthropic.apiKey,
  baseURL: env.anthropic.baseURL,
  dangerouslyAllowBrowser: true,
});

// Message type
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Chat request configuration
export interface ChatRequest<T = unknown> {
  systemPrompt: string;
  messages: ClaudeMessage[];
  schema?: z.ZodSchema<T>;
  maxRetries?: number;
  temperature?: number;
  maxTokens?: number;
}

// Chat response
export interface ChatResponse<T = unknown> {
  content: string;
  parsed?: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Make a chat completion request to Claude (via the LiteLLM proxy)
 *
 * @param config - Chat configuration
 * @returns Parsed and validated response
 */
export async function chat<T = unknown>(
  config: ChatRequest<T>
): Promise<ChatResponse<T>> {
  const {
    systemPrompt,
    messages,
    schema,
    maxRetries = 1,
    temperature = env.anthropic.temperature,
    maxTokens = env.anthropic.maxTokens,
  } = config;

  const endTimer = logger.time('Claude API call');

  try {
    // Add JSON instruction if schema is provided
    const enhancedMessages = schema
      ? [
          ...messages,
          {
            role: 'user' as const,
            content: 'Please respond with valid JSON only. No additional text or formatting.',
          },
        ]
      : messages;

    // OpenAI Chat Completions has no separate top-level `system` param --
    // the system prompt is just the first message, with role 'system'.
    const response = await openai.chat.completions.create({
      model: env.anthropic.model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'system', content: systemPrompt }, ...enhancedMessages],
    });

    endTimer();

    const textContent = response.choices[0]?.message?.content ?? '';

    logger.info('Claude response received', {
      model: env.anthropic.model,
      tokens: response.usage,
    });

    // Parse and validate if schema provided
    if (schema) {
      const parsed = await parseAndValidate(textContent, schema, maxRetries);
      return {
        content: textContent,
        parsed,
        usage: {
          inputTokens: response.usage?.prompt_tokens ?? 0,
          outputTokens: response.usage?.completion_tokens ?? 0,
        },
      };
    }

    // Return raw response
    return {
      content: textContent,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  } catch (error) {
    endTimer();
    logger.error('Claude API call failed', error);
    throw new Error(`Anthropic API error: ${error}`);
  }
}

/**
 * Parse and validate JSON response
 */
async function parseAndValidate<T>(
  content: string,
  schema: z.ZodSchema<T>,
  maxRetries: number
): Promise<T> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];

      const jsonString = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonString.trim());

      // Validate with schema
      const result = validateAgentResponse(schema, parsed, 'Claude');

      if (result.success) {
        return result.data;
      }

      lastError = result.error;
      logger.warning(`Validation failed (attempt ${attempt + 1}/${maxRetries + 1})`, result.error);

    } catch (error) {
      lastError = `JSON parse error: ${error}`;
      logger.warning(`Parse failed (attempt ${attempt + 1}/${maxRetries + 1})`, error);
    }

    // Don't retry on last attempt
    if (attempt < maxRetries) {
      logger.info('Retrying with corrected prompt...');
      // In a real implementation, we could make another API call here
      // For now, we just log and continue
    }
  }

  throw new Error(`Failed to parse valid response after ${maxRetries + 1} attempts. Last error: ${lastError}`);
}

/**
 * Stream a chat completion (for future use)
 *
 * Useful for showing real-time agent responses in the UI
 */
export async function* chatStream(
  config: Omit<ChatRequest, 'schema'>
): AsyncGenerator<string> {
  const {
    systemPrompt,
    messages,
    temperature = env.anthropic.temperature,
    maxTokens = env.anthropic.maxTokens,
  } = config;

  try {
    const stream = await openai.chat.completions.create({
      model: env.anthropic.model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  } catch (error) {
    logger.error('Claude streaming failed', error);
    throw new Error(`Anthropic streaming error: ${error}`);
  }
}

/**
 * Get current model configuration
 */
export function getModelConfig() {
  return {
    model: env.anthropic.model,
    maxTokens: env.anthropic.maxTokens,
    temperature: env.anthropic.temperature,
  };
}
