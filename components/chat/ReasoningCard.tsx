/**
 * Reasoning Card
 *
 * Collapsible "Why?" section attached to an AI chat message. Collapsed by
 * default; expands into a premium card with each reasoning point as its own
 * numbered row (icon + concise text) rather than one long bullet list, so it
 * reads as a structured AI explanation instead of a debug dump.
 *
 * Note on content: the Decision Agent's output is a flat `reasoning: string[]`
 * (see types/agent.ts) — there is no per-point category/title in the data,
 * and business logic/agent output isn't something this pass changes. Each
 * array entry gets its own numbered row here; the numbering and card
 * treatment are what make it feel organized, not fabricated section labels.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '../../constants/theme';

interface ReasoningCardProps {
  reasoning: string[];
}

function ReasoningRow({ index, text, isLast }: { index: number; text: string; isLast: boolean }) {
  return (
    <View className={`flex-row items-start py-2.5 ${isLast ? '' : 'border-b border-surface-border'}`}>
      <View className="w-5 h-5 rounded-full bg-primary-50 items-center justify-center mr-2.5 mt-0.5">
        <Text className="text-[10px] font-bold text-primary-700">{index + 1}</Text>
      </View>
      <Text className="flex-1 text-[13px] text-on-surface-variant leading-5">{text}</Text>
    </View>
  );
}

export function ReasoningCard({ reasoning }: ReasoningCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentHeight = useSharedValue(0);
  const progress = useSharedValue(0);
  const measuredRef = useRef(false);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration: 220 });
  }, [expanded, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
    opacity: progress.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  function handleContentLayout(event: LayoutChangeEvent) {
    // Measured once — the reasoning list itself never changes after the
    // message is rendered, so there's nothing to re-measure on later layouts.
    if (measuredRef.current) return;
    measuredRef.current = true;
    contentHeight.value = event.nativeEvent.layout.height;
  }

  return (
    <View className="mt-2 self-start" style={{ maxWidth: 300 }}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center gap-1"
        hitSlop={6}
      >
        <Text className="text-sm font-semibold text-primary-600">Why?</Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={14} color={theme.colors.primary[600]} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[containerStyle, { overflow: 'hidden' }]}>
        {/* Rendered off-flow at a fixed position so onLayout can measure its
            natural height once, independent of the animated wrapper's own
            (animated, therefore momentarily 0) height. */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} onLayout={handleContentLayout}>
          <View
            className="bg-surface border border-surface-border rounded-2xl px-4 py-1 mt-2"
            style={theme.shadows.sm}
          >
            <View className="flex-row items-center justify-between pt-2.5 pb-1">
              <Text className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                Reasoning
              </Text>
              <Text className="text-[11px] text-on-surface-variant">{reasoning.length} points</Text>
            </View>
            {reasoning.map((text, index) => (
              <ReasoningRow key={index} index={index} text={text} isLast={index === reasoning.length - 1} />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
