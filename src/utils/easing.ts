/**
 * Material Design 3 Easing Curves
 * Based on Material Motion specifications
 * https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 */

import { Easing } from 'react-native';

/**
 * Standard Easing (Most Common)
 * Cubic Bezier: (0.4, 0.0, 0.2, 1.0)
 * Use for: Element growing/shrinking, property changes, most transitions
 */
export const standard = Easing.bezier(0.4, 0.0, 0.2, 1.0);

/**
 * Emphasized Easing (Dramatic)
 * Cubic Bezier: (0.2, 0.0, 0, 1.0)
 * Use for: Hero transitions, important state changes, attention-grabbing animations
 */
export const emphasized = Easing.bezier(0.2, 0.0, 0, 1.0);

/**
 * Decelerate (Ease Out)
 * Cubic Bezier: (0.0, 0.0, 0.2, 1.0)
 * Use for: Elements entering screen, incoming animations, speedy entrance from full velocity
 */
export const decelerate = Easing.bezier(0.0, 0.0, 0.2, 1.0);

/**
 * Accelerate (Ease In)
 * Cubic Bezier: (0.4, 0.0, 1.0, 1.0)
 * Use for: Elements leaving screen, exit animations, speed off-screen without deceleration
 */
export const accelerate = Easing.bezier(0.4, 0.0, 1.0, 1.0);

/**
 * Sharp Easing
 * Cubic Bezier: (0.4, 0.0, 0.6, 1.0)
 * Use for: Temporary exits (may return), quick transitions
 */
export const sharp = Easing.bezier(0.4, 0.0, 0.6, 1.0);

/**
 * Material Design 3 Animation Durations (milliseconds)
 */
export const durations = {
  instant: 0,        // No animation
  quick: 100,        // Micro-interactions (button press, chip tap)
  normal: 150,       // Standard transitions (message send, fade in/out)
  moderate: 225,     // Independent element transitions
  emphasized: 300,   // Elements moving other elements (scroll, keyboard)
  slow: 400,         // Complex transitions (page transitions)
  slower: 500,       // Dramatic/important changes (theme transition)
} as const;

/**
 * Component-Specific Durations
 */
export const componentDurations = {
  fabPress: 100,           // FAB press feedback
  fabPulse: 1000,          // FAB recording pulse cycle
  messageSend: 150,        // Message bubble appearance
  messageExit: 150,        // Message bubble removal
  typingIndicator: 1000,   // Full typing dot cycle
  typingDotStagger: 150,   // Delay between typing dots
  chipTap: 100,            // Chip press feedback
  chipRipple: 225,         // Material ripple duration
  pageTransition: 300,     // Screen transitions
  scrollToBottom: 300,     // Auto-scroll animation
  keyboardShow: 250,       // Keyboard appearance
  keyboardHide: 250,       // Keyboard dismissal
  toastShow: 200,          // Toast/snackbar appearance
  toastDuration: 2000,     // Toast display time
  toastHide: 150,          // Toast dismissal
  errorShake: 300,         // Error shake animation
  successPulse: 200,       // Success feedback pulse
  themeTransition: 200,    // Color theme transition
} as const;

export type EasingFunction = typeof standard;
export type Duration = keyof typeof durations;
export type ComponentDuration = keyof typeof componentDurations;
