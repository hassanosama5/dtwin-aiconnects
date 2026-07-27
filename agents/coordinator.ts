/**
 * Coordinator Agent
 *
 * The single orchestration layer. Its own LLM call only classifies intent
 * (unchanged prompt/schema: `{ workflow }`) — postProcess() is where it
 * actually invokes the other agents and decides whether Review runs. There
 * is no separate workflow-runner; this is the one place orchestration lives.
 *
 * Note: PROJECT_SPEC.md originally listed the Coordinator's tools as "None."
 * That held when the Coordinator only classified intent. Now that it also
 * orchestrates the CHAT pipeline end-to-end, it owns ConversationTool to
 * record the user's question and the final approved answer (or escalation
 * notice) — a deliberate, disclosed deviation from the original spec line,
 * not an oversight. See DECISIONS.md.
 */

import { BaseAgent } from './BaseAgent';
import { InterviewAgent } from './interview';
import { DecisionAgent } from './decision';
import { ReviewAgent } from './review';
import { ClaudeMessage } from '../services/anthropic';
import { coordinatorPrompt } from '../prompts/coordinator';
import { ConversationTool } from '../tools/conversation';
import { loadDecisionContext } from '../middleware/loadDecisionContext';
import { CoordinatorResponseSchema } from '../utils/validation';
import { CoordinatorRequest, CoordinatorResponse, CoordinatorResult } from '../types/agent';

export class CoordinatorAgent extends BaseAgent<
  CoordinatorRequest,
  CoordinatorResponse,
  CoordinatorResult
> {
  constructor(
    private readonly interviewAgent: InterviewAgent,
    private readonly decisionAgent: DecisionAgent,
    private readonly reviewAgent: ReviewAgent,
    model?: string
  ) {
    super({
      name: 'Coordinator',
      description: "Classifies user intent and orchestrates the agent(s) needed to fulfill it.",
      responsibility:
        'Identify the workflow, invoke Interview or (Decision then Review), and decide whether Review runs. Never answer questions or generate content directly.',
      model,
      systemPrompt: coordinatorPrompt,
      skills: [],
      tools: [ConversationTool],
      outputSchema: CoordinatorResponseSchema,
      errorOutput: {
        workflow: 'CHAT',
        decision: { answer: '', reasoning: [], confidence: 0 },
        review: { approved: false, confidence: 0, requiresHuman: true, reason: 'Coordinator failed' },
      },
    });
  }

  protected buildMessages(request: CoordinatorRequest): ClaudeMessage[] {
    // Bug fix: classifying only the latest message loses all context past
    // turn 1 — a free-text interview answer like "I value security and
    // honesty" has no signal telling the classifier "we're already
    // mid-interview." When a transcript exists, classify against the whole
    // thing so the model can see it's a continuation, not a fresh request.
    if (request.messages && request.messages.length > 0) {
      return request.messages.map((message) => ({
        role: message.role === 'agent' ? 'assistant' : 'user',
        content: message.content,
      }));
    }
    return [{ role: 'user', content: request.message }];
  }

  protected async postProcess(
    parsed: CoordinatorResponse,
    request: CoordinatorRequest
  ): Promise<CoordinatorResult> {
    // request.activeWorkflow (when present) wins over the LLM's own
    // classification -- see the field's doc comment in types/agent.ts.
    const workflow = request.activeWorkflow ?? parsed.workflow;

    if (workflow === 'CHAT') {
      return this.runChat(request);
    }

    // CREATE_TWIN, CREATE_PROJECT, and UPDATE_PROFILE all route to the
    // Interview Agent. UPDATE_PROFILE's exact routing is a rough MVP
    // stand-in — full re-interview support is postponed per ROADMAP.md.
    const type: 'personal' | 'project' =
      workflow === 'CREATE_PROJECT' || (workflow === 'UPDATE_PROFILE' && !!request.context?.projectId)
        ? 'project'
        : 'personal';

    const interviewResult = await this.interviewAgent.execute({
      type,
      messages: request.messages ?? [],
      twinId: request.context?.twinId,
    });

    return { workflow, interview: interviewResult.output };
  }

  private async runChat(request: CoordinatorRequest): Promise<CoordinatorResult> {
    const { twinId, projectId } = request.context ?? {};
    if (!twinId || !projectId) {
      throw new Error('CHAT workflow requires both twinId and projectId in context');
    }

    const savedQuestion = await ConversationTool.save(projectId, 'user', request.message);
    if (!savedQuestion.success) {
      this.logger.warning('Failed to save incoming question to conversation history', savedQuestion.error);
    }

    const context = await loadDecisionContext(twinId, projectId);

    const decisionResult = await this.decisionAgent.execute(
      { question: request.message, twinId, projectId },
      context
    );
    const reviewResult = await this.reviewAgent.execute(
      { decision: decisionResult.output },
      context
    );

    if (reviewResult.output.approved) {
      const saved = await ConversationTool.save(projectId, 'assistant', decisionResult.output.answer, {
        reasoning: decisionResult.output.reasoning,
        confidence: decisionResult.output.confidence,
      });
      if (!saved.success) {
        this.logger.warning('Failed to save approved answer to conversation history', saved.error);
      }
    } else {
      const notice =
        reviewResult.output.reason ?? 'This decision requires approval from the represented person.';
      const saved = await ConversationTool.save(projectId, 'assistant', notice, {
        confidence: reviewResult.output.confidence,
        requiresHuman: true,
      });
      if (!saved.success) {
        this.logger.warning('Failed to save escalation notice to conversation history', saved.error);
      }
    }

    return { workflow: 'CHAT', decision: decisionResult.output, review: reviewResult.output };
  }
}
