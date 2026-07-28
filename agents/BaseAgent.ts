/**
 * BaseAgent
 *
 * The shared lifecycle every agent inherits. A concrete agent supplies static
 * configuration (name, prompt, skills, tools, schema, error fallback) via its
 * constructor and implements exactly two behavioral hooks: buildMessages()
 * and, optionally, postProcess(). Everything else — prompt assembly, the
 * shared Claude call, schema validation, timing, logging, and error
 * handling — is inherited and must not be overridden.
 */

import { z } from 'zod';
import { chat, ClaudeMessage, getModelConfig } from '../services/anthropic';
import { logger } from '../utils/logger';
import { AgentContext, AgentResponse } from '../types/agent';
import { Skill } from '../skills/types';
import { Tool } from '../tools/types';

export interface AgentConfig<TSchemaOutput, TResult> {
  name: string;
  description: string;
  responsibility: string;
  /** Defaults to the centrally configured model — agents share one model. */
  model?: string;
  systemPrompt: string;
  skills: Skill[];
  tools: Tool[];
  outputSchema: z.ZodSchema<TSchemaOutput>;
  /** Safe fallback returned in AgentResponse.output when execution fails. */
  errorOutput: TResult;
}

/**
 * TSchemaOutput is what the LLM call itself is validated against.
 * TResult is what execute() ultimately returns — it defaults to TSchemaOutput
 * (the common case: validate, optionally act via tools, return as-is) but can
 * differ for an agent whose postProcess() does more than pass the parsed
 * output through (e.g. an orchestrating agent).
 */
export abstract class BaseAgent<TRequest, TSchemaOutput, TResult = TSchemaOutput> {
  readonly name: string;
  readonly description: string;
  readonly responsibility: string;
  readonly model: string;

  protected readonly systemPrompt: string;
  protected readonly skills: Skill[];
  protected readonly tools: Tool[];
  protected readonly outputSchema: z.ZodSchema<TSchemaOutput>;
  protected readonly logger = logger;

  private readonly errorOutput: TResult;

  constructor(config: AgentConfig<TSchemaOutput, TResult>) {
    this.name = config.name;
    this.description = config.description;
    this.responsibility = config.responsibility;
    this.model = config.model ?? getModelConfig().model;
    this.systemPrompt = config.systemPrompt;
    this.skills = config.skills;
    this.tools = config.tools;
    this.outputSchema = config.outputSchema;
    this.errorOutput = config.errorOutput;
  }

  /**
   * The single lifecycle every agent shares. Do not override.
   */
  async execute(request: TRequest, context?: AgentContext): Promise<AgentResponse<TResult>> {
    const startTime = performance.now();
    this.logger.agent(this.name, 'executing');

    try {
      const systemPrompt = this.buildPrompt(request, context);
      const messages = this.buildMessages(request, context);

      const { parsed } = await chat<TSchemaOutput>({
        systemPrompt,
        messages,
        schema: this.outputSchema,
      });

      const output = await this.postProcess(parsed as TSchemaOutput, request, context);

      return {
        success: true,
        agent: this.name,
        output,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`${this.name} failed`, error);
      return {
        success: false,
        agent: this.name,
        output: this.errorOutput,
        executionTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * systemPrompt + the active skills' instructions, in that order. Inherited
   * — do not override. Which skills are "active" is selectSkills(), below.
   */
  protected buildPrompt(request: TRequest, context?: AgentContext): string {
    const activeSkills = this.selectSkills(request, context);
    const skillInstructions = activeSkills.map((skill) => skill.instructions).join('\n\n');
    return skillInstructions ? `${this.systemPrompt}\n\n${skillInstructions}` : this.systemPrompt;
  }

  /**
   * Which of this agent's declared skills apply to this specific request.
   * Defaults to all declared skills. Override only when an agent owns more
   * than one skill and must pick between them per-request (e.g. the
   * Interview Agent choosing personal vs. project interview instructions).
   */
  protected selectSkills(_request: TRequest, _context?: AgentContext): Skill[] {
    return this.skills;
  }

  /**
   * Turn the request (+ any middleware-injected context) into the message
   * list sent to Claude. The only required override.
   */
  protected abstract buildMessages(request: TRequest, context?: AgentContext): ClaudeMessage[];

  /**
   * Runs after the LLM response is parsed and schema-validated. Default is
   * identity (valid whenever TResult === TSchemaOutput, the common case).
   * Override to use this agent's declared tools (save/validate) or, for an
   * orchestrating agent, to invoke other agents.
   */
  protected async postProcess(
    parsed: TSchemaOutput,
    _request: TRequest,
    _context?: AgentContext
  ): Promise<TResult> {
    return parsed as unknown as TResult;
  }
}
