/**
 * Spacing System
 * Following 8pt grid system for consistency
 */

export const spacing = {
  xs: 4,   // Minimal spacing
  sm: 8,   // Small components
  md: 16,  // Standard spacing
  lg: 24,  // Section spacing
  xl: 32,  // Major sections
  xxl: 48, // Large gaps
  xxxl: 64, // Screen margins
};

// Component-specific spacing
export const componentSpacing = {
  // Message Bubbles
  messageBubble: {
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 15,
    marginVertical: 8,
    maxWidth: 320, // 90% of typical phone width
  },

  // Cards
  card: {
    padding: 16,
    margin: 12,
    gap: 12,
  },

  // Search Bar
  searchBar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  // Screen Padding
  screen: {
    horizontal: 16,
    vertical: 16,
  },
};

export type Spacing = typeof spacing;
export type ComponentSpacing = typeof componentSpacing;
