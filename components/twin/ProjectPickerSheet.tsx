/**
 * Project Picker Sheet
 *
 * Bottom sheet listing a twin's projects so the user can pick which project
 * context to chat in. Extracted from app/twin/[id].tsx once the Home
 * screen's redesigned Twin cards needed the exact same "Ask a Question"
 * decision (0/1/many projects) — see hooks/useAskQuestion.ts, its only two
 * callers.
 */

import React from 'react';
import { View, Text, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { PressableScale } from '../ui/PressableScale';
import { theme } from '../../constants/theme';
import { Project } from '../../types/database';

interface ProjectPickerSheetProps {
  visible: boolean;
  twinName: string;
  projects: Project[];
  onSelect: (projectId: string) => void;
  onClose: () => void;
}

export function ProjectPickerSheet({ visible, twinName, projects, onSelect, onClose }: ProjectPickerSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable className="mt-auto" onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']} className="bg-surface rounded-t-3xl">
            <View className="items-center pt-3">
              <View className="w-9 h-1 rounded-full bg-surface-highest" />
            </View>
            <View className="px-6 pt-4 pb-2">
              <Text className="text-lg font-semibold text-on-surface">Ask which project?</Text>
              <Text className="text-sm text-on-surface-variant mt-1">
                {twinName} answers in the context of one project at a time.
              </Text>
            </View>
            <ScrollView className="px-6 pt-2" style={{ maxHeight: 360 }}>
              {projects.map((project) => (
                <PressableScale key={project.id} onPress={() => onSelect(project.id)}>
                  <View className="flex-row items-center justify-between py-3.5 border-b border-surface-border">
                    <View className="flex-1 pr-3">
                      <Text className="text-base font-medium text-on-surface">{project.name}</Text>
                      <Text className="text-sm text-on-surface-variant mt-0.5" numberOfLines={1}>
                        {project.description || project.project_profile.description}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.gray[400]} />
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
            <View className="px-6 pt-2 pb-4">
              <Button title="Cancel" variant="ghost" onPress={onClose} fullWidth />
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

