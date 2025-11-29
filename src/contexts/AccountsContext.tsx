/**
 * Accounts Context
 * Manages multiple email accounts with secure credential storage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { EmailAccount, EmailProvider } from '../types/account';

interface AccountsContextType {
  accounts: EmailAccount[];
  addAccount: (account: EmailAccount) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  updateAccount: (accountId: string, updates: Partial<EmailAccount>) => Promise<void>;
  toggleAccount: (accountId: string, enabled: boolean) => Promise<void>;
  setPrimaryAccount: (accountId: string) => Promise<void>;
  refreshAccount: (accountId: string) => Promise<void>;
  loading: boolean;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

const ACCOUNTS_STORAGE_KEY = 'jarvis_email_accounts';
const CREDENTIALS_STORAGE_PREFIX = 'jarvis_credentials_';

export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const stored = await SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const loadedAccounts: EmailAccount[] = JSON.parse(stored);

        // Load credentials separately for each account
        const accountsWithCredentials = await Promise.all(
          loadedAccounts.map(async (account) => {
            const credentialsJson = await SecureStore.getItemAsync(
              `${CREDENTIALS_STORAGE_PREFIX}${account.id}`
            );
            return {
              ...account,
              credentials: credentialsJson ? JSON.parse(credentialsJson) : undefined,
            };
          })
        );

        setAccounts(accountsWithCredentials);
        console.log(`📦 Loaded ${accountsWithCredentials.length} email accounts`);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAccounts = async (updatedAccounts: EmailAccount[]) => {
    try {
      // Save account metadata (without credentials)
      const accountsMetadata = updatedAccounts.map(({ credentials, ...account }) => account);
      await SecureStore.setItemAsync(ACCOUNTS_STORAGE_KEY, JSON.stringify(accountsMetadata));

      // Save credentials separately
      for (const account of updatedAccounts) {
        if (account.credentials) {
          await SecureStore.setItemAsync(
            `${CREDENTIALS_STORAGE_PREFIX}${account.id}`,
            JSON.stringify(account.credentials)
          );
        }
      }

      setAccounts(updatedAccounts);
    } catch (error) {
      console.error('Failed to save accounts:', error);
      throw error;
    }
  };

  const addAccount = async (account: EmailAccount) => {
    const newAccounts = [...accounts, account];
    await saveAccounts(newAccounts);
    console.log(`✅ Added account: ${account.email} (${account.provider})`);
  };

  const removeAccount = async (accountId: string) => {
    const newAccounts = accounts.filter(a => a.id !== accountId);
    await saveAccounts(newAccounts);

    // Delete credentials
    await SecureStore.deleteItemAsync(`${CREDENTIALS_STORAGE_PREFIX}${accountId}`);
    console.log(`🗑️ Removed account: ${accountId}`);
  };

  const updateAccount = async (accountId: string, updates: Partial<EmailAccount>) => {
    const newAccounts = accounts.map(a =>
      a.id === accountId ? { ...a, ...updates } : a
    );
    await saveAccounts(newAccounts);
  };

  const toggleAccount = async (accountId: string, enabled: boolean) => {
    await updateAccount(accountId, { enabled });
    console.log(`${enabled ? '✅' : '❌'} Account ${accountId}: ${enabled ? 'enabled' : 'disabled'}`);
  };

  const setPrimaryAccount = async (accountId: string) => {
    const newAccounts = accounts.map(a => ({
      ...a,
      isPrimary: a.id === accountId,
    }));
    await saveAccounts(newAccounts);
    console.log(`⭐ Set primary account: ${accountId}`);
  };

  const refreshAccount = async (accountId: string) => {
    // Update sync status
    await updateAccount(accountId, {
      status: 'syncing',
      errorMessage: undefined,
    });

    // TODO: Call backend API to sync this account
    // For now, just update the lastSync timestamp
    setTimeout(async () => {
      await updateAccount(accountId, {
        status: 'connected',
        lastSync: new Date().toISOString(),
      });
    }, 2000);
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        addAccount,
        removeAccount,
        updateAccount,
        toggleAccount,
        setPrimaryAccount,
        refreshAccount,
        loading,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within AccountsProvider');
  }
  return context;
};
