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

const openai = env.llm.apiKey || env.litellm.apiKey
  ? new OpenAI({
      apiKey: env.llm.apiKey || env.litellm.apiKey,
      baseURL: env.llm.baseURL || env.litellm.baseUrl,
    })
  : null;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest<T = unknown> {
  systemPrompt: string;
  messages: ClaudeMessage[];
  schema?: z.ZodSchema<T>;
  maxRetries?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse<T = unknown> {
  content: string;
  parsed?: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function chat<T = unknown>(config: ChatRequest<T>): Promise<ChatResponse<T>> {
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
    if (!openai) {
      throw new Error('No LLM provider is configured. Set EXPO_PUBLIC_LITELLM_API_KEY to enable live responses.');
    }

    const enhancedMessages = schema
      ? [
          ...messages,
          {
            role: 'user' as const,
            content: 'Please respond with valid JSON only. No additional text or formatting.',
          },
        ]
      : messages;

    const response = await openai.chat.completions.create({
      model: env.llm.model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'system', content: systemPrompt }, ...enhancedMessages],
    });

    endTimer();

    const textContent = extractContent(response.choices[0]?.message?.content);

    logger.info('LLM response received', {
      model: env.llm.model,
      tokens: response.usage,
    });

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

function extractContent(content: string | Array<{ type?: string; text?: string }> | null | undefined): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((part) => part.text ?? '').join('');
  }

  return '';
}

async function parseAndValidate<T>(
  content: string,
  schema: z.ZodSchema<T>,
  maxRetries: number
): Promise<T> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, content];

      const jsonString = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonString.trim());
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

    if (attempt < maxRetries) {
      logger.info('Retrying with corrected prompt...');
    }
  }

  throw new Error(`Failed to parse valid response after ${maxRetries + 1} attempts. Last error: ${lastError}`);
}

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
    if (!openai) {
      throw new Error('No LLM provider is configured. Set EXPO_PUBLIC_LITELLM_API_KEY to enable streaming.');
    }

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

export function getModelConfig() {
  return {
    model: env.llm.model,
    maxTokens: env.llm.maxTokens,
    temperature: env.llm.temperature,
  };
}
