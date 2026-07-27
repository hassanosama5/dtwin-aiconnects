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
});

// Coordinator Response Schema
export const CoordinatorResponseSchema = z.object({
  workflow: z.enum(['CREATE_TWIN', 'CREATE_PROJECT', 'CHAT', 'UPDATE_PROFILE']),
});

// Interview Response Schema
export const InterviewResponseSchema = z.object({
  complete: z.boolean(),
  nextQuestion: z.string().optional(),
  profile: z.union([PersonProfileSchema, ProjectProfileSchema]).optional(),
  missingFields: z.array(z.string()).optional(),
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
