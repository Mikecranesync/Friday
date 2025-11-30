import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  skipLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AsyncStorage keys for user data
const CURRENT_USER_KEY = '@friday_current_user';
const USERS_ARRAY_KEY = '@friday_users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        console.log('✅ Loaded stored user:', userData.email);
        setUser(userData);
      } else {
        console.log('ℹ️  No stored user found');
      }
    } catch (error) {
      console.error('❌ Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all registered users from storage
   */
  const getAllUsers = async (): Promise<StoredUser[]> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_ARRAY_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('❌ Failed to load users array:', error);
      return [];
    }
  };

  /**
   * Save users array to storage
   */
  const saveAllUsers = async (users: StoredUser[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(USERS_ARRAY_KEY, JSON.stringify(users));
      console.log('✅ Users array saved successfully');
    } catch (error) {
      console.error('❌ Failed to save users array:', error);
      throw error;
    }
  };

  /**
   * Sign up a new user with email/password
   */
  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('🔵 Sign up initiated for:', email);

      // Validate inputs
      const sanitizedEmail = AuthService.sanitizeInput(email.toLowerCase());
      const sanitizedName = AuthService.sanitizeInput(name);

      if (!AuthService.validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = AuthService.validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message || 'Invalid password');
      }

      // Check if user already exists
      const users = await getAllUsers();
      const existingUser = users.find(u => u.email === sanitizedEmail);

      if (existingUser) {
        console.error('❌ User already exists:', sanitizedEmail);
        throw new Error('User with this email already exists');
      }

      // Create new user
      const passwordHash = await AuthService.hashPassword(password);
      const userId = AuthService.generateUserId();

      const newStoredUser: StoredUser = {
        id: userId,
        email: sanitizedEmail,
        passwordHash,
        name: sanitizedName,
        createdAt: new Date().toISOString(),
      };

      // Save to users array
      users.push(newStoredUser);
      await saveAllUsers(users);

      // Set as current user
      const currentUser: User = {
        id: userId,
        email: sanitizedEmail,
        name: sanitizedName,
      };

      setUser(currentUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

      console.log('✅ User signed up successfully:', sanitizedEmail);
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  };

  /**
   * Sign in existing user with email/password
   */
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔵 Sign in initiated for:', email);

      // Validate inputs
      const sanitizedEmail = AuthService.sanitizeInput(email.toLowerCase());

      if (!AuthService.validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      // Find user in storage
      const users = await getAllUsers();
      const storedUser = users.find(u => u.email === sanitizedEmail);

      if (!storedUser) {
        console.error('❌ User not found:', sanitizedEmail);
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await AuthService.verifyPassword(password, storedUser.passwordHash);

      if (!isPasswordValid) {
        console.error('❌ Invalid password for user:', sanitizedEmail);
        throw new Error('Invalid email or password');
      }

      // Set as current user
      const currentUser: User = {
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
      };

      setUser(currentUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

      console.log('✅ User signed in successfully:', sanitizedEmail);
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔵 Signing out user');
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const skipLogin = async () => {
    try {
      console.log('🔵 Continuing as guest');
      const guestUser: User = {
        id: 'guest',
        email: 'guest@friday.app',
        name: 'Guest User',
      };
      setUser(guestUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
      console.log('✅ Guest mode activated');
    } catch (error) {
      console.error('❌ Skip login error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, skipLogin }}>
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
