/**
 * SuggestionChip - Gemini-style suggestion button
 * Vertical pill-shaped buttons for common email actions
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { labelLarge } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

export interface Suggestion {
  id: string;
  text: string;
  icon?: string;
}

interface SuggestionChipProps {
  suggestion: Suggestion;
  onPress: (suggestion: Suggestion) => void;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  suggestion,
  onPress,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(suggestion)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={suggestion.text}
      accessibilityHint="Tap to send this command"
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? colors.background.card
            : '#FFFFFF',
          borderColor: colors.border.light,
          ...shadows.small,
        },
      ]}
    >
      {/* Purple Accent Bar */}
      <View style={[styles.accentBar, { backgroundColor: colors.accent.purple }]} />

      <Text
        style={[
          styles.text,
          labelLarge,
          {
            color: colors.text.primary,
          },
        ]}
        numberOfLines={2}
      >
        {suggestion.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    minHeight: 48, // WCAG 2.1 AA minimum touch target
    minWidth: 48,
  },
  accentBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  text: {
    // Typography comes from labelLarge
  },
});
