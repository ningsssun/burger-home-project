import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Colors, BorderRadius, Typography } from '../../constants/theme';

interface AvatarProps {
  name: string;
  photoURL?: string | null;
  size?: number;
  style?: ViewStyle | ImageStyle;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B35', '#4CC9F0', '#06D6A0', '#8B5CF6',
    '#F59E0B', '#EF233C', '#3B82F6', '#10B981',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, photoURL, size = 40, style }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const fontSize = size * 0.4;

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[
          { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' } as ImageStyle,
          style as ImageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as ViewStyle,
  initials: {
    color: Colors.white,
    fontWeight: Typography.bold,
  } as TextStyle,
});
