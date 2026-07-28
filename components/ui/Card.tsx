/**
 * Card Component
 *
 * Clean container component for grouping content.
 */

import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Set false to drop the 'default' variant's shadow, e.g. while pressed. */
  elevated?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  elevated = true,
  className = '',
  ...props
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return `bg-white border border-gray-200 ${elevated ? 'shadow-sm' : ''}`;
      case 'bordered':
        return 'bg-white border border-gray-300';
      case 'flat':
        return 'bg-gray-50';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
    }
  };

  return (
    <View
      className={`
        ${getVariantStyles()}
        ${getPaddingStyles()}
        rounded-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
}
