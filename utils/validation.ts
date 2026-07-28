/**
 * Validation Schemas
 *
 * Zod schemas for validating agent responses and data structures
 */

import { z } from 'zod';

// Person Profile Schema
export const PersonProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  leadershipStyle: z.string().min(1, 'Leadership style is required'),
  communicationStyle: z.string().min(1, 'Communication style is required'),
  decisionStyle: z.string().min(1, 'Decision style is required'),
  values: z.array(z.string()).min(1, 'At least one value is required'),
  delegationRules: z.array(z.string()).min(1, 'At least one delegation rule is required'),
  approvalRules: z.array(z.string()).min(1, 'At least one approval rule is required'),
  conflictResolution: z.string().optional(),
  generalPrinciples: z.array(z.string()).optional(),
});

// Project Profile Schema
export const ProjectProfileSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  goal: z.string().min(1, 'Project goal is required'),
  timeline: z.string().optional(),
  priorities: z.array(z.string()).min(1, 'At least one priority is required'),
  constraints: z.array(z.string()).min(1, 'At least one constraint is required'),
  decisionRules: z.array(z.string()).min(1, 'At least one decision rule is required'),
  escalationRules: z.array(z.string()).min(1, 'At least one escalation rule is required'),
  tradeoffs: z.array(z.string()).optional(),
  currentChallenges: z.array(z.string()).optional(),
  stakeholders: z.array(z.string()).optional(),
  successMetrics: z.array(z.string()).optional(),
});

// Coordinator Response Schema
export const CoordinatorResponseSchema = z.object({
  workflow: z.enum(['CREATE_TWIN', 'CREATE_PROJECT', 'CHAT', 'UPDATE_PROFILE']),
});

// Interview Turn Schema
//
// Validates the LLM's RAW per-turn output inside InterviewAgent -- not the
// final InterviewResponse returned to callers. Deliberately permissive
// (an empty `extracted` object is valid) because each turn only asks the
// model to extract whatever the latest answer provided and propose the next
// question; it never asks the model to reproduce a whole, complete profile
// in one shot. Completion is determined by code from accumulated,
// individually-validated fields -- see agents/interview.ts and DECISIONS.md.
//
// `extracted`'s values are deliberately unvalidated (z.any()): observed
// live, the model sometimes invents extra keys for adjacent context it
// noticed (e.g. "teamSize") with arbitrary JSON types (a number, here).
// Those invented keys get discarded in agents/interview.ts anyway (only
// known field keys are kept), so validating their shape here just fails
// the whole turn over data we were never going to use. Coercing whatever
// comes through into string/string[] is code's job, not Zod's -- see
// agents/interview.ts's `coerce()`.
export const InterviewTurnSchema = z.object({
  extracted: z.record(z.any()),
  nextQuestion: z.string().nullable().optional(),
  suggestions: z.array(z.string()).optional(),
});

// Decision Response Schema
export const DecisionResponseSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
  reasoning: z.array(z.string()).min(1, 'At least one reasoning point is required'),
  confidence: z.number().min(0).max(100),
});

// Review Response Schema
export const ReviewResponseSchema = z.object({
  approved: z.boolean(),
  confidence: z.number().min(0).max(100),
  requiresHuman: z.boolean(),
  reason: z.string().optional(),
});

// Message Metadata Schema
export const MessageMetadataSchema = z.object({
  reasoning: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(100).optional(),
  requiresHuman: z.boolean().optional(),
  agentExecutionTime: z.number().optional(),
});

// Helper function to validate and parse JSON responses
export function validateAgentResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  agentName: string
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        success: false,
        error: `${agentName} returned invalid response: ${errorMessage}`,
      };
    }
    return {
      success: false,
      error: `${agentName} validation failed: ${error}`,
    };
  }
}
