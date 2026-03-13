import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  children: React.ReactNode;
}

export function Card({ elevated = false, children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.elevated, style as ViewStyle]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  } as ViewStyle,
  elevated: {
    borderWidth: 0,
    ...Shadows.md,
  } as ViewStyle,
});
