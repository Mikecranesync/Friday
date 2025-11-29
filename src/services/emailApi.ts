/**
 * Email API Service Layer
 * Centralized HTTP client for backend communication at port 8888
 * Handles request/response, error handling, and retry logic
 */

import Constants from 'expo-constants';
import type { Email, Draft, Stats } from '../types/email';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.4.71:8888';

console.log('📡 Jarvis API connecting to:', API_BASE_URL);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BackendEmail {
  id: string;
  from: string;
  subject: string;
  body?: string;
  snippet?: string;
  receivedAt: string;
  tier: 1 | 2 | 3;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived' | 'deleted';
  hasAttachments: boolean;
  threadId?: string;
}

export interface BackendDraft {
  id: number;
  email_id: string;
  subject: string;
  body_text: string;
  status: 'pending' | 'edited' | 'approved' | 'sent' | 'rejected';
  created_at: string;
  updated_at?: string;
  gmail_message_id?: string;
}

export interface Categorization {
  tier: 1 | 2 | 3;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  reasoning: string;
  source: 'user_preference' | 'sender_reputation' | 'rule_based' | 'ai';
}

// Error handling utility
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic fetch wrapper with timeout, retries, and error handling
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<T> {
  const timeout = 30000; // 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || errorData.message || `HTTP ${response.status}`,
        errorData
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Retry on network errors or 5xx errors
    if (
      retries > 0 &&
      (error.name === 'AbortError' ||
        error.message.includes('Network request failed') ||
        (error instanceof ApiError && error.status >= 500))
    ) {
      console.log(`🔄 Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1));
      return fetchWithRetry<T>(url, options, retries - 1);
    }

    // Convert timeout errors
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }

    throw error;
  }
}

// Convert backend email format to frontend Email type
function convertBackendEmail(backendEmail: BackendEmail): Email {
  return {
    id: backendEmail.id,
    from: backendEmail.from,
    subject: backendEmail.subject,
    body: backendEmail.body || backendEmail.snippet || '',
    receivedAt: backendEmail.receivedAt,
    tier: backendEmail.tier,
    category: backendEmail.category,
    priority: backendEmail.priority,
    status: backendEmail.status,
    hasAttachments: backendEmail.hasAttachments,
  };
}

// Convert backend draft format to frontend Draft type
function convertBackendDraft(backendDraft: BackendDraft): Draft {
  return {
    id: backendDraft.id.toString(),
    emailId: backendDraft.email_id,
    content: backendDraft.body_text,
    tone: 'professional', // Default tone
    confidence: 0.85, // Default confidence
    createdAt: backendDraft.created_at,
    status: backendDraft.status,
  };
}

class EmailApiService {
  // ===== EMAIL ENDPOINTS =====

  async getEmails(tierFilter?: number): Promise<Email[]> {
    try {
      const response = await fetchWithRetry<{ success: boolean; emails: BackendEmail[] }>(
        `${API_BASE_URL}/api/emails?count=50`
      );

      let emails = response.emails || [];

      if (tierFilter) {
        emails = emails.filter(email => email.tier === tierFilter);
      }

      return emails.map(convertBackendEmail);
    } catch (error: any) {
      console.error('❌ Failed to fetch emails:', error.message);
      return [];
    }
  }

  async getUnreadEmails(count = 20): Promise<Email[]> {
    try {
      const response = await fetchWithRetry<{ success: boolean; emails: BackendEmail[] }>(
        `${API_BASE_URL}/api/emails/unread?count=${count}`
      );
      return (response.emails || []).map(convertBackendEmail);
    } catch (error: any) {
      console.error('❌ Failed to fetch unread emails:', error.message);
      return [];
    }
  }

  async getUrgentEmails(count = 10): Promise<Email[]> {
    try {
      const response = await fetchWithRetry<{ success: boolean; emails: BackendEmail[] }>(
        `${API_BASE_URL}/api/emails/urgent?count=${count}`
      );
      return (response.emails || []).map(convertBackendEmail);
    } catch (error: any) {
      console.error('❌ Failed to fetch urgent emails:', error.message);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetchWithRetry<{ success: boolean; count: number }>(
        `${API_BASE_URL}/api/emails/count`
      );
      return response.count || 0;
    } catch (error: any) {
      console.error('❌ Failed to fetch unread count:', error.message);
      return 0;
    }
  }

  async searchEmails(query: string, count = 20): Promise<Email[]> {
    try {
      const response = await fetchWithRetry<{ success: boolean; emails: BackendEmail[] }>(
        `${API_BASE_URL}/api/emails/search?q=${encodeURIComponent(query)}&count=${count}`
      );
      return (response.emails || []).map(convertBackendEmail);
    } catch (error: any) {
      console.error('❌ Failed to search emails:', error.message);
      return [];
    }
  }

  async markAsRead(emailId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean }>(
        `${API_BASE_URL}/api/emails/${emailId}/read`,
        { method: 'POST' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to mark as read:', error.message);
      return false;
    }
  }

  async archiveEmail(emailId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean }>(
        `${API_BASE_URL}/api/emails/${emailId}/archive`,
        { method: 'POST' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to archive email:', error.message);
      return false;
    }
  }

  async markAsSpam(emailId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean; message: string }>(
        `${API_BASE_URL}/api/emails/${emailId}/spam`,
        { method: 'POST' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to mark as spam:', error.message);
      return false;
    }
  }

  async markAsImportant(emailId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean; message: string }>(
        `${API_BASE_URL}/api/emails/${emailId}/important`,
        { method: 'POST' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to mark as important:', error.message);
      return false;
    }
  }

  async markAsVIP(emailId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean; message: string }>(
        `${API_BASE_URL}/api/emails/${emailId}/vip`,
        { method: 'POST' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to mark as VIP:', error.message);
      return false;
    }
  }

  async getEmailCategorization(emailId: string): Promise<Categorization | null> {
    try {
      const response = await fetchWithRetry<{ success: boolean; categorization: Categorization }>(
        `${API_BASE_URL}/api/emails/${emailId}/categorization`
      );
      return response.categorization;
    } catch (error: any) {
      console.error('❌ Failed to get categorization:', error.message);
      return null;
    }
  }

  // ===== DRAFT ENDPOINTS =====

  async getDrafts(status?: Draft['status']): Promise<Draft[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await fetchWithRetry<{ success: boolean; drafts: BackendDraft[] }>(
        `${API_BASE_URL}/api/drafts${params}`
      );
      return (response.drafts || []).map(convertBackendDraft);
    } catch (error: any) {
      console.error('❌ Failed to fetch drafts:', error.message);
      return [];
    }
  }

  async generateDraft(emailId: string): Promise<Draft | null> {
    try {
      const response = await fetchWithRetry<{ success: boolean; draft: BackendDraft }>(
        `${API_BASE_URL}/api/emails/${emailId}/generate-draft`,
        { method: 'POST' }
      );
      return convertBackendDraft(response.draft);
    } catch (error: any) {
      console.error('❌ Failed to generate draft:', error.message);
      return null;
    }
  }

  async updateDraft(draftId: string, content: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean; draft: BackendDraft }>(
        `${API_BASE_URL}/api/drafts/${draftId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ body_text: content }),
        }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to update draft:', error.message);
      return false;
    }
  }

  async approveDraft(draftId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean; message: string; gmailMessageId: string }>(
        `${API_BASE_URL}/api/drafts/${draftId}/approve`,
        { method: 'POST' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to approve draft:', error.message);
      return false;
    }
  }

  async rejectDraft(draftId: string): Promise<boolean> {
    try {
      await fetchWithRetry<{ success: boolean }>(
        `${API_BASE_URL}/api/drafts/${draftId}`,
        { method: 'DELETE' }
      );
      return true;
    } catch (error: any) {
      console.error('❌ Failed to reject draft:', error.message);
      return false;
    }
  }

  async getEmail(id: string): Promise<Email | null> {
    // Get single email from list
    const emails = await this.getEmails();
    return emails.find(email => email.id === id) || null;
  }

  async getStats(): Promise<Stats> {
    try {
      const emails = await this.getEmails();
      const drafts = await this.getDrafts();

      return {
        total: emails.length,
        tier1: emails.filter(e => e.tier === 1).length,
        tier2: emails.filter(e => e.tier === 2).length,
        tier3: emails.filter(e => e.tier === 3).length,
        drafts: drafts.length,
        unprocessed: emails.filter(e => e.status === 'unread').length,
      };
    } catch (error: any) {
      console.error('❌ Failed to get stats:', error.message);
      return { total: 0, tier1: 0, tier2: 0, tier3: 0, drafts: 0, unprocessed: 0 };
    }
  }

  // ===== HEALTH CHECK =====

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetchWithRetry<{ status: string; ready: boolean }>(
        `${API_BASE_URL}/api/health`
      );
      return response.ready || false;
    } catch (error: any) {
      console.error('❌ Health check failed:', error.message);
      return false;
    }
  }
}

export const emailApi = new EmailApiService();
export { ApiError, API_BASE_URL };
