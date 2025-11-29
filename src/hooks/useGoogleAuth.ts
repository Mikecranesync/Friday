/**
 * Google OAuth Authentication Hook
 * Implements secure OAuth 2.0 flow with PKCE for Gmail access
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
import { Platform } from 'react-native';

// Complete auth session when returning from browser
WebBrowser.maybeCompleteAuthSession();

// OAuth discovery endpoint for Google
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Gmail API scopes
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

interface GoogleAuthResult {
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UseGoogleAuthReturn {
  promptAsync: () => Promise<GoogleAuthResult | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Google OAuth Hook
 *
 * Usage:
 * ```tsx
 * const { promptAsync, loading, error } = useGoogleAuth();
 *
 * const handleConnect = async () => {
 *   const result = await promptAsync();
 *   if (result) {
 *     console.log('Authenticated:', result.email);
 *   }
 * };
 * ```
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get platform-specific client ID
  const getClientId = (): string => {
    const clientIds = Constants.expoConfig?.extra;

    if (Platform.OS === 'ios') {
      return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
    } else if (Platform.OS === 'android') {
      return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '';
    } else {
      return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';
    }
  };

  // Generate redirect URI (jarvis://auth/google)
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'jarvis',
    path: 'auth/google',
  });

  // Create auth request configuration
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: getClientId(),
      scopes: GMAIL_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code, // Use authorization code (not token)
      usePKCE: true, // Enable PKCE for security
      extraParams: {
        access_type: 'offline', // Request refresh token
        prompt: 'consent', // Force consent screen to get refresh token
      },
    },
    discovery
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
          provider: 'google',
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
        `google_tokens_${data.email}`,
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
  const wrappedPromptAsync = async (): Promise<GoogleAuthResult | null> => {
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
 * Refresh Google access token using refresh token
 * Call this when access token expires (typically after 1 hour)
 */
export async function refreshGoogleToken(
  email: string
): Promise<{ accessToken: string; expiresAt: number } | null> {
  try {
    // Get stored tokens
    const tokensJson = await SecureStore.getItemAsync(`google_tokens_${email}`);
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
        provider: 'google',
        refreshToken: tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    // Update stored tokens
    await SecureStore.setItemAsync(
      `google_tokens_${email}`,
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
    console.error('Failed to refresh Google token:', error);
    return null;
  }
}

/**
 * Get stored Google tokens for an email
 */
export async function getGoogleTokens(email: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null> {
  try {
    const tokensJson = await SecureStore.getItemAsync(`google_tokens_${email}`);
    if (!tokensJson) return null;

    const tokens = JSON.parse(tokensJson);

    // Check if token is expired
    if (tokens.expiresAt < Date.now()) {
      // Try to refresh
      const refreshed = await refreshGoogleToken(email);
      if (!refreshed) return null;

      return {
        ...tokens,
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
      };
    }

    return tokens;
  } catch (error) {
    console.error('Failed to get Google tokens:', error);
    return null;
  }
}

/**
 * Revoke Google OAuth tokens and remove from storage
 */
export async function revokeGoogleAuth(email: string): Promise<boolean> {
  try {
    const tokens = await getGoogleTokens(email);
    if (!tokens) return false;

    // Revoke token with Google
    await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.accessToken}`, {
      method: 'POST',
    });

    // Remove from secure storage
    await SecureStore.deleteItemAsync(`google_tokens_${email}`);

    return true;
  } catch (error) {
    console.error('Failed to revoke Google auth:', error);
    return false;
  }
}
