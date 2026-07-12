import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import type { ActivityType } from '../types';

// Adventure / Nature palette: dark green, orange, earth tones, white.
export const colors = {
  darkGreen: '#1B4332',
  green: '#2D6A4F',
  lightGreen: '#74C69D',
  orange: '#E76F51',
  amber: '#F4A261',
  sand: '#E9DFCB',
  earthBrown: '#6B4E33',
  white: '#FFFFFF',
  offWhite: '#F7F5F0',
  charcoal: '#22262A',
  danger: '#D64545',
  success: '#2D6A4F',
} as const;

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.darkGreen,
    secondary: colors.orange,
    tertiary: colors.amber,
    background: colors.offWhite,
    surface: colors.white,
    error: colors.danger,
    onPrimary: colors.white,
    onSecondary: colors.white,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.lightGreen,
    secondary: colors.amber,
    tertiary: colors.orange,
    background: colors.charcoal,
    surface: '#2B302F',
    error: '#FF6B6B',
    onPrimary: colors.charcoal,
    onSecondary: colors.charcoal,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  full: 999,
} as const;

export interface ActivityTypeOption {
  label: string;
  value: ActivityType;
  icon: string;
}

export const activityTypes: ActivityTypeOption[] = [
  { label: 'Hiking', value: 'Hiking', icon: 'hiking' },
  { label: 'Camping', value: 'Camping', icon: 'tent' },
  { label: 'Cycling', value: 'Cycling', icon: 'bike' },
  { label: 'Road Trip', value: 'Road Trip', icon: 'car-side' },
  { label: 'Mountain Adventure', value: 'Mountain Adventure', icon: 'image-filter-hdr' },
  { label: 'Beach Adventure', value: 'Beach Adventure', icon: 'beach' },
];
