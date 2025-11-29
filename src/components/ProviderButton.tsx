/**
 * Provider Button Component
 * Industry-standard email provider buttons (Gmail, Outlook, Yahoo, IMAP)
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borders, shadows } from '../theme/shadows';
import { ProviderConfig } from '../types/account';

interface ProviderButtonProps {
  provider: ProviderConfig;
  onPress: () => void;
  disabled?: boolean;
}

export const ProviderButton: React.FC<ProviderButtonProps> = ({
  provider,
  onPress,
  disabled = false,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.background.card,
          borderColor: provider.color,
          opacity: disabled ? 0.5 : 1,
        },
        shadows.medium,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${provider.color}20` },
        ]}
      >
        <Text style={styles.icon}>{provider.icon}</Text>
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.name,
            { color: colors.text.primary, ...typography.bodyBold },
          ]}
        >
          {provider.name}
        </Text>
        <Text
          style={[
            styles.description,
            { color: colors.text.secondary, ...typography.caption },
          ]}
        >
          {provider.description}
        </Text>
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borders.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    marginBottom: 2,
  },
  description: {},
  arrow: {
    fontSize: 24,
    color: '#A0A0A0',
    marginLeft: spacing.sm,
  },
});
