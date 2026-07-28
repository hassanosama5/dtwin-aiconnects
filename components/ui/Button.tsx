/**
 * Button Component
 *
 * Reusable button with variants inspired by Linear/Apple design.
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { theme } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 border-primary-600';
      case 'secondary':
        return 'bg-white border-gray-300';
      case 'ghost':
        return 'bg-transparent border-transparent';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-white';
      case 'secondary':
        return 'text-gray-900';
      case 'ghost':
        return 'text-primary-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2';
      case 'md':
        return 'px-4 py-3';
      case 'lg':
        return 'px-6 py-4';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg
        border
        flex-row
        items-center
        justify-center
        ${disabled || loading ? 'opacity-50' : ''}
        ${className ?? ''}
      `}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : theme.colors.primary[600]}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <View>{icon}</View>}
          <Text
            className={`
              ${getTextStyles()}
              ${getTextSizeStyles()}
              font-semibold
            `}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
