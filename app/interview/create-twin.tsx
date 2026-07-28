/**
 * Create Twin Screen
 *
 * Personal interview flow — scripted mock conversation only.
 * Wiring to the real Interview Agent / useInterview() happens in Phase 3.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { InterviewChat } from '../../components/shared/InterviewChat';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';

// Placeholder script — replace with the real Interview Agent conversation in Phase 3.
const QUESTIONS = [
  "Hi! I'm going to learn how you make decisions. Let's start — what's your name?",
  'What is your role?',
  'How do you usually make decisions?',
  'What values guide your decisions most?',
  'How would you describe your communication style?',
  'How do you usually handle disagreements with your team?',
];

const LOADING_LINES = ['Analyzing your responses...', 'Building your Decision Profile...'];

export default function CreateTwinScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <InterviewChat
        questions={QUESTIONS}
        loadingTitle="Generating Decision Twin..."
        loadingLines={LOADING_LINES}
        onDone={() => router.back()}
        summary={
          <>
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 mb-1">Hassan Osama</Text>
              <Text className="text-base text-gray-600">Project Manager</Text>
            </View>

            <ProfileSectionCard title="Decision Style">
              <Text className="text-sm text-gray-600 leading-5">Analytical</Text>
            </ProfileSectionCard>

            <ProfileSectionCard title="Core Values">
              <BulletList items={['Customer First', 'Long-term Thinking']} />
            </ProfileSectionCard>

            <ProfileSectionCard title="Communication Style" className="mb-0">
              <BulletList items={['Direct', 'Concise']} />
            </ProfileSectionCard>
          </>
        }
      />
    </SafeAreaView>
  );
}
