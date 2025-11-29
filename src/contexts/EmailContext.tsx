/**
 * Email Context
 * Global state management for emails with caching and real-time updates
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Email, Draft, Stats } from '../types/email';
import { emailApi } from '../services/emailApi';

interface EmailContextType {
  // Email data
  emails: Email[];
  urgentEmails: Email[];
  unreadEmails: Email[];
  unreadCount: number;
  stats: Stats | null;

  // Drafts
  drafts: Draft[];

  // Loading states
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Actions
  fetchEmails: (tierFilter?: number) => Promise<void>;
  fetchUrgentEmails: () => Promise<void>;
  fetchUnreadEmails: () => Promise<void>;
  fetchDrafts: () => Promise<void>;
  searchEmails: (query: string) => Promise<Email[]>;
  refreshAll: () => Promise<void>;

  // Email actions
  markAsRead: (emailId: string) => Promise<void>;
  archiveEmail: (emailId: string) => Promise<void>;
  markAsSpam: (emailId: string) => Promise<void>;
  markAsImportant: (emailId: string) => Promise<void>;
  markAsVIP: (emailId: string) => Promise<void>;

  // Draft actions
  generateDraft: (emailId: string) => Promise<Draft | null>;
  updateDraft: (draftId: string, content: string) => Promise<void>;
  approveDraft: (draftId: string) => Promise<void>;
  rejectDraft: (draftId: string) => Promise<void>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

const CACHE_KEYS = {
  EMAILS: 'jarvis_cached_emails',
  URGENT: 'jarvis_cached_urgent',
  UNREAD: 'jarvis_cached_unread',
  DRAFTS: 'jarvis_cached_drafts',
  STATS: 'jarvis_cached_stats',
  LAST_SYNC: 'jarvis_last_sync',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const EmailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [urgentEmails, setUrgentEmails] = useState<Email[]>([]);
  const [unreadEmails, setUnreadEmails] = useState<Email[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
    initializeData();
  }, []);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadCachedData = async () => {
    try {
      const [cachedEmails, cachedUrgent, cachedUnread, cachedDrafts, cachedStats] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.EMAILS),
        AsyncStorage.getItem(CACHE_KEYS.URGENT),
        AsyncStorage.getItem(CACHE_KEYS.UNREAD),
        AsyncStorage.getItem(CACHE_KEYS.DRAFTS),
        AsyncStorage.getItem(CACHE_KEYS.STATS),
      ]);

      if (cachedEmails) setEmails(JSON.parse(cachedEmails));
      if (cachedUrgent) setUrgentEmails(JSON.parse(cachedUrgent));
      if (cachedUnread) setUnreadEmails(JSON.parse(cachedUnread));
      if (cachedDrafts) setDrafts(JSON.parse(cachedDrafts));
      if (cachedStats) setStats(JSON.parse(cachedStats));

      console.log('📦 Loaded cached email data');
    } catch (error: any) {
      console.error('Failed to load cached data:', error);
    }
  };

  const cacheData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const shouldRefresh = async (): Promise<boolean> => {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      if (!lastSync) return true;

      const timeSinceSync = Date.now() - parseInt(lastSync);
      return timeSinceSync > CACHE_DURATION;
    } catch {
      return true;
    }
  };

  const updateLastSync = async () => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Failed to update last sync:', error);
    }
  };

  const initializeData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check API health first
      const isHealthy = await emailApi.checkHealth();
      if (!isHealthy) {
        throw new Error('Backend API is not available');
      }

      // Fetch all data in parallel
      await Promise.all([
        fetchEmails(),
        fetchUrgentEmails(),
        fetchUnreadEmails(),
        fetchDrafts(),
        fetchStats(),
      ]);

      await updateLastSync();
    } catch (err: any) {
      console.error('❌ Failed to initialize email data:', err.message);
      setError(err.message || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = useCallback(async (tierFilter?: number) => {
    try {
      const fetchedEmails = await emailApi.getEmails(tierFilter);
      setEmails(fetchedEmails);
      await cacheData(CACHE_KEYS.EMAILS, fetchedEmails);
      console.log(`✅ Fetched ${fetchedEmails.length} emails`);
    } catch (err: any) {
      console.error('Failed to fetch emails:', err.message);
      throw err;
    }
  }, []);

  const fetchUrgentEmails = useCallback(async () => {
    try {
      const fetchedUrgent = await emailApi.getUrgentEmails();
      setUrgentEmails(fetchedUrgent);
      await cacheData(CACHE_KEYS.URGENT, fetchedUrgent);
      console.log(`🚨 Fetched ${fetchedUrgent.length} urgent emails`);
    } catch (err: any) {
      console.error('Failed to fetch urgent emails:', err.message);
      throw err;
    }
  }, []);

  const fetchUnreadEmails = useCallback(async () => {
    try {
      const fetchedUnread = await emailApi.getUnreadEmails();
      const count = await emailApi.getUnreadCount();
      setUnreadEmails(fetchedUnread);
      setUnreadCount(count);
      await cacheData(CACHE_KEYS.UNREAD, fetchedUnread);
      console.log(`📬 Fetched ${fetchedUnread.length} unread emails (total: ${count})`);
    } catch (err: any) {
      console.error('Failed to fetch unread emails:', err.message);
      throw err;
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      const fetchedDrafts = await emailApi.getDrafts();
      setDrafts(fetchedDrafts);
      await cacheData(CACHE_KEYS.DRAFTS, fetchedDrafts);
      console.log(`📝 Fetched ${fetchedDrafts.length} drafts`);
    } catch (err: any) {
      console.error('Failed to fetch drafts:', err.message);
      throw err;
    }
  }, []);

  const fetchStats = async () => {
    try {
      const fetchedStats = await emailApi.getStats();
      setStats(fetchedStats);
      await cacheData(CACHE_KEYS.STATS, fetchedStats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err.message);
    }
  };

  const searchEmails = async (query: string): Promise<Email[]> => {
    try {
      return await emailApi.searchEmails(query);
    } catch (err: any) {
      console.error('Failed to search emails:', err.message);
      return [];
    }
  };

  const refreshAll = async () => {
    if (refreshing) return;

    setRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        fetchEmails(),
        fetchUrgentEmails(),
        fetchUnreadEmails(),
        fetchDrafts(),
        fetchStats(),
      ]);

      await updateLastSync();
      console.log('🔄 Refreshed all email data');
    } catch (err: any) {
      console.error('Failed to refresh:', err.message);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Email actions with optimistic updates
  const markAsRead = async (emailId: string) => {
    // Optimistic update
    setEmails((prev) =>
      prev.map((email) => (email.id === emailId ? { ...email, status: 'read' as const } : email))
    );
    setUnreadEmails((prev) => prev.filter((email) => email.id !== emailId));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await emailApi.markAsRead(emailId);
      console.log(`✅ Marked email ${emailId} as read`);
    } catch (err: any) {
      console.error('Failed to mark as read:', err.message);
      // Revert optimistic update on failure
      await fetchEmails();
      await fetchUnreadEmails();
      throw err;
    }
  };

  const archiveEmail = async (emailId: string) => {
    // Optimistic update
    setEmails((prev) =>
      prev.map((email) => (email.id === emailId ? { ...email, status: 'archived' as const } : email))
    );
    setUnreadEmails((prev) => prev.filter((email) => email.id !== emailId));

    try {
      await emailApi.archiveEmail(emailId);
      console.log(`📦 Archived email ${emailId}`);
    } catch (err: any) {
      console.error('Failed to archive:', err.message);
      await fetchEmails();
      throw err;
    }
  };

  const markAsSpam = async (emailId: string) => {
    try {
      await emailApi.markAsSpam(emailId);
      console.log(`🚫 Marked email ${emailId} as spam`);
      await refreshAll();
    } catch (err: any) {
      console.error('Failed to mark as spam:', err.message);
      throw err;
    }
  };

  const markAsImportant = async (emailId: string) => {
    try {
      await emailApi.markAsImportant(emailId);
      console.log(`⭐ Marked email ${emailId} as important`);
      await refreshAll();
    } catch (err: any) {
      console.error('Failed to mark as important:', err.message);
      throw err;
    }
  };

  const markAsVIP = async (emailId: string) => {
    try {
      await emailApi.markAsVIP(emailId);
      console.log(`👑 Marked sender as VIP`);
      await refreshAll();
    } catch (err: any) {
      console.error('Failed to mark as VIP:', err.message);
      throw err;
    }
  };

  // Draft actions
  const generateDraft = async (emailId: string): Promise<Draft | null> => {
    try {
      const draft = await emailApi.generateDraft(emailId);
      if (draft) {
        setDrafts((prev) => [draft, ...prev]);
        await cacheData(CACHE_KEYS.DRAFTS, [draft, ...drafts]);
        console.log(`✨ Generated draft for email ${emailId}`);
      }
      return draft;
    } catch (err: any) {
      console.error('Failed to generate draft:', err.message);
      throw err;
    }
  };

  const updateDraft = async (draftId: string, content: string) => {
    // Optimistic update
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === draftId ? { ...draft, content } : draft))
    );

    try {
      await emailApi.updateDraft(draftId, content);
      console.log(`📝 Updated draft ${draftId}`);
    } catch (err: any) {
      console.error('Failed to update draft:', err.message);
      await fetchDrafts();
      throw err;
    }
  };

  const approveDraft = async (draftId: string) => {
    try {
      await emailApi.approveDraft(draftId);
      console.log(`✅ Approved and sent draft ${draftId}`);
      await Promise.all([fetchDrafts(), fetchEmails()]);
    } catch (err: any) {
      console.error('Failed to approve draft:', err.message);
      throw err;
    }
  };

  const rejectDraft = async (draftId: string) => {
    // Optimistic update
    setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));

    try {
      await emailApi.rejectDraft(draftId);
      console.log(`🗑️ Rejected draft ${draftId}`);
    } catch (err: any) {
      console.error('Failed to reject draft:', err.message);
      await fetchDrafts();
      throw err;
    }
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        urgentEmails,
        unreadEmails,
        unreadCount,
        stats,
        drafts,
        loading,
        refreshing,
        error,
        fetchEmails,
        fetchUrgentEmails,
        fetchUnreadEmails,
        fetchDrafts,
        searchEmails,
        refreshAll,
        markAsRead,
        archiveEmail,
        markAsSpam,
        markAsImportant,
        markAsVIP,
        generateDraft,
        updateDraft,
        approveDraft,
        rejectDraft,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within EmailProvider');
  }
  return context;
};
