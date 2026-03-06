import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  } as ViewStyle,

  // Variants
  primary: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  secondary: {
    backgroundColor: Colors.gray100,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  } as ViewStyle,
  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  danger: {
    backgroundColor: Colors.error,
  } as ViewStyle,

  // Sizes
  size_sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  } as ViewStyle,
  size_md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
  } as ViewStyle,
  size_lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  } as ViewStyle,

  fullWidth: {
    width: '100%',
  } as ViewStyle,

  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  // Text base
  text: {
    fontWeight: Typography.semibold,
  } as TextStyle,

  // Text variants
  text_primary: { color: Colors.white } as TextStyle,
  text_secondary: { color: Colors.textPrimary } as TextStyle,
  text_outline: { color: Colors.primary } as TextStyle,
  text_ghost: { color: Colors.primary } as TextStyle,
  text_danger: { color: Colors.white } as TextStyle,

  // Text sizes
  textSize_sm: { fontSize: Typography.sm } as TextStyle,
  textSize_md: { fontSize: Typography.base } as TextStyle,
  textSize_lg: { fontSize: Typography.lg } as TextStyle,
});
