/**
 * Update Twin Screen
 *
 * "Improve this Decision Twin" interview, launched from Twin Profile's
 * "Start Interview" button. Reuses InterviewChat, but instead of
 * generating a brand-new profile, merges the answers into the twin's
 * EXISTING profile (see utils/profileMerge.ts) and shows a "Changes
 * Detected" comparison — Apply Changes / Back — before touching anything.
 *
 * Sprint 7.2. Frontend/mock only — no AI, no backend. Wiring to the real
 * Interview Agent happens via hooks/useInterview() in Phase 3.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { InterviewChat, InterviewQuestion } from '../../../components/shared/InterviewChat';
import { ProfileSectionCard } from '../../../components/cards/ProfileSectionCard';
import { getTwin, updateTwin, MockTwinProfile } from '../../../utils/mockDirectory';
import {
  mergeRole,
  mergeDecisionStyle,
  mergeList,
  mergeCommunicationStyle,
  changeToHistoryLabel,
  ProfileChange,
} from '../../../utils/profileMerge';

const QUESTIONS: InterviewQuestion[] = [
  {
    text: "Let's update your Decision Twin. Has your role changed recently?",
    suggestions: ['Senior Software Engineer', 'Team Lead', 'No change'],
  },
  {
    text: 'How would you describe your decision-making style these days?',
    suggestions: ['Data driven', 'Fast', 'More collaborative', 'No change'],
  },
  {
    text: 'Any new values guiding your decisions lately?',
    suggestions: ['Innovation', 'Ownership', 'Transparency', 'No change'],
  },
  {
    text: 'Any additional communication preferences to add?',
    suggestions: ['Detailed explanations', 'More async', 'No change'],
  },
];

const LOADING_LINES = ['Reviewing your answers...', 'Updating your Decision Profile...'];

function computeMerge(twin: MockTwinProfile, answers: string[]): { merged: MockTwinProfile; changes: ProfileChange[] } {
  const changes: ProfileChange[] = [];

  const roleResult = mergeRole(twin.role, answers[0]);
  if (roleResult.change) changes.push(roleResult.change);

  const decisionStyleResult = mergeDecisionStyle(twin.decisionStyle, answers[1]);
  if (decisionStyleResult.change) changes.push(decisionStyleResult.change);

  const valuesResult = mergeList(twin.values, answers[2], 'Core Value');
  changes.push(...valuesResult.changes);

  const communicationResult = mergeCommunicationStyle(twin.communicationStyle, answers[3]);
  if (communicationResult.change) changes.push(communicationResult.change);

  return {
    merged: {
      ...twin,
      role: roleResult.value,
      decisionStyle: decisionStyleResult.value,
      values: valuesResult.value,
      communicationStyle: communicationResult.value,
    },
    changes,
  };
}

export default function UpdateTwinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const twin = getTwin(id);

  if (!id || !twin) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-base text-gray-600 text-center">Twin not found.</Text>
      </SafeAreaView>
    );
  }

  function handleComplete(answers: string[]) {
    const { merged, changes } = computeMerge(twin!, answers);
    if (changes.length === 0) return;
    const changedFields = Array.from(new Set(changes.map((change) => change.field)));
    const historyLabels = changes.map(changeToHistoryLabel);
    updateTwin(merged, changedFields, historyLabels);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <InterviewChat
        questions={QUESTIONS}
        loadingTitle="Updating Decision Twin..."
        loadingLines={LOADING_LINES}
        successMessage="Decision Twin Updated"
        revealButtonLabel="Apply Changes"
        onComplete={handleComplete}
        onDone={() => router.back()}
        onDiscard={() => router.back()}
        summary={(answers) => {
          const { changes } = computeMerge(twin!, answers);
          return (
            <>
              <View className="mb-6">
                <Text className="text-2xl font-bold text-gray-900 mb-1">Changes Detected</Text>
                <Text className="text-base text-gray-600">
                  Review what's new before applying to {twin!.name}'s profile.
                </Text>
              </View>

              {changes.length === 0 ? (
                <ProfileSectionCard title="No Changes" className="mb-0">
                  <Text className="text-sm text-gray-600 leading-5">
                    Nothing new was detected in your answers — the profile stays as it is.
                  </Text>
                </ProfileSectionCard>
              ) : (
                changes.map((change, index) => (
                  <ProfileSectionCard
                    key={index}
                    title={change.type === 'added' ? '✓ Added' : '✓ Updated'}
                    className={index === changes.length - 1 ? 'mb-0' : undefined}
                  >
                    {change.type === 'added' ? (
                      <Text className="text-sm text-gray-900 font-medium">
                        {change.after} <Text className="text-gray-500 font-normal">({change.field})</Text>
                      </Text>
                    ) : (
                      <View>
                        <Text className="text-sm font-medium text-gray-900 mb-2">{change.field}</Text>
                        <Text className="text-sm text-gray-500 leading-5">{change.before}</Text>
                        <Text className="text-sm text-gray-400 my-1">↓</Text>
                        <Text className="text-sm text-gray-900 leading-5">{change.after}</Text>
                      </View>
                    )}
                  </ProfileSectionCard>
                ))
              )}
            </>
          );
        }}
      />
    </SafeAreaView>
  );
}
