/**
 * Accounts Management Screen
 * Lists all connected email accounts with management options
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAccounts } from '../contexts/AccountsContext';
import { AccountCard } from '../components/AccountCard';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borders, shadows } from '../theme/shadows';

interface AccountsScreenProps {
  onClose: () => void;
  onAddAccount: () => void;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  onClose,
  onAddAccount,
}) => {
  const { colors } = useTheme();
  const {
    accounts,
    toggleAccount,
    setPrimaryAccount,
    refreshAccount,
    removeAccount,
    loading,
  } = useAccounts();

  const handleRemoveAccount = (accountId: string, email: string) => {
    Alert.alert(
      'Remove Account',
      `Are you sure you want to remove ${email}? This will delete all synced data for this account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeAccount(accountId),
        },
      ]
    );
  };

  const handleToggleAccount = async (accountId: string, enabled: boolean) => {
    await toggleAccount(accountId, enabled);
  };

  const handleMakePrimary = async (accountId: string) => {
    await setPrimaryAccount(accountId);
  };

  const handleRefreshAccount = async (accountId: string) => {
    await refreshAccount(accountId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary, ...typography.h2 }]}>
          Email Accounts
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary, ...typography.body }]}>
            Loading accounts...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Accounts List */}
          {accounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 64, marginBottom: spacing.md }}>📬</Text>
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text.primary, ...typography.h3 },
                ]}
              >
                No accounts connected
              </Text>
              <Text
                style={[
                  styles.emptyDescription,
                  { color: colors.text.secondary, ...typography.body },
                ]}
              >
                Add your first email account to start managing your messages
              </Text>
            </View>
          ) : (
            <View style={styles.accountsList}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.secondary, ...typography.caption },
                ]}
              >
                {accounts.length} ACCOUNT{accounts.length !== 1 ? 'S' : ''} CONNECTED
              </Text>

              {accounts.map(account => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onToggle={enabled => handleToggleAccount(account.id, enabled)}
                  onRefresh={() => handleRefreshAccount(account.id)}
                  onMakePrimary={() => handleMakePrimary(account.id)}
                  onRemove={() => handleRemoveAccount(account.id, account.email)}
                />
              ))}
            </View>
          )}

          {/* Add Account Button */}
          {accounts.length < 5 && (
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.primary[500],
                  borderColor: colors.primary[600],
                },
                shadows.large,
              ]}
              onPress={onAddAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={[styles.addButtonText, { ...typography.bodyBold }]}>
                Add Email Account
              </Text>
            </TouchableOpacity>
          )}

          {/* Info */}
          {accounts.length >= 5 && (
            <View style={[styles.limitInfo, { backgroundColor: colors.background.card }]}>
              <Text style={[styles.limitText, { color: colors.text.secondary, ...typography.caption }]}>
                ℹ️ You've reached the maximum of 5 accounts. Remove an account to add a new one.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  accountsList: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.lg,
    borderWidth: 2,
    marginTop: spacing.md,
  },
  addButtonIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    marginRight: spacing.sm,
    fontWeight: '300',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  limitInfo: {
    padding: spacing.md,
    borderRadius: borders.radius.md,
    marginTop: spacing.lg,
  },
  limitText: {
    lineHeight: 20,
  },
});
