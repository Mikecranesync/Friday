/**
 * TypingIndicator - Animated dots showing AI is thinking
 * Gemini-style loading animation with precise Material 3 timing
 * Staggered dots: 0ms, 150ms, 300ms delays
 * Per-dot: Opacity 0.3 → 1.0 → 0.3, TranslateY 0 → -4dp → 0 (400ms)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme/spacing';
import { standard, decelerate, componentDurations } from '../utils/easing';

export const TypingIndicator: React.FC = () => {
  const { colors, isDark } = useTheme();

  // Animation values for container entrance
  const containerOpacity = useRef(new Animated.Value(0)).current;

  // Animation values for each dot
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Container fade in on mount
  useEffect(() => {
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: componentDurations.messageSend,
      easing: decelerate,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup: fade out when unmounting
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 100, // Quick fade out
        easing: standard,
        useNativeDriver: true,
      }).start();
    };
  }, []);

  // Dot bounce animations (staggered)
  useEffect(() => {
    const createAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400, // Material 3 spec: 400ms per cycle
            easing: standard,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: standard,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Material 3 spec: 150ms stagger between dots
    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, componentDurations.typingDotStagger);
    const anim3 = createAnimation(dot3, componentDurations.typingDotStagger * 2);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  // Material 3 spec: Opacity 0.3 → 1.0, TranslateY 0 → -4dp
  const dotStyle = (animValue: Animated.Value) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.0],
    }),
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background.card : '#FFFFFF',
          borderColor: colors.border.light,
          opacity: containerOpacity,
        },
      ]}
    >
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.text.tertiary },
            dotStyle(dot1),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.text.tertiary },
            dotStyle(dot2),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.text.tertiary },
            dotStyle(dot3),
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 20,
  },
  dot: {
    width: 8,  // Material 3 spec: 8dp
    height: 8,
    borderRadius: 4,
  },
});
