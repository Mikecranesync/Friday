import * as Crypto from 'expo-crypto';

/**
 * AuthService - Handles authentication utilities for Friday Voice Assistant
 * Provides password hashing, validation, and user management helpers
 */
export class AuthService {
  /**
   * Hash a password using SHA-256
   * @param password - Plain text password to hash
   * @returns Promise<string> - Hex-encoded hash
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      console.log('✅ Password hashed successfully');
      return hash;
    } catch (error) {
      console.error('❌ Password hashing failed:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against a stored hash
   * @param password - Plain text password to verify
   * @param hash - Stored hash to compare against
   * @returns Promise<boolean> - True if password matches hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(password);
      const isMatch = passwordHash === hash;
      console.log(isMatch ? '✅ Password verified' : '❌ Password mismatch');
      return isMatch;
    } catch (error) {
      console.error('❌ Password verification failed:', error);
      return false;
    }
  }

  /**
   * Validate email format using regex
   * @param email - Email address to validate
   * @returns boolean - True if email is valid format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      console.log('❌ Invalid email format:', email);
    }

    return isValid;
  }

  /**
   * Generate a unique user ID using current timestamp and random string
   * @returns string - Unique user ID
   */
  static generateUserId(): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const userId = `user_${timestamp}_${randomStr}`;
    console.log('✅ Generated user ID:', userId);
    return userId;
  }

  /**
   * Validate password strength
   * MVP: minimum 6 characters
   * @param password - Password to validate
   * @returns Object with valid flag and optional error message
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }

    // MVP: Basic validation only
    // Future: Add complexity requirements (uppercase, numbers, special chars)
    return { valid: true };
  }

  /**
   * Sanitize user input to prevent injection attacks
   * @param input - User input string
   * @returns string - Sanitized string
   */
  static sanitizeInput(input: string): string {
    // Remove potential harmful characters
    return input.trim().replace(/[<>]/g, '');
  }
}
