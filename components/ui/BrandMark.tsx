/**
 * Brand Mark
 *
 * The Decision Twin dot-grid glyph — four rounded squares in a 2x2 grid,
 * drawn from Views rather than an image asset. /assets/icon.png and
 * favicon.png are currently blank placeholders (see brand handoff), so this
 * is the one reliable, crisp-at-any-size way to put the mark on screen
 * until real exported icon/splash assets exist. Used in loading/empty
 * states and anywhere else the app needs its own logo mark rather than a
 * generic spinner.
 */

import React from 'react';
import { View } from 'react-native';
import { theme } from '../../constants/theme';

interface BrandMarkProps {
  /** Overall bounding box (square). Defaults to 40. */
  size?: number;
  color?: string;
}

export function BrandMark({ size = 40, color = theme.colors.primary[600] }: BrandMarkProps) {
  const gap = size * 0.16;
  const dot = (size - gap) / 2;
  const radius = dot * 0.32;

  return (
    <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{ width: dot, height: dot, borderRadius: radius, backgroundColor: color }}
        />
      ))}
    </View>
  );
}
