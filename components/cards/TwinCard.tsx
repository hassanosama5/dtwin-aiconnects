/**
 * Twin Card
 *
 * Home screen list item: avatar, name, role, project count, last active,
 * with "Ask a Question" (primary) and "View Profile" (secondary) actions.
 * "Ask a Question" uses the shared useAskQuestion() decision (0/1/many
 * projects) — same logic as the Twin Profile screen's own CTA, not a
 * separate copy. The old permanent "Create Project" button is gone per the
 * new product flow: a twin with zero projects is only handled reactively,
 * after tapping "Ask a Question" (it redirects into project creation).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { ProjectPickerSheet } from '../twin/ProjectPickerSheet';
import { useAskQuestion } from '../../hooks/useAskQuestion';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { Twin } from '../../types/database';
import { theme } from '../../constants/theme';

interface TwinCardProps {
  twin: Twin;
  projectCount: number;
  lastActiveAt: string | null;
}

export function TwinCard({ twin, projectCount, lastActiveAt }: TwinCardProps) {
  const router = useRouter();
  const { askQuestion, isResolving, picker, closePicker, selectProject } = useAskQuestion();

  return (
    <>
      <Card className="mb-3">
        {/* Only the identity row navigates on tap -- kept as a sibling of
            the action buttons below, not a wrapper around them, so button
            presses can't also trigger the card's own navigation. */}
        <PressableScale onPress={() => router.push(`/twin/${twin.id}`)}>
          <View className="flex-row items-center">
            <Avatar name={twin.name} imageUrl={twin.avatar_url} size="lg" />
            <View className="flex-1 ml-4">
              <Text className="text-lg font-semibold text-ink-900">{twin.name}</Text>
              <Text className="text-sm text-gray-500">{twin.role}</Text>
              <View className="flex-row items-center gap-3 mt-1.5">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="folder-outline" size={12} color={theme.colors.gray[400]} />
                  <Text className="text-xs text-gray-400">
                    {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                  </Text>
                </View>
                {lastActiveAt && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={12} color={theme.colors.gray[400]} />
                    <Text className="text-xs text-gray-400">{formatRelativeTime(lastActiveAt)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </PressableScale>

        <View className="flex-row gap-2 mt-4">
          <View className="flex-1">
            <Button
              title="Ask a Question"
              size="sm"
              onPress={() => askQuestion(twin)}
              loading={isResolving}
              fullWidth
            />
          </View>
          <View className="flex-1">
            <Button
              title="View Profile"
              variant="secondary"
              size="sm"
              onPress={() => router.push(`/twin/${twin.id}`)}
              fullWidth
            />
          </View>
        </View>
      </Card>

      {picker && (
        <ProjectPickerSheet
          visible
          twinName={picker.twin.name}
          projects={picker.projects}
          onSelect={selectProject}
          onClose={closePicker}
        />
      )}
    </>
  );
}
