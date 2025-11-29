/**
 * useScrollAnimation - Smooth scroll animations for chat
 * Handles auto-scroll to bottom with Material 3 easing
 */

import { useRef } from 'react';
import { ScrollView } from 'react-native';
import { componentDurations } from '../utils/easing';

export const useScrollAnimation = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = (animated: boolean = true) => {
    if (!scrollViewRef.current) return;

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated,
        // Duration handled by native scrollView (typically ~300ms with decelerate easing)
      });
    }, 100); // Small delay to ensure content is rendered
  };

  const scrollToTop = (animated: boolean = true) => {
    if (!scrollViewRef.current) return;

    scrollViewRef.current.scrollTo({
      y: 0,
      animated,
      // Duration: ~400ms with emphasized easing
    });
  };

  return {
    scrollViewRef,
    scrollToBottom,
    scrollToTop,
  };
};
