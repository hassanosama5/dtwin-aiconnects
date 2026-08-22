/**
 * Twin Picker Sheet
 *
 * Bottom sheet listing all of the user's Twins so they can choose which one
 * to consult about an open Project. The inverse of
 * components/twin/ProjectPickerSheet.tsx: there, a Twin is fixed and you
 * pick a Project; here, a Project is fixed and you pick a Twin — since
 * Projects are independent of any one Twin (see tools/project.ts).
 */

import React from 'react';
import { View, Text, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { PressableScale } from '../ui/PressableScale';
import { theme } from '../../constants/theme';
import { Twin } from '../../types/database';

interface TwinPickerSheetProps {
  visible: boolean;
  projectName: string;
  twins: Twin[];
  onSelect: (twinId: string) => void;
  onClose: () => void;
}

export function TwinPickerSheet({ visible, projectName, twins, onSelect, onClose }: TwinPickerSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <Pressable className="mt-auto" onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']} className="bg-surface rounded-t-3xl">
            <View className="items-center pt-3">
              <View className="w-9 h-1 rounded-full bg-surface-highest" />
            </View>
            <View className="px-6 pt-4 pb-2">
              <Text className="text-lg font-semibold text-on-surface">Consult which Twin?</Text>
              <Text className="text-sm text-on-surface-variant mt-1">
                Choose who should answer questions about {projectName}.
              </Text>
            </View>
            <ScrollView className="px-6 pt-2" style={{ maxHeight: 360 }}>
              {twins.map((twin) => (
                <PressableScale key={twin.id} onPress={() => onSelect(twin.id)}>
                  <View className="flex-row items-center justify-between py-3 border-b border-surface-border">
                    <View className="flex-row items-center flex-1 pr-3">
                      <Avatar name={twin.name} imageUrl={twin.avatar_url} size="sm" />
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-medium text-on-surface" numberOfLines={1}>
                          {twin.name}
                        </Text>
                        <Text className="text-sm text-on-surface-variant" numberOfLines={1}>
                          {twin.role}
                        </Text>
                      </View>
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
