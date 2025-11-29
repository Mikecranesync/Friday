/**
 * Account Card Component
 * Displays email account with provider branding and status
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borders, shadows } from '../theme/shadows';
import { EmailAccount, PROVIDER_CONFIGS } from '../types/account';

interface AccountCardProps {
  account: EmailAccount;
  onToggle: (enabled: boolean) => void;
  onRefresh: () => void;
  onMakePrimary: () => void;
  onRemove: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onToggle,
  onRefresh,
  onMakePrimary,
  onRemove,
}) => {
  const { colors, isDark } = useTheme();
  const providerConfig = PROVIDER_CONFIGS[account.provider];

  const getStatusColor = () => {
    switch (account.status) {
      case 'connected':
        return colors.success;
      case 'syncing':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.text.tertiary;
    }
  };

  const getStatusText = () => {
    switch (account.status) {
      case 'connected':
        return account.lastSync ? `Synced ${getRelativeTime(account.lastSync)}` : 'Connected';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return account.errorMessage || 'Connection error';
      default:
        return 'Not connected';
    }
  };

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: account.isPrimary ? providerConfig.color : colors.border.light,
          borderWidth: account.isPrimary ? 2 : 1,
        },
        shadows.medium,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Provider Icon */}
          <View
            style={[
              styles.providerIcon,
              { backgroundColor: `${providerConfig.color}20` },
            ]}
          >
            <Text style={styles.providerEmoji}>{providerConfig.icon}</Text>
          </View>

          {/* Account Info */}
          <View style={styles.accountInfo}>
            <View style={styles.emailRow}>
              <Text
                style={[
                  styles.email,
                  { color: colors.text.primary, ...typography.bodyBold },
                ]}
                numberOfLines={1}
              >
                {account.email}
              </Text>
              {account.isPrimary && (
                <View
                  style={[
                    styles.primaryBadge,
                    { backgroundColor: providerConfig.color },
                  ]}
                >
                  <Text style={styles.primaryText}>PRIMARY</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.provider,
                { color: colors.text.secondary, ...typography.caption },
              ]}
            >
              {providerConfig.name}
            </Text>
          </View>
        </View>

        {/* Enable/Disable Switch */}
        <Switch
          value={account.enabled}
          onValueChange={onToggle}
          trackColor={{
            false: colors.border.light,
            true: providerConfig.color,
          }}
          thumbColor={account.enabled ? '#FFFFFF' : colors.text.tertiary}
        />
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.statusLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor() },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: colors.text.secondary, ...typography.caption },
            ]}
          >
            {getStatusText()}
          </Text>
          {account.status === 'syncing' && (
            <ActivityIndicator
              size="small"
              color={colors.warning}
              style={styles.statusSpinner}
            />
          )}
        </View>

        {/* Actions */}
        {account.enabled && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={account.status === 'syncing'}
          >
            <Text style={{ fontSize: 16 }}>🔄</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      {account.enabled && !account.isPrimary && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? colors.background.tertiary
                  : colors.background.secondary,
                borderColor: colors.border.light,
              },
            ]}
            onPress={onMakePrimary}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: colors.text.primary, ...typography.label },
              ]}
            >
              Make Primary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.removeButton,
              {
                backgroundColor: `${colors.error}15`,
                borderColor: colors.error,
              },
            ]}
            onPress={onRemove}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: colors.error, ...typography.label },
              ]}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borders.radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: borders.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  providerEmoji: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  email: {
    flexShrink: 1,
  },
  primaryBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borders.radius.sm,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  provider: {},
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borders.radius.full,
  },
  statusText: {},
  statusSpinner: {
    marginLeft: spacing.xs,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borders.radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  removeButton: {},
  actionButtonText: {
    fontWeight: '600',
  },
});
