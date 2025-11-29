/**
 * SuggestionChip - Gemini-style suggestion button with Material 3 animations
 * Vertical pill-shaped buttons for common email actions
 * Includes Material ripple effect and state layers
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { standard, accelerate, decelerate, componentDurations } from '../utils/easing';

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

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    // Press down animation: Scale to 0.98 + show state layer
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: componentDurations.chipTap,
        easing: accelerate,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: componentDurations.chipTap,
        easing: standard,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    // Release animation: Scale back to 1.0 + hide state layer
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: componentDurations.chipTap,
        easing: decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: componentDurations.chipRipple,
        easing: standard,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(suggestion)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1} // We handle opacity via state layer
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
        {/* Material state layer overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.stateLayer,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)',
              opacity: overlayOpacity,
            },
          ]}
        />

        <View style={styles.content}>
          {suggestion.icon && (
            <Text style={styles.icon}>{suggestion.icon}</Text>
          )}
          <Text
            style={[
              styles.text,
              {
                color: colors.text.primary,
                ...typography.body,
              },
            ]}
            numberOfLines={2}
          >
            {suggestion.text}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    width: '100%',
    overflow: 'hidden', // Clip ripple to border radius
  },
  stateLayer: {
    borderRadius: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    fontWeight: '500',
  },
});
