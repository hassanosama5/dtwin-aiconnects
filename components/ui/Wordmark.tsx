/**
 * Wordmark
 *
 * The official TWIN wordmark (assets/TwinWordmark.svg), rendered as a real
 * vector component via react-native-svg-transformer rather than a raster
 * image — crisp at any size. The source SVG's intrinsic viewBox is
 * 136x86; height is derived from `width` to preserve that aspect ratio
 * rather than hardcoding both dimensions at each call site.
 */

import React from 'react';
import TwinWordmarkSvg from '../../assets/TwinWordmark.svg';

const INTRINSIC_WIDTH = 136;
const INTRINSIC_HEIGHT = 86;
const ASPECT_RATIO = INTRINSIC_HEIGHT / INTRINSIC_WIDTH;

interface WordmarkProps {
  width?: number;
}

export function Wordmark({ width = INTRINSIC_WIDTH }: WordmarkProps) {
  return <TwinWordmarkSvg width={width} height={width * ASPECT_RATIO} />;
}
