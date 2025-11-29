/**
 * Authentication Handlers
 * Manages OAuth and IMAP auth flows for different email providers
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borders, shadows } from '../theme/shadows';
import {  EmailProvider, EmailAccount, AccountCredentials, PROVIDER_CONFIGS } from '../types/account';
import * as WebBrowser from 'expo-web-browser';

// For OAuth flows, we'd need expo-auth-session properly configured
// This is a simplified implementation that can be expanded

WebBrowser.maybeCompleteAuthSession();

/**
 * IMAP/SMTP Authentication Form
 * For Yahoo and generic IMAP providers
 */
export const IMAPAuthForm: React.FC<{
  provider: EmailProvider;
  onSuccess: (account: EmailAccount) => void;
  onCancel: () => void;
}> = ({ provider, onSuccess, onCancel }) => {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const providerConfig = PROVIDER_CONFIGS[provider];
  const isYahoo = provider === 'yahoo';

  const handleConnect = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Create account credentials
      const credentials: AccountCredentials = {
        password,
        imapHost: isYahoo ? 'imap.mail.yahoo.com' : providerConfig.defaultImapHost,
        imapPort: isYahoo ? 993 : providerConfig.defaultImapPort,
        smtpHost: isYahoo ? 'smtp.mail.yahoo.com' : providerConfig.defaultSmtpHost,
        smtpPort: isYahoo ? 465 : providerConfig.defaultSmtpPort,
      };

      // Create account object
      const newAccount: EmailAccount = {
        id: `${provider}_${Date.now()}`,
        email,
        provider,
        enabled: true,
        isPrimary: false,
        credentials,
        status: 'disconnected',
      };

      // TODO: Verify IMAP connection with backend
      // For now, just add the account
      onSuccess(newAccount);
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Failed to connect to email server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.formContainer, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.form, { backgroundColor: colors.background.card }, shadows.medium]}>
        <Text style={[styles.formTitle, { color: colors.text.primary, ...typography.h3 }]}>
          Connect {providerConfig.name}
        </Text>

        {isYahoo && (
          <View style={[styles.infoBox, { backgroundColor: `${colors.warning}15` }]}>
            <Text style={[styles.infoText, { color: colors.text.secondary, ...typography.caption }]}>
              ⚠️ Use an <Text style={{ fontWeight: '700' }}>app password</Text>, not your main Yahoo password. Generate one in Yahoo Account Security settings.
            </Text>
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary,
              color: colors.text.primary,
              borderColor: colors.border.light,
              ...typography.body,
            },
          ]}
          placeholder="Email address"
          placeholderTextColor={colors.text.tertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary,
              color: colors.text.primary,
              borderColor: colors.border.light,
              ...typography.body,
            },
          ]}
          placeholder={isYahoo ? "App password" : "Password"}
          placeholderTextColor={colors.text.tertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            styles.connectButton,
            {
              backgroundColor: providerConfig.color,
            },
            shadows.medium,
          ]}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.connectButtonText, { ...typography.bodyBold }]}>
              Connect Account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text.secondary, ...typography.body }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * OAuth Authentication Handler
 * For Gmail and Outlook
 *
 * NOTE: This component doesn't use the hooks directly because
 * hooks can't be called conditionally or outside of React components.
 * Instead, it returns a component that uses the appropriate hook.
 */
export const handleOAuthProvider = async (
  provider: EmailProvider,
  onSuccess: (account: EmailAccount) => void,
  onError?: (error: string) => void
): Promise<void> => {
  const providerConfig = PROVIDER_CONFIGS[provider];

  // Import auth hooks dynamically
  const { useGoogleAuth } = await import('../hooks/useGoogleAuth');
  const { useMicrosoftAuth } = await import('../hooks/useMicrosoftAuth');

  // Show info alert before starting OAuth flow
  Alert.alert(
    `Connect ${providerConfig.name}`,
    `You'll be redirected to ${providerConfig.name} to sign in and grant email access.\n\nRequired permissions:\n• Read emails\n• Send emails\n• Modify emails`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: async () => {
          try {
            let result;

            if (provider === 'gmail') {
              // Use Google OAuth hook
              const { promptAsync } = useGoogleAuth();
              result = await promptAsync();
            } else if (provider === 'outlook') {
              // Use Microsoft OAuth hook
              const { promptAsync } = useMicrosoftAuth();
              result = await promptAsync();
            } else {
              throw new Error(`OAuth not supported for provider: ${provider}`);
            }

            if (result) {
              // Create account object
              const newAccount: EmailAccount = {
                id: `${provider}_${Date.now()}`,
                email: result.email,
                provider,
                enabled: true,
                isPrimary: false,
                credentials: {
                  accessToken: result.accessToken,
                  refreshToken: result.refreshToken,
                  expiresAt: result.expiresAt,
                },
                status: 'connected',
                lastSync: new Date().toISOString(),
              };

              onSuccess(newAccount);
            }
          } catch (error: any) {
            const errorMessage = error.message || 'Authentication failed';
            Alert.alert('Authentication Error', errorMessage);
            onError?.(errorMessage);
          }
        },
      },
    ]
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  form: {
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
  },
  formTitle: {
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: borders.radius.md,
    marginBottom: spacing.md,
  },
  infoText: {
    lineHeight: 20,
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borders.radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  connectButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  connectButtonText: {
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {},
});
