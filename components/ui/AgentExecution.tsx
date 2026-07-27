/**
 * Agent Execution Component
 *
 * Our app's signature feature: visualizes the multi-agent execution flow.
 * Shows: Coordinator → Decision → Review
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { AgentExecutionState } from '../../types/agent';
import { theme } from '../../constants/theme';

interface AgentExecutionProps {
  state: AgentExecutionState;
  currentAgent?: string;
}

export function AgentExecution({ state, currentAgent }: AgentExecutionProps) {
  // Animation values for each agent node
  const coordinatorOpacity = useSharedValue(0.3);
  const decisionOpacity = useSharedValue(0.3);
  const reviewOpacity = useSharedValue(0.3);

  // Update animations based on current state
  useEffect(() => {
    switch (state) {
      case 'idle':
        coordinatorOpacity.value = withTiming(0.3, { duration: 200 });
        decisionOpacity.value = withTiming(0.3, { duration: 200 });
        reviewOpacity.value = withTiming(0.3, { duration: 200 });
        break;

      case 'coordinator':
        coordinatorOpacity.value = withSequence(
          withTiming(1, { duration: 300, easing: Easing.ease }),
          withTiming(0.8, { duration: 200 })
        );
        decisionOpacity.value = withTiming(0.3, { duration: 200 });
        reviewOpacity.value = withTiming(0.3, { duration: 200 });
        break;

      case 'decision':
        coordinatorOpacity.value = withTiming(0.5, { duration: 200 });
        decisionOpacity.value = withSequence(
          withTiming(1, { duration: 300, easing: Easing.ease }),
          withTiming(0.8, { duration: 200 })
        );
        reviewOpacity.value = withTiming(0.3, { duration: 200 });
        break;

      case 'review':
        coordinatorOpacity.value = withTiming(0.5, { duration: 200 });
        decisionOpacity.value = withTiming(0.5, { duration: 200 });
        reviewOpacity.value = withSequence(
          withTiming(1, { duration: 300, easing: Easing.ease }),
          withTiming(0.8, { duration: 200 })
        );
        break;

      case 'complete':
        coordinatorOpacity.value = withTiming(1, { duration: 300 });
        decisionOpacity.value = withTiming(1, { duration: 300 });
        reviewOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'error':
        coordinatorOpacity.value = withTiming(0.3, { duration: 200 });
        decisionOpacity.value = withTiming(0.3, { duration: 200 });
        reviewOpacity.value = withTiming(0.3, { duration: 200 });
        break;
    }
  }, [state]);

  // Animated styles
  const coordinatorStyle = useAnimatedStyle(() => ({
    opacity: coordinatorOpacity.value,
  }));

  const decisionStyle = useAnimatedStyle(() => ({
    opacity: decisionOpacity.value,
  }));

  const reviewStyle = useAnimatedStyle(() => ({
    opacity: reviewOpacity.value,
  }));

  if (state === 'idle') {
    return null;
  }

  return (
    <View className="py-4 px-6">
      <View className="flex-col items-center">
        {/* Coordinator Node */}
        <Animated.View
          style={[coordinatorStyle]}
          className="flex-row items-center"
        >
          <View className="bg-primary-100 rounded-full px-4 py-2 border border-primary-300">
            <Text className="text-primary-700 font-medium text-sm">
              Coordinator
            </Text>
          </View>
        </Animated.View>

        {/* Arrow */}
        <View className="h-6 w-px bg-gray-300 my-1" />

        {/* Decision Node */}
        <Animated.View
          style={[decisionStyle]}
          className="flex-row items-center"
        >
          <View className="bg-primary-100 rounded-full px-4 py-2 border border-primary-300">
            <Text className="text-primary-700 font-medium text-sm">
              Decision
            </Text>
          </View>
        </Animated.View>

        {/* Arrow */}
        <View className="h-6 w-px bg-gray-300 my-1" />

        {/* Review Node */}
        <Animated.View
          style={[reviewStyle]}
          className="flex-row items-center"
        >
          <View className="bg-primary-100 rounded-full px-4 py-2 border border-primary-300">
            <Text className="text-primary-700 font-medium text-sm">
              Review
            </Text>
          </View>
        </Animated.View>
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
