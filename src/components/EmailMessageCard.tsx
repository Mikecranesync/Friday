/**
 * EmailMessageCard - Gemini-style email preview cards within chat bubbles
 * Displays email metadata and action chips
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { Email } from '../types/email';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface EmailMessageCardProps {
  email: Email;
  onArchive?: (emailId: string) => void;
  onStar?: (emailId: string) => void;
  onReply?: (emailId: string) => void;
  onPress?: (emailId: string) => void;
}

export const EmailMessageCard: React.FC<EmailMessageCardProps> = ({
  email,
  onArchive,
  onStar,
  onReply,
  onPress,
}) => {
  const { colors } = useTheme();

  const getPriorityIndicator = () => {
    if (email.priority === 'urgent') return '🔴';
    if (email.tier === 3) return '⭐';
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface.containerLighter }]}
      onPress={() => onPress?.(email.id)}
      activeOpacity={0.7}
    >
      {/* Email Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {getPriorityIndicator() && (
            <Text style={styles.priorityIcon}>{getPriorityIndicator()}</Text>
          )}
          <Text
            style={[styles.subject, { color: colors.text.primary, ...typography.bodyLarge }]}
            numberOfLines={2}
          >
            {email.subject}
          </Text>
        </View>
      </View>

      {/* Sender */}
      <Text style={[styles.sender, { color: colors.text.secondary, ...typography.bodyMedium }]}>
        From: {email.from}
      </Text>

      {/* Preview Snippet */}
      {email.body && (
        <Text
          style={[styles.snippet, { color: colors.text.secondary, ...typography.bodyMedium }]}
          numberOfLines={2}
        >
          {truncateText(email.body, 120)}
        </Text>
      )}

      {/* Metadata Row */}
      <View style={styles.metadataRow}>
        <Text style={[styles.timestamp, { color: colors.text.tertiary, ...typography.caption }]}>
          {formatDate(email.receivedAt)}
        </Text>
        {email.hasAttachments && (
          <Text style={styles.attachment}>📎</Text>
        )}
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(email.tier, colors) }]}>
          <Text style={[styles.tierText, { color: colors.surface.primary }]}>
            Tier {email.tier}
          </Text>
        </View>
      </View>

      {/* Action Chips */}
      <View style={styles.actionsRow}>
        {onArchive && (
          <TouchableOpacity
            style={[styles.actionChip, { borderColor: colors.border.medium }]}
            onPress={(e) => {
              e.stopPropagation();
              onArchive(email.id);
            }}
          >
            <Text style={[styles.actionText, { color: colors.text.secondary }]}>Archive</Text>
          </TouchableOpacity>
        )}

        {onStar && (
          <TouchableOpacity
            style={[styles.actionChip, { borderColor: colors.border.medium }]}
            onPress={(e) => {
              e.stopPropagation();
              onStar(email.id);
            }}
          >
            <Text style={[styles.actionText, { color: colors.text.secondary }]}>⭐ Star</Text>
          </TouchableOpacity>
        )}

        {onReply && (
          <TouchableOpacity
            style={[styles.actionChipFilled, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
              onReply(email.id);
            }}
          >
            <Text style={[styles.actionTextFilled, { color: colors.surface.primary }]}>Reply</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper function for tier badge color
const getTierColor = (tier: number, colors: any): string => {
  switch (tier) {
    case 3:
      return '#EF4444'; // Red for urgent
    case 2:
      return '#F59E0B'; // Orange for important
    case 1:
      return '#6B7280'; // Gray for low priority
    default:
      return colors.text.tertiary;
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    flex: 1,
  },
  priorityIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  subject: {
    fontWeight: '500',
    flex: 1,
  },
  sender: {
    marginTop: -spacing.xs,
  },
  snippet: {
    lineHeight: 20,
    opacity: 0.8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  timestamp: {
    flex: 1,
  },
  attachment: {
    fontSize: 14,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  actionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionChipFilled: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionTextFilled: {
    fontSize: 14,
    fontWeight: '600',
  },
});
