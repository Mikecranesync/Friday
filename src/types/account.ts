/**
 * Email Account Types
 * Supports Gmail, Outlook, Yahoo/IMAP providers
 */

export type EmailProvider = 'gmail' | 'outlook' | 'yahoo' | 'imap';

export interface EmailAccount {
  id: string;
  email: string;
  provider: EmailProvider;
  displayName?: string;
  enabled: boolean;
  isPrimary: boolean;
  credentials?: AccountCredentials;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  errorMessage?: string;
}

export interface AccountCredentials {
  // OAuth tokens for Gmail/Outlook
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;

  // IMAP/SMTP for Yahoo and other providers
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  password?: string; // App-specific password for IMAP
}

export interface ProviderConfig {
  id: EmailProvider;
  name: string;
  icon: string; // emoji or icon name
  color: string;
  description: string;
  requiresOAuth: boolean;
  // OAuth configuration
  clientId?: string;
  redirectUri?: string;
  scopes?: string[];
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  // IMAP configuration
  defaultImapHost?: string;
  defaultImapPort?: number;
  defaultSmtpHost?: string;
  defaultSmtpPort?: number;
}

// Provider configurations following industry standards
export const PROVIDER_CONFIGS: Record<EmailProvider, ProviderConfig> = {
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    color: '#EA4335',
    description: 'Connect your Google account',
    requiresOAuth: true,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
    // OAuth credentials should be loaded from environment or secure storage
  },
  outlook: {
    id: 'outlook',
    name: 'Outlook',
    icon: '📬',
    color: '#0078D4',
    description: 'Connect your Microsoft account',
    requiresOAuth: true,
    scopes: ['Mail.ReadWrite', 'Mail.Send', 'offline_access'],
    // OAuth credentials should be loaded from environment or secure storage
  },
  yahoo: {
    id: 'yahoo',
    name: 'Yahoo Mail',
    icon: '📮',
    color: '#6001D2',
    description: 'Connect using app password',
    requiresOAuth: false,
    defaultImapHost: 'imap.mail.yahoo.com',
    defaultImapPort: 993,
    defaultSmtpHost: 'smtp.mail.yahoo.com',
    defaultSmtpPort: 465,
  },
  imap: {
    id: 'imap',
    name: 'Other (IMAP)',
    icon: '✉️',
    color: '#6B7280',
    description: 'Connect any email via IMAP/SMTP',
    requiresOAuth: false,
  },
};
