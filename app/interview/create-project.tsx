/**
 * Create Project Screen
 *
 * Project interview flow — scripted mock conversation only.
 * Wiring to the real Interview Agent / useInterview() happens in Phase 3.
 */

import React from 'react';
import { View, Text } from 'react-native';
// See app/index.tsx -- react-native's own SafeAreaView is deprecated and
// collapses to zero height under the New Architecture on iOS.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { InterviewChat } from '../../components/shared/InterviewChat';
import { ProfileSectionCard, BulletList } from '../../components/cards/ProfileSectionCard';

// Placeholder script — replace with the real Interview Agent conversation in Phase 3.
const QUESTIONS = [
  "Let's learn about your project. What's the project name?",
  'What is the goal of this project?',
  'What are the main priorities?',
  'What constraints should the Decision Twin be aware of?',
  'What decision rules should guide trade-offs?',
  'When should this be escalated to you directly?',
];

const LOADING_LINES = ['Reviewing project details...', 'Building your Project Profile...'];

export default function CreateProjectScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <InterviewChat
        questions={QUESTIONS}
        loadingTitle="Generating Project Profile..."
        loadingLines={LOADING_LINES}
        onDone={() => router.back()}
        summary={
          <>
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 mb-1">Banking App</Text>
              <Text className="text-base text-gray-600">Project Profile</Text>
            </View>

            <ProfileSectionCard title="Goal">
              <Text className="text-sm text-gray-600 leading-5">
                Ship the MVP on time while keeping the app secure and reliable for early banking
                customers.
              </Text>
            </ProfileSectionCard>

            <ProfileSectionCard title="Priorities">
              <BulletList items={['Security', 'Performance', 'Regulatory compliance']} />
            </ProfileSectionCard>

            <ProfileSectionCard title="Constraints">
              <BulletList items={['Fixed launch deadline', 'Limited QA headcount']} />
            </ProfileSectionCard>

            <ProfileSectionCard title="Decision Rules">
              <BulletList
                items={[
                  'Delay the release only for security issues.',
                  'Feature requests that risk the deadline are deferred to the next sprint.',
                ]}
              />
            </ProfileSectionCard>

            <ProfileSectionCard title="Escalation Rules" className="mb-0">
              <BulletList
                items={[
                  'Budget changes require direct approval.',
                  'Any change to the compliance scope must be escalated.',
                ]}
              />
            </ProfileSectionCard>
          </>
        }
      />
    </SafeAreaView>
  );
}
