/**
 * Agent Registry
 *
 * Constructs and wires the four agent instances. This is the ONLY place
 * agents are instantiated — callers never `new` an agent directly, they go
 * through `createAgentRegistry()`. The registry performs no orchestration
 * itself; that stays inside CoordinatorAgent.
 */

import { CoordinatorAgent } from './coordinator';
import { InterviewAgent } from './interview';
import { DecisionAgent } from './decision';
import { ReviewAgent } from './review';

export interface AgentRegistry {
  coordinator: CoordinatorAgent;
  interview: InterviewAgent;
  decision: DecisionAgent;
  review: ReviewAgent;
}

/**
 * @param model Optional override applied to every agent — the one shared
 * Claude model referenced throughout ARCHITECTURE.md. Defaults to the
 * centrally configured model (services/anthropic.ts) when omitted.
 */
export function createAgentRegistry(model?: string): AgentRegistry {
  const interview = new InterviewAgent(model);
  const decision = new DecisionAgent(model);
  const review = new ReviewAgent(model);
  const coordinator = new CoordinatorAgent(interview, decision, review, model);

  return { coordinator, interview, decision, review };
}
