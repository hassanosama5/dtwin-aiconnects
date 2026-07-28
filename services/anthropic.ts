/**
 * LLM Service
 *
 * Uses the LiteLLM OpenAI-compatible endpoint by default, with Anthropic SDK
 * as a fallback for backwards compatibility.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { validateAgentResponse } from '../utils/validation';

const anthropic = env.anthropic.apiKey
  ? new Anthropic({
      apiKey: env.anthropic.apiKey,
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

  const endTimer = logger.time('LLM API call');

  try {
    const enhancedMessages = schema
      ? [
          ...messages,
          {
            role: 'user' as const,
            content: 'Please respond with valid JSON only. No additional text or formatting.',
          },
        ]
      : messages;

    if (env.litellm.apiKey) {
      const response = await callLiteLlm({
        systemPrompt,
        messages: enhancedMessages,
        temperature,
        maxTokens,
      });

      endTimer();

      if (schema) {
        const parsed = await parseAndValidate(response.content, schema, maxRetries);
        return {
          content: response.content,
          parsed,
          usage: response.usage,
        };
      }

      return response as ChatResponse<T>;
    }

    if (!anthropic) {
      throw new Error('No LLM provider is configured. Set EXPO_PUBLIC_LITELLM_API_KEY or EXPO_PUBLIC_ANTHROPIC_API_KEY to enable live responses.');
    }

    const response = await anthropic.messages.create({
      model: env.anthropic.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: enhancedMessages,
    });

    endTimer();

    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('');

    logger.info('Claude response received', {
      model: env.anthropic.model,
      tokens: response.usage,
    });

    if (schema) {
      const parsed = await parseAndValidate(textContent, schema, maxRetries);
      return {
        content: textContent,
        parsed,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    }

    return {
      content: textContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    endTimer();
    logger.error('LLM API call failed', error);
    throw new Error(`LLM API error: ${error}`);
  }
}

async function callLiteLlm(config: {
  systemPrompt: string;
  messages: ClaudeMessage[];
  temperature: number;
  maxTokens: number;
}): Promise<ChatResponse> {
  const { systemPrompt, messages, temperature, maxTokens } = config;
  const payload = {
    model: env.litellm.model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((message) => ({ role: message.role, content: message.content })),
    ],
  };

  const response = await fetch(`${env.litellm.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.litellm.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LiteLLM API error: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
    };
  };

  const content = extractContent(data.choices?.[0]?.message?.content);

  return {
    content,
    usage: {
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    },
  };
}

function extractContent(content: string | Array<{ type?: string; text?: string }> | undefined): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text ?? '')
      .join('');
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
    temperature = env.anthropic.temperature,
    maxTokens = env.anthropic.maxTokens,
  } = config;

  try {
    if (env.litellm.apiKey) {
      const response = await fetch(`${env.litellm.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.litellm.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.litellm.model,
          temperature,
          max_tokens: maxTokens,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((message) => ({ role: message.role, content: message.content })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`LiteLLM streaming error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response was not available.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') {
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            const payload = trimmed.slice(6);
            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (typeof delta === 'string') {
                yield delta;
              }
            } catch {
              // Ignore incomplete stream chunks.
            }
          }
        }
      }

      return;
    }

    if (!anthropic) {
      throw new Error('No LLM provider is configured. Set EXPO_PUBLIC_LITELLM_API_KEY or EXPO_PUBLIC_ANTHROPIC_API_KEY to enable streaming.');
    }

    const stream = await anthropic.messages.create({
      model: env.anthropic.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  } catch (error) {
    logger.error('LLM streaming failed', error);
    throw new Error(`LLM streaming error: ${error}`);
  }
}

export function getModelConfig() {
  return {
    model: env.litellm.apiKey ? env.litellm.model : env.anthropic.model,
    maxTokens: env.anthropic.maxTokens,
    temperature: env.anthropic.temperature,
  };
}
