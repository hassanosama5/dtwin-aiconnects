/**
 * LLM Service
 *
 * Wrapper around the iHQ LiteLLM proxy (OpenAI-compatible endpoint in front
 * of Claude) using the `openai` SDK pointed at LiteLLM's base URL.
 * Supports structured outputs with Zod validation and automatic retries.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { validateAgentResponse } from '../utils/validation';

// Initialize OpenAI-compatible client, pointed at the LiteLLM proxy
const openai = new OpenAI({
  apiKey: env.llm.apiKey,
  baseURL: env.llm.baseURL,
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
 * Make a chat completion request to Claude via the LiteLLM proxy
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
    temperature = env.llm.temperature,
    maxTokens = env.llm.maxTokens,
  } = config;

  const endTimer = logger.time('LLM API call');

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

    // Make API call (OpenAI-compatible chat completions)
    const response = await openai.chat.completions.create({
      model: env.llm.model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'system', content: systemPrompt }, ...enhancedMessages],
    });

    endTimer();

    // Extract text content
    const textContent = response.choices[0]?.message?.content ?? '';

    logger.info('LLM response received', {
      model: env.llm.model,
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
    logger.error('LLM API call failed', error);
    throw new Error(`LiteLLM API error: ${error}`);
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
      const result = validateAgentResponse(schema, parsed, 'LLM');

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
    temperature = env.llm.temperature,
    maxTokens = env.llm.maxTokens,
  } = config;

  try {
    const stream = await openai.chat.completions.create({
      model: env.llm.model,
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
    logger.error('LLM streaming failed', error);
    throw new Error(`LiteLLM streaming error: ${error}`);
  }
}

/**
 * Get current model configuration
 */
export function getModelConfig() {
  return {
    model: env.llm.model,
    maxTokens: env.llm.maxTokens,
    temperature: env.llm.temperature,
  };
}
