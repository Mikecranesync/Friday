/**
 * ThemeToggle Component
 *
 * Material 3-style theme toggle button with sun/moon icons
 * Supports light, dark, and auto (system) modes
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  /** Optional style for the container */
  style?: any;
  /** Show label text */
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style, showLabel = false }) => {
  const { mode, setMode, colors, isDark } = useTheme();

  const cycleTheme = async () => {
    // Cycle: light → dark → auto → light
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' :
      mode === 'dark' ? 'auto' :
      'light';

    await setMode(nextMode);
  };

  const getIcon = (): string => {
    if (mode === 'light') return '☀️';
    if (mode === 'dark') return '🌙';
    return '🔄'; // auto mode
  };

  const getLabel = (): string => {
    if (mode === 'light') return 'Light';
    if (mode === 'dark') return 'Dark';
    return 'Auto';
  };

  return (
    <TouchableOpacity
      onPress={cycleTheme}
      style={[styles.container, { backgroundColor: colors.background.secondary }, style]}
      accessibilityRole="button"
      accessibilityLabel={`Theme mode: ${getLabel()}. Tap to switch theme.`}
      accessibilityHint="Cycles between light, dark, and automatic theme modes"
    >
      <Text style={styles.icon}>{getIcon()}</Text>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          {getLabel()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 48,
    minHeight: 48, // WCAG 2.1 AA minimum touch target size
    // Keyboard focus indicator will show native platform focus
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
