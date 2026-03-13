export const Colors = {
  // Brand
  primary: '#F1B1DF',
  primaryLight: '#F7CDE9',
  primaryDark: '#D47DBB',

  // CASA brand
  ink: '#1E0517',
  pink: '#F1B1DF',
  slate: '#7A5A74',
  lightBg: '#F4F4F4',

  // Accent
  accent: '#FFD166',
  accentLight: '#FFE199',

  // Semantic
  success: '#06D6A0',
  warning: '#FFD166',
  error: '#EF233C',
  info: '#4CC9F0',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  textPrimary: '#1E0517',
  textSecondary: '#7A5A74',
  textDisabled: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Task categories
  categoryClean: '#4CC9F0',
  categoryCook: '#FF6B35',
  categoryShop: '#06D6A0',
  categoryLaundry: '#8B5CF6',
  categoryMaintain: '#F59E0B',
  categoryOther: '#9CA3AF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  // Line heights
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const TASK_CATEGORIES = [
  { id: 'clean', label: 'Clean', emoji: '🧹', color: Colors.categoryClean },
  { id: 'cook', label: 'Cook', emoji: '🍳', color: Colors.categoryCook },
  { id: 'shop', label: 'Shop', emoji: '🛒', color: Colors.categoryShop },
  { id: 'laundry', label: 'Laundry', emoji: '👕', color: Colors.categoryLaundry },
  { id: 'maintain', label: 'Maintain', emoji: '🔧', color: Colors.categoryMaintain },
  { id: 'other', label: 'Other', emoji: '📋', color: Colors.categoryOther },
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number]['id'];
