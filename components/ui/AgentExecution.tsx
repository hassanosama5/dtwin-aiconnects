/**
 * Agent Execution Component
 *
 * Our app's signature feature: visualizes the multi-agent execution flow.
 * Shows: Coordinator → Decision → Review
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { AgentExecutionState } from '../../types/agent';
import { theme } from '../../constants/theme';
import { ProgressBar } from '../chat/ProgressBar';

interface AgentExecutionProps {
  state: AgentExecutionState;
  currentAgent?: string;
  /** 0-100, from store/appStore.ts's agentExecution.progress. */
  progress?: number;
}

type NodeState = 'pending' | 'active' | 'done';

const NODES: { key: 'coordinator' | 'decision' | 'review'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'coordinator', label: 'Coordinator', icon: 'git-network-outline' },
  { key: 'decision', label: 'Decision', icon: 'bulb-outline' },
  { key: 'review', label: 'Review', icon: 'shield-checkmark-outline' },
];

const ORDER: Record<string, number> = { coordinator: 0, decision: 1, review: 2, complete: 3 };

function nodeState(nodeKey: string, state: AgentExecutionState): NodeState {
  if (state === 'error' || state === 'idle') return 'pending';
  const current = ORDER[state] ?? 0;
  const nodeIndex = ORDER[nodeKey];
  if (current > nodeIndex) return 'done';
  if (current === nodeIndex) return 'active';
  return 'pending';
}

function Node({ label, icon, status }: { label: string; icon: keyof typeof Ionicons.glyphMap; status: NodeState }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    if (status === 'active') {
      opacity.value = withTiming(1, { duration: 250, easing: Easing.ease });
      scale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 500, easing: Easing.ease }),
          withTiming(1, { duration: 500, easing: Easing.ease })
        ),
        -1,
        true
      );
    } else if (status === 'done') {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const bg = status === 'pending' ? 'bg-gray-100' : 'bg-primary-50';
  const border = status === 'pending' ? 'border-gray-200' : 'border-primary-300';
  const text = status === 'pending' ? theme.colors.gray[400] : theme.colors.primary[600];

  return (
    <Animated.View style={animatedStyle} className="flex-row items-center">
      <View className={`flex-row items-center gap-2 rounded-full px-4 py-2 border ${bg} ${border}`}>
        <Ionicons name={status === 'done' ? 'checkmark-circle' : icon} size={15} color={text} />
        <Text style={{ color: text }} className="font-medium text-sm">
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

export function AgentExecution({ state, currentAgent, progress = 0 }: AgentExecutionProps) {
  if (state === 'idle') {
    return null;
  }

  return (
    <View className="py-4 px-6">
      {state !== 'complete' && state !== 'error' && (
        <ProgressBar label="Running" collected={progress} total={100} />
      )}

      <View className="flex-col items-center">
        {NODES.map((node, index) => {
          const status = nodeState(node.key, state);
          const nextStatus = index < NODES.length - 1 ? nodeState(NODES[index + 1].key, state) : null;
          return (
            <React.Fragment key={node.key}>
              <Node label={node.label} icon={node.icon} status={status} />
              {nextStatus && (
                <View
                  className={`h-6 w-px my-1 ${
                    status === 'done' ? 'bg-primary-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Status text */}
      {currentAgent && state !== 'complete' && (
        <Text className="text-center text-gray-500 text-sm mt-3">
          {currentAgent}...
        </Text>
      )}
    </View>
  );
}
