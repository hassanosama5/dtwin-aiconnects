/**
 * Interview Agent
 *
 * Conducts a deterministic, one-field-at-a-time interview. Field selection
 * and completion are entirely code-driven -- the LLM's only job each turn
 * is to (1) extract whatever the user's latest answer provides for
 * currently-missing fields, and (2) propose the next question + quick-reply
 * suggestions for the field code picks next. The LLM is never asked to
 * decide completion or reproduce a whole profile in one shot -- that was
 * the previous design and it was unreliable (see DECISIONS.md).
 */

import { BaseAgent } from './BaseAgent';
import { ClaudeMessage } from '../services/anthropic';
import { interviewPrompt } from '../prompts/interview';
import { personalInterviewSkill } from '../skills/personalInterview';
import { projectInterviewSkill } from '../skills/projectInterview';
import { Skill, SkillField } from '../skills/types';
import { ProfileTool } from '../tools/profile';
import { ProjectTool } from '../tools/project';
import { ValidationTool } from '../tools/validateProfileCompleteness';
import { InterviewTurnSchema } from '../utils/validation';
import { InterviewRequest, InterviewResponse } from '../types/agent';
import { PersonProfile, ProjectProfile } from '../types/profile';

interface InterviewTurnOutput {
  // Deliberately unvalidated shape -- see InterviewTurnSchema's comment.
  extracted: Record<string, unknown>;
  nextQuestion?: string | null;
  suggestions?: string[];
}

function isFilled(value: unknown): value is string | string[] {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Robustly coerces an arbitrary extracted value -- the LLM's raw JSON can
 *  be a string, number, boolean, a mixed array, or null -- into a clean
 *  string or string[], or undefined if it's empty or can't be sensibly
 *  coerced (e.g. a nested object). This is where "whatever the LLM
 *  returned" becomes "a value we trust to store," rather than relying on
 *  Zod to reject anything unexpected -- see InterviewTurnSchema's comment. */
function coerce(value: unknown): string | string[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => coerce(item))
      .filter((item): item is string => typeof item === 'string');
    return items.length > 0 ? items : undefined;
  }
  return undefined;
}

/** Coerces an already-known value to the shape its field expects,
 *  defensively -- the LLM occasionally returns a string for an array field
 *  or vice versa. */
function normalize(field: SkillField, value: string | string[]): string | string[] {
  if (field.isArray && typeof value === 'string') return [value];
  if (!field.isArray && Array.isArray(value)) return value.join(', ');
  return value;
}

function fieldsForType(type: 'personal' | 'project'): SkillField[] {
  const skill = type === 'personal' ? personalInterviewSkill : projectInterviewSkill;
  return skill.fields ?? [];
}

/** First missing field, paired with the next one if it's marked pairWithNext
 *  and that next field is also still missing. Purely a function of current
 *  `collected` state -- no turn-history bookkeeping needed, so it can't
 *  drift out of sync across calls. */
function nextFieldGroup(
  fields: SkillField[],
  collected: Record<string, string | string[]>
): SkillField[] | undefined {
  const missing = fields.filter((f) => !isFilled(collected[f.key]));
  const first = missing[0];
  if (!first) return undefined;
  if (first.pairWithNext) {
    const pairIndex = fields.indexOf(first) + 1;
    const pair = fields[pairIndex];
    if (pair && missing.includes(pair)) return [first, pair];
  }
  return [first];
}

export class InterviewAgent extends BaseAgent<
  InterviewRequest,
  InterviewTurnOutput,
  InterviewResponse
