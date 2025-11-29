/**
 * Add Account Screen
 * Provider selection with OAuth and IMAP flows
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAccounts } from '../contexts/AccountsContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borders } from '../theme/shadows';
import { ProviderButton } from '../components/ProviderButton';
import { PROVIDER_CONFIGS, EmailProvider } from '../types/account';

interface AddAccountScreenProps {
  onClose: () => void;
  onProviderSelected: (provider: EmailProvider) => void;
}

export const AddAccountScreen: React.FC<AddAccountScreenProps> = ({
  onClose,
  onProviderSelected,
}) => {
  const { colors } = useTheme();
  const { accounts } = useAccounts();
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);

  const handleProviderSelect = (provider: EmailProvider) => {
    // Check if user has reached account limit
    if (accounts.length >= 5) {
      Alert.alert(
        'Account Limit Reached',
        'You can add up to 5 email accounts. Please remove an account to add a new one.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedProvider(provider);
    onProviderSelected(provider);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={{ fontSize: 24 }}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary, ...typography.h2 }]}>
          Add Email Account
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Text
          style={[
            styles.description,
            { color: colors.text.secondary, ...typography.body },
          ]}
        >
          Connect your email accounts to manage all your messages in one place. You can add up to 5 accounts.
        </Text>

        {/* Account Count */}
        <View style={[styles.countBadge, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.countText, { color: colors.text.primary, ...typography.caption }]}>
            {accounts.length} of 5 accounts connected
          </Text>
        </View>

        {/* Provider Buttons */}
        <View style={styles.providersContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text.primary, ...typography.h4 },
            ]}
          >
            Choose your email provider
          </Text>

          <ProviderButton
            provider={PROVIDER_CONFIGS.gmail}
            onPress={() => handleProviderSelect('gmail')}
            disabled={selectedProvider !== null}
          />

          <ProviderButton
            provider={PROVIDER_CONFIGS.outlook}
            onPress={() => handleProviderSelect('outlook')}
            disabled={selectedProvider !== null}
          />

          <ProviderButton
            provider={PROVIDER_CONFIGS.yahoo}
            onPress={() => handleProviderSelect('yahoo')}
            disabled={selectedProvider !== null}
          />

          <ProviderButton
            provider={PROVIDER_CONFIGS.imap}
            onPress={() => handleProviderSelect('imap')}
            disabled={selectedProvider !== null}
          />
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.background.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text.primary, ...typography.bodyBold }]}>
            🔒 Secure Authentication
          </Text>
          <Text style={[styles.infoText, { color: colors.text.secondary, ...typography.caption }]}>
            • Gmail & Outlook: OAuth 2.0 secure authentication{'\n'}
            • Yahoo & IMAP: App-specific passwords (not your main password){'\n'}
            • All credentials encrypted and stored locally{'\n'}
            • You can disconnect accounts anytime
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: spacing.md,
  },
  description: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  countText: {
    fontWeight: '600',
  },
  providersContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: borders.radius.md,
    marginTop: spacing.md,
  },
  infoTitle: {
    marginBottom: spacing.sm,
  },
  infoText: {
    lineHeight: 20,
  },
});
