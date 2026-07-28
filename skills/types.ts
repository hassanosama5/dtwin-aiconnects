/**
 * Skill Interface
 *
 * A skill is a reusable, stateless capability an agent loads into its prompt.
 * Skills never call tools, never call other skills, and hold no state between calls.
 */

/**
 * One field in a skill's ordered interview plan. Field selection ("what to
 * ask next") is code-driven, not left to the LLM — see agents/interview.ts.
 */
export interface SkillField {
  /** Must match a key on the corresponding profile type. */
  key: string;
  /** Human-readable hint the LLM uses to phrase a natural question. */
  topic: string;
  /** Required fields gate completion; optional fields are asked but never block it. */
  required: boolean;
  /** Whether the profile field is a string[] (affects extraction guidance). */
  isArray: boolean;
  /** If true, ask about this field together with the next one in one question. */
  pairWithNext?: boolean;
}

export interface Skill {
  name: string;
  description: string;
  instructions: string;
  examples?: string[];
  metadata?: Record<string, unknown>;
  /** Ordered field plan driving deterministic interviewing, when applicable. */
  fields?: SkillField[];
}
