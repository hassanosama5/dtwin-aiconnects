/**
 * Create Twin Screen
 *
 * Personal interview flow — scripted mock conversation only.
 * Wiring to the real Interview Agent / useInterview() happens in Phase 3.
 *
 * Sprint 7.1: on Done, registers a complete mock profile (decision style,
 * values, communication style, and a starter project) into the shared
 * in-memory mockDirectory, shows a success confirmation, then returns to
 * Home via router.back() — Home re-reads the directory on focus, so no
 * navigation params are needed and there's no risk of a duplicate Home
 * screen or stale params.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { InterviewChat, InterviewQuestion } from '../../components/shared/InterviewChat';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';
import { createTwin } from '../../utils/mockDirectory';

// Placeholder script — replace with the real Interview Agent conversation in Phase 3.
const QUESTIONS: InterviewQuestion[] = [
  { text: "Hi! I'm going to learn how you make decisions. Let's start — what's your name?" },
  {
    text: 'What is your role?',
    suggestions: ['Software Engineer', 'Product Manager', 'Founder', 'Marketing Lead', 'CTO'],
  },
  {
    text: 'How do you usually make decisions?',
    suggestions: ['Data-driven', 'Gut instinct', 'Team consensus', 'Weigh pros and cons'],
  },
  {
    text: 'What values guide your decisions most?',
    suggestions: ['Customer First', 'Long-term Thinking', 'Simplicity', 'Speed', 'Quality'],
  },
  {
    text: 'How would you describe your communication style?',
    suggestions: ['Direct', 'Diplomatic', 'Detailed', 'Concise'],
  },
  {
    text: 'How do you usually handle disagreements with your team?',
    suggestions: ['Discuss openly', 'Seek compromise', 'Defer to data', 'Make the final call'],
  },
];

const LOADING_LINES = ['Analyzing your responses...', 'Building your Decision Profile...'];

// Used only if the user leaves the name/role answers blank.
const FALLBACK_NAME = 'Hassan Osama';
const FALLBACK_ROLE = 'Project Manager';
const GENERATED_DECISION_STYLE = 'Analytical';
const GENERATED_VALUES = ['Customer First', 'Long-term Thinking'];
const GENERATED_COMMUNICATION_STYLE = ['Direct', 'Concise'];

// answers[0] is the name question, answers[1] is the role question — see QUESTIONS above.
function deriveIdentity(answers: string[]) {
  const name = answers[0]?.trim() || FALLBACK_NAME;
  const role = answers[1]?.trim() || FALLBACK_ROLE;
  return { name, role };
}

export default function CreateTwinScreen() {
  const router = useRouter();

  function handleComplete(answers: string[]) {
    const { name, role } = deriveIdentity(answers);
    const ts = Date.now();
    const twinId = `new-twin-${ts}`;
    const projectId = `my-first-project-${ts}`;

    createTwin(
      {
        id: twinId,
        name,
        role,
        decisionStyle: GENERATED_DECISION_STYLE,
        values: GENERATED_VALUES,
        communicationStyle: GENERATED_COMMUNICATION_STYLE,
        projects: [{ id: projectId, name: 'My First Project', subtitle: 'Getting Started' }],
      },
      {
        id: projectId,
        name: 'My First Project',
        twinName: name,
        goal: 'Get the first version of this project off the ground.',
        priorities: ['Clarity', 'Momentum'],
        constraints: ['Scope is still being defined'],
        decisionRules: ['Default to the simplest option that ships.'],
        escalationRules: ['Anything outside the agreed scope is escalated.'],
      }
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <InterviewChat
        questions={QUESTIONS}
        loadingTitle="Generating Decision Twin..."
        loadingLines={LOADING_LINES}
        successMessage="Decision Twin Created"
        onComplete={handleComplete}
        onDone={() => router.back()}
        summary={(answers) => {
          const { name, role } = deriveIdentity(answers);
          return (
            <>
              <View className="mb-6">
                <Text className="text-3xl font-bold text-gray-900 mb-1">{name}</Text>
                <Text className="text-base text-gray-600">{role}</Text>
              </View>

              <ProfileSectionCard title="Decision Style">
                <Text className="text-sm text-gray-600 leading-5">{GENERATED_DECISION_STYLE}</Text>
              </ProfileSectionCard>

              <ProfileSectionCard title="Core Values">
                <BulletList items={GENERATED_VALUES} />
              </ProfileSectionCard>

              <ProfileSectionCard title="Communication Style" className="mb-0">
                <BulletList items={GENERATED_COMMUNICATION_STYLE} />
              </ProfileSectionCard>
            </>
          );
        }}
      />
    </SafeAreaView>
  );
}
