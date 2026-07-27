/**
 * Decision Agent
 *
 * Answers questions as the represented person's Decision Twin. Pure
 * reasoning agent: declares no tools, because all of its context (Personal
 * Profile, Project Profile, Conversation History) arrives pre-assembled via
 * AgentContext from Middleware — it never fetches anything itself.
 */

import { BaseAgent } from './BaseAgent';
import { ClaudeMessage } from '../services/anthropic';
import { decisionPrompt } from '../prompts/decision';
import { decisionReasoningSkill } from '../skills/decisionReasoning';
import { DecisionResponseSchema } from '../utils/validation';
import { AgentContext, DecisionRequest, DecisionResponse } from '../types/agent';

export class DecisionAgent extends BaseAgent<DecisionRequest, DecisionResponse> {
  constructor() {
    super({
      name: 'Decision',
      description: "Answers questions as the represented person's Decision Twin.",
      responsibility:
        'Reason only from the Personal Profile, Project Profile, and Conversation History provided in context. Never invent missing preferences.',
      systemPrompt: decisionPrompt,
      skills: [decisionReasoningSkill],
      tools: [],
      outputSchema: DecisionResponseSchema,
      errorOutput: { answer: '', reasoning: [], confidence: 0 },
    });
  }

  protected buildMessages(request: DecisionRequest, context?: AgentContext): ClaudeMessage[] {
    // Layering matches PROJECT_SPEC.md §6 "Shared Context": Personal Profile
    // → Project Profile → Conversation History → Current Question.
    const sections: string[] = [];

    if (context?.personProfile) {
      sections.push(`Personal Profile:\n${JSON.stringify(context.personProfile, null, 2)}`);
    }
    if (context?.projectProfile) {
      sections.push(`Project Profile:\n${JSON.stringify(context.projectProfile, null, 2)}`);
    }
    if (context?.conversationHistory?.length) {
      const history = context.conversationHistory
        .map((message) => `${message.role}: ${message.content}`)
        .join('\n');
      sections.push(`Conversation History:\n${history}`);
    }

    sections.push(`Question: ${request.question}`);

    return [{ role: 'user', content: sections.join('\n\n') }];
  }
}