> {
  constructor(model?: string) {
    super({
      name: 'Interview',
      description: 'Conducts a short, structured interview to build Personal and Project profiles.',
      responsibility:
        'Extract field values from the latest answer and propose the next question. Field selection and completion are code-driven, never decided by this agent.',
      model,
      systemPrompt: interviewPrompt,
      skills: [personalInterviewSkill, projectInterviewSkill],
      tools: [ProfileTool, ProjectTool, ValidationTool],
      outputSchema: InterviewTurnSchema,
      errorOutput: { complete: false },
    });
  }

  protected selectSkills(request: InterviewRequest): Skill[] {
    return request.type === 'personal' ? [personalInterviewSkill] : [projectInterviewSkill];
  }

  protected buildMessages(request: InterviewRequest): ClaudeMessage[] {
    const fields = fieldsForType(request.type);
    const collected = request.collectedFields ?? {};
    const askedCount = request.messages.filter((m) => m.role === 'agent').length;

    const transcript: ClaudeMessage[] = request.messages.map((message) => ({
      role: message.role === 'agent' ? 'assistant' : 'user',
      content: message.content,
    }));

    const missing = fields.filter((f) => !isFilled(collected[f.key]));
    const nextGroup = nextFieldGroup(fields, collected);

    const instructionLines: string[] = [];

    if (askedCount > 0) {
      instructionLines.push(
        `Extract values from the user's latest answer for any of these still-missing fields: ${missing
          .map((f) => `"${f.key}" (${f.topic})`)
          .join(', ')}.`
      );
    }

    instructionLines.push(`Already collected: ${JSON.stringify(collected)}`);

    if (nextGroup) {
      instructionLines.push(
        `Now ask ONE natural question covering: ${nextGroup
          .map((f) => f.topic)
          .join(' and ')}. Set "nextQuestion" to it and include 3-5 short "suggestions".`
      );
    } else {
      instructionLines.push('Every field has been collected. Set "nextQuestion" to null and "suggestions" to [].');
    }

    transcript.push({ role: 'user', content: instructionLines.join('\n\n') });
    return transcript;
  }

  protected async postProcess(
    parsed: InterviewTurnOutput,
    request: InterviewRequest
  ): Promise<InterviewResponse> {
    const fields = fieldsForType(request.type);
    const fieldsByKey = new Map(fields.map((f) => [f.key, f]));

    const collected: Record<string, string | string[]> = { ...(request.collectedFields ?? {}) };
    for (const [key, rawValue] of Object.entries(parsed.extracted ?? {})) {
      // Drop invented keys that don't map to a real field -- the LLM
      // sometimes captures adjacent context under a name it made up.
      if (!fieldsByKey.has(key)) continue;
      const value = coerce(rawValue);
      if (value === undefined) continue;
      collected[key] = value;
    }

    // Normalize EVERY known field's value, not just ones extracted this
    // turn -- guarantees correct shape (string vs string[]) regardless of
    // which turn a value originated in. Without this, a value normalized
    // on turn N but carried forward via collectedFields on turn N+1 would
    // never get re-normalized, since only new extractions were normalized
    // before -- exactly what produced bare strings for array fields.
    for (const field of fields) {
      if (collected[field.key] !== undefined) {
        collected[field.key] = normalize(field, collected[field.key]);
      }
    }

    const requiredKeys = fields.filter((f) => f.required).map((f) => f.key);
    const completeness = ValidationTool.checkCompleteness(requiredKeys, collected);

    // Bounds retries so a field that's never successfully extracted can't
    // loop the interview forever: one full pass through every field, plus
    // one retry per required field.
    const askedCount = request.messages.filter((m) => m.role === 'agent').length;
    const maxTurns = fields.length + requiredKeys.length;
    const forceComplete = askedCount >= maxTurns;

    const isComplete = completeness.complete || forceComplete;

    if (!isComplete) {
      return {
        complete: false,
        nextQuestion: parsed.nextQuestion ?? undefined,
        suggestions: parsed.suggestions,
        // The full normalized, accumulated state -- not just this turn's
        // delta. The caller should replace its stored collectedFields with
        // this directly, not merge it, so nothing carries forward
        // un-normalized. See the normalize loop above.
        collectedFields: collected,
        progress: {
          collected: fields.length - completeness.missingFields.length,
          total: fields.length,
        },
      };
    }

    for (const key of completeness.missingFields) {
      const field = fieldsByKey.get(key);
      collected[key] = field?.isArray ? ['Not specified'] : 'Not specified';
    }

    if (request.type === 'personal') {
      const profile = collected as unknown as PersonProfile;
      const saveResult = await ProfileTool.save(profile.name, profile.role, profile);
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }
      return {
        complete: true,
        profile,
        twinId: saveResult.twin.id,
        progress: { collected: fields.length, total: fields.length },
      };
    }

    // Note: the UI no longer drives project creation through this agent --
    // Projects are an independent workspace filled in via a plain form (see
    // app/project/create.tsx and tools/project.ts's doc comment) rather
    // than a Twin-style interview. This branch is kept working and
    // internally consistent with the current ProjectProfile shape, not
    // deleted, per "don't change agent architecture" -- it's simply unused
    // by the app today.
    const profile = collected as unknown as ProjectProfile;
    const saveResult = await ProjectTool.save(profile, request.twinId);
    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }
    return {
      complete: true,
      profile,
      twinId: request.twinId,
      progress: { collected: fields.length, total: fields.length },
    };
  }
}
