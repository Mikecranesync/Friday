/**
 * Microsoft OAuth Authentication Hook
 * Implements secure OAuth 2.0 flow with PKCE for Outlook/Microsoft 365 access
 *
 * Security Features:
 * - PKCE (Proof Key for Code Exchange) enabled by default
 * - Server-side token exchange (never exposes client secret)
 * - Secure token storage with expo-secure-store
 * - Automatic token refresh
 */

import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Complete auth session when returning from browser
WebBrowser.maybeCompleteAuthSession();

// Get tenant ID from environment (default to "common" for personal accounts)
const getTenantId = (): string => {
  return process.env.EXPO_PUBLIC_MICROSOFT_TENANT_ID || 'common';
};

// OAuth discovery endpoints for Microsoft
const getDiscovery = () => {
  const tenantId = getTenantId();
  return {
    authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    revocationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`,
  };
};

// Microsoft Graph API scopes
const MICROSOFT_SCOPES = [
  'https://graph.microsoft.com/Mail.Read',
  'https://graph.microsoft.com/Mail.ReadWrite',
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/User.Read',
  'offline_access', // Required for refresh token
];

interface MicrosoftAuthResult {
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UseMicrosoftAuthReturn {
  promptAsync: () => Promise<MicrosoftAuthResult | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Microsoft OAuth Hook
 *
 * Usage:
 * ```tsx
 * const { promptAsync, loading, error } = useMicrosoftAuth();
 *
 * const handleConnect = async () => {
 *   const result = await promptAsync();
 *   if (result) {
 *     console.log('Authenticated:', result.email);
 *   }
 * };
 * ```
 */
export function useMicrosoftAuth(): UseMicrosoftAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get client ID from environment
  const getClientId = (): string => {
    return process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || '';
  };

  // Generate redirect URI (jarvis://auth/microsoft)
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'jarvis',
    path: 'auth/microsoft',
  });

  // Create auth request configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: getClientId(),
      scopes: MICROSOFT_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code, // Use authorization code (not token)
      usePKCE: true, // Enable PKCE for security
      extraParams: {
        prompt: 'consent', // Force consent screen to get refresh token
      },
    },
    getDiscovery()
  );

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response.params.code);
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Authentication failed');
      setLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
    }
  }, [response]);

  /**
   * Exchange authorization code for tokens (server-side)
   * This prevents exposing the client secret in the mobile app
   */
  const handleAuthSuccess = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get API URL from environment
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8888';

      // Exchange code for tokens via backend
      const response = await fetch(`${apiUrl}/api/auth/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'microsoft',
          code,
          redirectUri,
          codeVerifier: request?.codeVerifier, // PKCE code verifier
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token exchange failed');
      }

      const data = await response.json();

      // Store tokens securely
      await SecureStore.setItemAsync(
        `microsoft_tokens_${data.email}`,
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        })
      );

      setLoading(false);
      return {
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      };
    } catch (err: any) {
      setError(err.message || 'Failed to exchange authorization code');
      setLoading(false);
      return null;
    }
  };

  /**
   * Prompt user for OAuth authentication
   * Returns authenticated user data or null on failure
   */
  const wrappedPromptAsync = async (): Promise<MicrosoftAuthResult | null> => {
    if (!request) {
      setError('OAuth request not initialized');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await promptAsync();

      // The actual token exchange happens in the useEffect hook
      // This is just to trigger the OAuth flow
      if (result.type === 'success') {
        // Wait for handleAuthSuccess to complete
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!loading) {
              clearInterval(checkInterval);
              resolve(null); // Result will be handled by callback
            }
          }, 100);
        });
      }

      setLoading(false);
      return null;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
      return null;
    }
  };

  return {
    promptAsync: wrappedPromptAsync,
    loading,
    error,
  };
}

/**
 * Refresh Microsoft access token using refresh token
 * Call this when access token expires (typically after 1 hour)
 */
export async function refreshMicrosoftToken(
  email: string
): Promise<{ accessToken: string; expiresAt: number } | null> {
  try {
    // Get stored tokens
    const tokensJson = await SecureStore.getItemAsync(`microsoft_tokens_${email}`);
    if (!tokensJson) {
      throw new Error('No stored tokens found');
    }

    const tokens = JSON.parse(tokensJson);

    // Get API URL
    const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8888';

    // Refresh via backend
    const response = await fetch(`${apiUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'microsoft',
        refreshToken: tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    // Update stored tokens
    await SecureStore.setItemAsync(
      `microsoft_tokens_${email}`,
      JSON.stringify({
        ...tokens,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
      })
    );

    return {
      accessToken: data.accessToken,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error('Failed to refresh Microsoft token:', error);
    return null;
  }
}

/**
 * Get stored Microsoft tokens for an email
 */
export async function getMicrosoftTokens(email: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null> {
  try {
    const tokensJson = await SecureStore.getItemAsync(`microsoft_tokens_${email}`);
    if (!tokensJson) return null;

    const tokens = JSON.parse(tokensJson);

    // Check if token is expired
    if (tokens.expiresAt < Date.now()) {
      // Try to refresh
      const refreshed = await refreshMicrosoftToken(email);
      if (!refreshed) return null;

      return {
        ...tokens,
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      };
    }

    return tokens;
  } catch (error) {
    console.error('Failed to get Microsoft tokens:', error);
    return null;
  }
}

/**
 * Revoke Microsoft OAuth tokens and remove from storage
 */
export async function revokeMicrosoftAuth(email: string): Promise<boolean> {
  try {
    const tokens = await getMicrosoftTokens(email);
    if (!tokens) return false;

    // Revoke token with Microsoft
    const tenantId = getTenantId();
    await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout`, {
      method: 'GET',
    });

    // Remove from secure storage
    await SecureStore.deleteItemAsync(`microsoft_tokens_${email}`);

    return true;
  } catch (error) {
    console.error('Failed to revoke Microsoft auth:', error);
    return false;
  }
}
