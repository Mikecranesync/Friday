/**
 * Google Gemini-inspired Color System
 * Light and Dark mode palettes following Gemini's design
 */

export const lightColors = {
  // Backgrounds (Gemini grayish light mode)
  background: {
    primary: '#F5F5F5',     // Grayish background
    secondary: '#EEEEEE',
    tertiary: '#E8E8E8',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
  },

  // Text
  text: {
    primary: '#222222',      // Darker for better contrast
    secondary: '#5F6368',
    tertiary: '#80868B',
    disabled: '#DADCE0',
  },

  // Primary Brand (Gemini Blue-to-Pink Gradient)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#4285F4',  // Gemini Blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary (Gemini Pink - for gradient)
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD0',
    200: '#F48FB1',
    300: '#F06292',
    400: '#EC407A',
    500: '#D96570',  // Gemini Pink
    600: '#C2185B',
    700: '#AD1457',
    800: '#880E4F',
    900: '#560027',
  },

  // Gradient for chat bubbles/accents
  gradient: {
    start: '#4285F4',    // Gemini Blue
    end: '#D96570',      // Gemini Pink
  },

  // Semantic Colors
  success: '#10B981',
  info: '#3B82F6',
  warning: '#F59E0B',
  error: '#EF4444',

  // Borders & Dividers
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    heavy: '#9CA3AF',
  },

  // Interactive States
  hover: 'rgba(0, 0, 0, 0.04)',
  pressed: 'rgba(0, 0, 0, 0.08)',
  focus: '#3B82F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.32)',

  // Gemini Accent Colors (for UI elements)
  accent: {
    purple: '#6750A4',        // Chip accent bars
    magenta: '#C5006F',       // Avatar background
    inputBg: '#F1F3F4',       // Input background
    iconGray: '#5F6368',      // Icon color
  },
};

export const darkColors = {
  // Backgrounds (Gemini pure black)
  background: {
    primary: '#000000',      // Pure black like Gemini
    secondary: '#121212',
    tertiary: '#1E1E1E',
    card: '#1A1A1A',
    elevated: '#2A2A2A',
  },

  // Text
  text: {
    primary: '#E3E3E3',      // Gemini light text
    secondary: '#9AA0A6',
    tertiary: '#5F6368',
    disabled: '#3C4043',
  },

  // Primary Brand (Gemini Blue - brighter for dark mode)
  primary: {
    50: '#0D47A1',
    100: '#1565C0',
    200: '#1976D2',
    300: '#1E88E5',
    400: '#2196F3',
    500: '#42A5F5',  // Brighter blue for dark mode
    600: '#64B5F6',
    700: '#90CAF9',
    800: '#BBDEFB',
    900: '#E3F2FD',
  },

  // Secondary (Gemini Pink - brighter for dark mode)
  secondary: {
    50: '#560027',
    100: '#880E4F',
    200: '#AD1457',
    300: '#C2185B',
    400: '#E91E63',
    500: '#EC407A',  // Brighter pink for dark mode
    600: '#F06292',
    700: '#F48FB1',
    800: '#F8BBD0',
    900: '#FCE4EC',
  },

  // Gradient for chat bubbles/accents
  gradient: {
    start: '#42A5F5',    // Brighter Gemini Blue
    end: '#EC407A',      // Brighter Gemini Pink
  },

  // Semantic Colors (adjusted for dark)
  success: '#34D399',
  info: '#60A5FA',
  warning: '#FBBF24',
  error: '#F87171',

  // Borders & Dividers
  border: {
    light: '#2A2A2A',
    medium: '#3A3A3A',
    heavy: '#4A4A4A',
  },

  // Interactive States
  hover: 'rgba(255, 255, 255, 0.08)',
  pressed: 'rgba(255, 255, 255, 0.12)',
  focus: '#60A5FA',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.6)',

  // Gemini Accent Colors (for UI elements)
  accent: {
    purple: '#8D7AB8',        // Brighter purple for dark mode
    magenta: '#E91E63',       // Brighter magenta for dark mode
    inputBg: '#2A2A2A',       // Input background dark mode
    iconGray: '#9AA0A6',      // Icon color dark mode
  },
};

export type Colors = typeof lightColors;
