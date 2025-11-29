/**
 * useMicroInteractions - Material 3 micro-interaction animations
 * Toast notifications, error shake, success pulse
 */

import { useRef } from 'react';
import { Animated } from 'react-native';
import { standard, emphasized, componentDurations, decelerate } from '../utils/easing';

export const useMicroInteractions = () => {
  // Toast animation
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;

  const showToast = (message: string, duration: number = componentDurations.toastDuration) => {
    // Slide up from bottom + fade in
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: componentDurations.toastShow,
        easing: decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: componentDurations.toastShow,
        easing: decelerate,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Auto-dismiss after duration
      setTimeout(() => {
        hideToast();
      }, duration);
    });
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: componentDurations.toastHide,
        easing: standard,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 50,
        duration: componentDurations.toastHide,
        easing: standard,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Error shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, easing: standard, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, easing: standard, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, easing: standard, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, easing: standard, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, easing: standard, useNativeDriver: true }),
    ]).start();
  };

  // Success pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: componentDurations.successPulse / 2,
        easing: emphasized,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.0,
        duration: componentDurations.successPulse / 2,
        easing: emphasized,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    // Toast
    toastOpacity,
    toastTranslateY,
    showToast,
    hideToast,
    toastAnimatedStyle: {
      opacity: toastOpacity,
      transform: [{ translateY: toastTranslateY }],
    },

    // Shake
    shake,
    shakeAnimatedStyle: {
      transform: [{ translateX: shakeAnim }],
    },

    // Pulse
    pulse,
    pulseAnimatedStyle: {
      transform: [{ scale: pulseAnim }],
    },
  };
};
