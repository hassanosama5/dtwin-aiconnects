/**
 * Skill Interface
 *
 * A skill is a reusable, stateless capability an agent loads into its prompt.
 * Skills never call tools, never call other skills, and hold no state between calls.
 */

export interface Skill {
  name: string;
  description: string;
  instructions: string;
  examples?: string[];
  metadata?: Record<string, unknown>;
}
