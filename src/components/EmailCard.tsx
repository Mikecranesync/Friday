import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows, borders } from '../theme/shadows';

export interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  tier: 1 | 2 | 3;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  unread: boolean;
  received_at: string;
}

interface EmailCardProps {
  email: Email;
  onPress?: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, onPress }) => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Fade-in animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Tier badge colors
  const getTierColor = () => {
    switch (email.tier) {
      case 3:
        return { bg: colors.error, text: '#FFFFFF' };
      case 2:
        return { bg: colors.warning, text: '#FFFFFF' };
      case 1:
      default:
        return { bg: isDark ? colors.background.tertiary : colors.background.secondary, text: colors.text.secondary };
    }
  };

  const tierColors = getTierColor();

  // Priority indicator
  const getPriorityDot = () => {
    if (email.priority === 'urgent') return colors.error;
    if (email.priority === 'high') return colors.warning;
    if (email.priority === 'medium') return colors.secondary[500];
    return colors.text.tertiary;
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
            ...shadows.small,
          },
        ]}
      >
        {/* Header: Sender + Tier Badge */}
        <View style={styles.header}>
          <View style={styles.senderRow}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityDot() }]} />
            <Text
              style={[
                styles.sender,
                {
                  color: colors.primary[500],
                  ...typography.label,
                },
              ]}
              numberOfLines={1}
            >
              {email.from}
            </Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: tierColors.bg }]}>
            <Text style={[styles.tierText, { color: tierColors.text }]}>
              T{email.tier}
            </Text>
          </View>
        </View>

        {/* Subject */}
        <Text
          style={[
            styles.subject,
            {
              color: colors.text.primary,
              ...typography.body,
            },
          ]}
          numberOfLines={2}
        >
          {email.subject}
        </Text>

        {/* Snippet */}
        <Text
          style={[
            styles.snippet,
            {
              color: colors.text.secondary,
              ...typography.bodySmall,
            },
          ]}
          numberOfLines={2}
        >
          {email.snippet}
        </Text>

        {/* Footer: Category + Timestamp */}
        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary }]}>
            <Text style={[styles.categoryText, { color: colors.text.tertiary }]}>
              {email.category}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.text.tertiary }]}>
            {email.received_at}
          </Text>
        </View>

        {/* Unread indicator */}
        {email.unread && (
          <View style={[styles.unreadIndicator, { backgroundColor: colors.primary[500] }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borders.radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: borders.radius.full,
    marginRight: spacing.sm,
  },
  sender: {
    fontWeight: '600',
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borders.radius.sm,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subject: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  snippet: {
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borders.radius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: borders.radius.full,
  },
});
