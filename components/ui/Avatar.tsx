/**
 * Avatar Component
 *
 * Profile picture or initials display.
 */

import React from 'react';
import { View, Text, Image } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-8 h-8', text: 'text-xs' };
      case 'md':
        return { container: 'w-12 h-12', text: 'text-base' };
      case 'lg':
        return { container: 'w-16 h-16', text: 'text-xl' };
      case 'xl':
        return { container: 'w-24 h-24', text: 'text-3xl' };
    }
  };

  const sizeStyles = getSizeStyles();

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`${sizeStyles.container} rounded-full bg-gray-200`}
      />
    );
  }

  return (
    <View
      className={`
        ${sizeStyles.container}
        rounded-full
        bg-primary-100
        items-center
        justify-center
      `}
    >
      <Text className={`${sizeStyles.text} font-semibold text-primary-700`}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
