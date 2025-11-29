/**
 * Material Design 3 Typography System
 * Based on exact Gemini app specifications
 *
 * Font Families:
 * - Display/Headline: Google Sans (fallback: Roboto/system)
 * - Body/Label: Roboto (fallback: system)
 *
 * Type Scale: Material 3 standard (5 categories × 3 sizes each)
 */

// Font family constants
export const FONT_FAMILIES = {
  // Google Sans for display and headings (will be loaded when available)
  display: 'Roboto_400Regular', // Fallback to Roboto for now
  heading: 'Roboto_500Medium',  // Fallback to Roboto for now

  // Roboto for body text and labels
  body: 'Roboto_400Regular',
  label: 'Roboto_500Medium',

  // System fallbacks
  systemDefault: 'System',
} as const;

/**
 * Material Design 3 Complete Type Scale
 * Source: https://m3.material.io/styles/typography/type-scale-tokens
 */

// DISPLAY (Reserved for hero elements - Google Sans preferred)
export const displayLarge = {
  fontFamily: FONT_FAMILIES.display,
  fontSize: 57,
  lineHeight: 64,
  fontWeight: '400' as const,  // Will be 475 with Google Sans
  letterSpacing: 0,
};

export const displayMedium = {
  fontFamily: FONT_FAMILIES.display,
  fontSize: 45,
  lineHeight: 52,
  fontWeight: '400' as const,
  letterSpacing: 0,
};

export const displaySmall = {
  fontFamily: FONT_FAMILIES.display,
  fontSize: 36,
  lineHeight: 44,
  fontWeight: '400' as const,
  letterSpacing: 0,
};

// HEADLINE (Main section headers - Google Sans preferred)
export const headlineLarge = {
  fontFamily: FONT_FAMILIES.heading,
  fontSize: 32,
  lineHeight: 40,
  fontWeight: '500' as const,  // Will be 475 with Google Sans
  letterSpacing: 0,
};

export const headlineMedium = {
  fontFamily: FONT_FAMILIES.heading,
  fontSize: 28,
  lineHeight: 36,
  fontWeight: '500' as const,
  letterSpacing: 0,
};

export const headlineSmall = {
  fontFamily: FONT_FAMILIES.heading,
  fontSize: 24,
  lineHeight: 32,
  fontWeight: '500' as const,
  letterSpacing: 0,
};

// TITLE (Component titles - Roboto)
export const titleLarge = {
  fontFamily: FONT_FAMILIES.body,
  fontSize: 22,
  lineHeight: 28,
  fontWeight: '400' as const,
  letterSpacing: 0,
};

export const titleMedium = {
  fontFamily: FONT_FAMILIES.label,
  fontSize: 16,
  lineHeight: 24,
  fontWeight: '500' as const,
  letterSpacing: 0.15,
};

export const titleSmall = {
  fontFamily: FONT_FAMILIES.label,
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '500' as const,
  letterSpacing: 0.1,
};

// BODY (Main content text - Roboto)
export const bodyLarge = {
  fontFamily: FONT_FAMILIES.body,
  fontSize: 16,
  lineHeight: 24,
  fontWeight: '400' as const,
  letterSpacing: 0.5,
};

export const bodyMedium = {
  fontFamily: FONT_FAMILIES.body,
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '400' as const,
  letterSpacing: 0.25,
};

export const bodySmall = {
  fontFamily: FONT_FAMILIES.body,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '400' as const,
  letterSpacing: 0.4,
};

// LABEL (Buttons, chips, tags - Roboto Medium)
export const labelLarge = {
  fontFamily: FONT_FAMILIES.label,
  fontSize: 14,
  lineHeight: 20,
  fontWeight: '500' as const,
  letterSpacing: 0.1,
};

export const labelMedium = {
  fontFamily: FONT_FAMILIES.label,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '500' as const,
  letterSpacing: 0.5,
};

export const labelSmall = {
  fontFamily: FONT_FAMILIES.label,
  fontSize: 11,
  lineHeight: 16,
  fontWeight: '500' as const,
  letterSpacing: 0.5,
};

/**
 * Gemini-Specific Typography Usage
 * Maps component contexts to Material 3 type scale
 */
export const geminiTypography = {
  // Welcome Screen
  welcomeGreeting: headlineLarge,        // "Hi there" (32px, headlineL)
  welcomeSubtitle: titleMedium,          // "Gemini 3 is here..." (16px, titleM)

  // Chat Bubbles
  messageBubble: bodyLarge,              // Message text (16px, bodyL)
  messageTimestamp: bodySmall,           // Timestamps (12px, bodyS)

  // Suggestion Chips
  suggestionChip: labelLarge,            // Chip text (14px, labelL)

  // Bottom Input Bar
  inputPlaceholder: bodyLarge,           // "Ask Gemini" (16px, bodyL)
  inputChipLabel: labelMedium,           // "Fast ⚡" (12px, labelM)

  // Header
  headerTitle: titleLarge,               // "Gemini" (22px, titleL)
  headerIcon: labelLarge,                // Icons text (14px, labelL)

  // General UI
  buttonText: labelLarge,                // Button labels (14px, labelL)
  caption: bodySmall,                    // Captions (12px, bodyS)
  statusText: labelMedium,               // Status text (12px, labelM)
} as const;

/**
 * Legacy typography object for backward compatibility
 * @deprecated Use Material 3 type scale directly (e.g., bodyLarge, headlineMedium)
 */
export const typography = {
  // Display (Hero sections)
  display: displayLarge,

  // Headings
  h1: headlineLarge,
  h2: headlineMedium,
  h3: headlineSmall,
  h4: titleLarge,

  // Body Text
  body: bodyLarge,
  bodySmall: bodySmall,

  // Caption/Labels
  caption: bodySmall,

  // Button Text
  button: labelLarge,
  buttonSmall: labelMedium,

  // Labels
  label: labelMedium,
};

export type Typography = typeof typography;

/**
 * Helper to get font family name for loading
 * Returns array of font names to load with expo-font
 */
export const getFontsToLoad = () => ({
  Roboto_400Regular: require('@expo-google-fonts/roboto').Roboto_400Regular,
  Roboto_500Medium: require('@expo-google-fonts/roboto').Roboto_500Medium,
  // Future: Add Google Sans fonts here when downloaded
  // GoogleSans_400Regular: require('./assets/fonts/GoogleSans-Regular.ttf'),
  // GoogleSans_500Medium: require('./assets/fonts/GoogleSans-Medium.ttf'),
});

/**
 * Text style helper for components
 * Combines typography with optional color
 */
export const createTextStyle = (
  typographyStyle: typeof bodyLarge,
  color?: string
) => ({
  ...typographyStyle,
  ...(color && { color }),
});
