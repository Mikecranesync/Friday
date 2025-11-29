/**
 * useMessageAnimation - Material 3 entrance animation for chat messages
 * Handles fade in + translateY + scale animation
 */

import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { decelerate, componentDurations } from '../utils/easing';

export const useMessageAnimation = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: componentDurations.messageSend,
        easing: decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: componentDurations.messageSend,
        easing: decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.0,
        duration: componentDurations.messageSend,
        easing: decelerate,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale]);

  return {
    animatedStyle: {
      opacity,
      transform: [{ translateY }, { scale }],
    },
  };
};
