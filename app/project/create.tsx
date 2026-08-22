/**
 * Create Project Screen
 *
 * A plain form, not a chat-style interview -- this is the single biggest
 * thing that used to make Projects "feel like a copy of Twins." A Twin's
 * personality genuinely benefits from a natural-conversation interview;
 * a Project is a structured workspace (title/description/objectives/
 * deadline/stakeholders/constraints/notes), which a real form represents
 * more honestly and fills in faster. No agent is involved in creating a
 * Project at all -- see tools/project.ts's saveProjectProfile().
 *
 * Projects are independent of Twins (no twinId collected here) -- which
 * Twin answers questions about this project is chosen later, at chat-time.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { ProjectTool } from '../../tools/project';
import { ProjectProfile } from '../../types/profile';
import { theme } from '../../constants/theme';

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  helperText?: string;
}

function FormField({ label, value, onChangeText, placeholder, required, multiline, helperText }: FieldProps) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-on-surface-variant mb-1.5">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`border border-surface-border bg-surface-high rounded-xl px-4 py-3 text-base text-on-surface ${
          multiline ? 'min-h-[90px]' : ''
        }`}
      />
      {helperText && <Text className="text-xs text-gray-400 mt-1">{helperText}</Text>}
    </View>
  );
}

export default function CreateProjectScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [deadline, setDeadline] = useState('');
  const [stakeholders, setStakeholders] = useState('');
  const [constraints, setConstraints] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSave =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    splitLines(objectives).length > 0 &&
    splitLines(constraints).length > 0 &&
    !isSaving;

  async function handleSave() {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);

    const profile: ProjectProfile = {
      title: title.trim(),
      description: description.trim(),
      objectives: splitLines(objectives),
      deadline: deadline.trim() || undefined,
      stakeholders: splitLines(stakeholders),
      constraints: splitLines(constraints),
      notes: notes.trim() || undefined,
    };

    const result = await ProjectTool.save(profile);
    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.replace(`/project/${result.project.id}`);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1" edges={['bottom', 'left', 'right']}>
        {/* Only header on this screen -- the native one is hidden (see
            app/_layout.tsx), it used to render "New Project" twice: once as
            the native title, once as this heading directly beneath it. */}
        <View className="px-2 pt-2">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 pt-2" keyboardShouldPersistTaps="handled">
          <Text className="text-2xl font-bold text-on-surface mb-1">New Project</Text>
          <Text className="text-sm text-on-surface-variant mb-6">
            A workspace holding the context for one initiative.
          </Text>

          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Website Redesign" required />
          <FormField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What is this project about?"
            required
            multiline
          />
          <FormField
            label="Objectives"
            value={objectives}
            onChangeText={setObjectives}
            placeholder={'Increase conversion rate\nLaunch by end of quarter'}
            required
            multiline
            helperText="One objective per line."
          />
          <FormField
            label="Deadline"
            value={deadline}
            onChangeText={setDeadline}
            placeholder="e.g. End of Q3, or a specific date"
          />
          <FormField
            label="Stakeholders"
            value={stakeholders}
            onChangeText={setStakeholders}
            placeholder={'Head of Design\nEngineering Lead'}
            multiline
            helperText="One per line."
          />
          <FormField
            label="Constraints"
            value={constraints}
            onChangeText={setConstraints}
            placeholder={'Fixed budget\nMust ship on legacy infrastructure'}
            required
            multiline
            helperText="One per line."
          />
          <FormField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything else worth noting"
            multiline
          />

          {error && <Text className="text-sm text-red-500 mb-3">{error}</Text>}
        </ScrollView>

        <View className="px-6 py-4 bg-background border-t border-surface-border">
          <Button title="Create Project" onPress={handleSave} disabled={!canSave} loading={isSaving} fullWidth />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
