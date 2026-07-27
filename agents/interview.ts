/**
 * Interview Agent
 *
 * Conducts adaptive interviews to build Personal and Project profiles.
 * Declares ProfileTool, ProjectTool, and ValidationTool as the only tools
 * it owns; picks between the Personal and Project Interview skills per
 * request instead of loading both at once.
 */

import { BaseAgent } from './BaseAgent';
import { ClaudeMessage } from '../services/anthropic';
import { interviewPrompt } from '../prompts/interview';
import { personalInterviewSkill } from '../skills/personalInterview';
import { projectInterviewSkill } from '../skills/projectInterview';
import { Skill } from '../skills/types';
import { ProfileTool } from '../tools/profile';
import { ProjectTool } from '../tools/project';
import { ValidationTool } from '../tools/validateProfileCompleteness';
import { InterviewResponseSchema } from '../utils/validation';
import { InterviewRequest, InterviewResponse } from '../types/agent';
import { PersonProfile, ProjectProfile } from '../types/profile';

export class InterviewAgent extends BaseAgent<InterviewRequest, InterviewResponse> {
  constructor(model?: string) {
    super({
      name: 'Interview',
      description: 'Conducts adaptive interviews to build Personal and Project profiles.',
      responsibility:
        'Ask questions until a profile is complete. Never invent information. Never assume missing information.',
      model,
      systemPrompt: interviewPrompt,
      skills: [personalInterviewSkill, projectInterviewSkill],
      tools: [ProfileTool, ProjectTool, ValidationTool],
      outputSchema: InterviewResponseSchema,
      errorOutput: { complete: false },
    });
  }

  protected selectSkills(request: InterviewRequest): Skill[] {
    return request.type === 'personal' ? [personalInterviewSkill] : [projectInterviewSkill];
  }

  protected buildMessages(request: InterviewRequest): ClaudeMessage[] {
    const transcript: ClaudeMessage[] = request.messages.map((message) => ({
      role: message.role === 'agent' ? 'assistant' : 'user',
      content: message.content,
    }));

    // Nothing exchanged yet — kick the interview off with the first question.
    if (transcript.length === 0) {
      return [{ role: 'user', content: 'Begin the interview.' }];
    }

    return transcript;
  }

  protected async postProcess(
    parsed: InterviewResponse,
    request: InterviewRequest
  ): Promise<InterviewResponse> {
    if (!parsed.complete || !parsed.profile) {
      return parsed;
    }

    const skill = request.type === 'personal' ? personalInterviewSkill : projectInterviewSkill;
    const requiredFields = (skill.metadata?.requiredFields as string[] | undefined) ?? [];
    const completeness = ValidationTool.checkCompleteness(
      requiredFields,
      parsed.profile as unknown as Record<string, unknown>
    );

    if (!completeness.complete) {
      this.logger.warning(
        'Interview Agent claimed completion but ValidationTool disagreed',
        completeness
      );
      return { complete: false, missingFields: completeness.missingFields };
    }

    if (request.type === 'personal') {
      const profile = parsed.profile as PersonProfile;
      const saveResult = await ProfileTool.save(profile.name, profile.role, profile);
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }
    } else {
      if (!request.twinId) {
        throw new Error('Cannot save a project profile without a twinId');
      }
      const profile = parsed.profile as ProjectProfile;
      const saveResult = await ProjectTool.save(request.twinId, profile.name, profile);
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }
    }

    return parsed;
  }
}
