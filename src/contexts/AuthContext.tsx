import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  skipLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@friday_user';

// Google OAuth Client IDs from Google Cloud Console
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '948651982454-mqqfrut1tarkjmfrpsjn6443si2uar3q.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '948651982454-4gi6aqu4e8ao126nppp0glk7i16234vl.apps.googleusercontent.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Expo's auth proxy - this requires adding the redirect URI to Google Cloud Console:
  // https://auth.expo.io/@mikecranesync/friday
  const redirectUri = makeRedirectUri({
    // Use Expo's proxy for standalone builds
    useProxy: true,
  });

  console.log('OAuth redirect URI:', redirectUri);
  console.log('Web Client ID:', WEB_CLIENT_ID);
  console.log('Android Client ID:', ANDROID_CLIENT_ID);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
  });

  // Load saved user on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await response.json();

      const userData: User = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const signIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const skipLogin = async () => {
    const guestUser: User = {
      id: 'guest',
      email: 'guest@friday.app',
      name: 'Guest User',
    };
    setUser(guestUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, skipLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
