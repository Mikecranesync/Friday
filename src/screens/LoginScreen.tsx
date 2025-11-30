import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp, skipLogin, isLoading } = useAuth();

  // Form state
  const [isSignUpMode, setIsSignUpMode] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#D96BFF" />
      </SafeAreaView>
    );
  }

  const clearError = () => {
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    // Clear previous errors
    clearError();

    // Validate inputs
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Password is required');
      return;
    }

    if (isSignUpMode && !name.trim()) {
      setErrorMessage('Name is required');
      return;
    }

    setIsProcessing(true);

    try {
      if (isSignUpMode) {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      // Success - user will be redirected by AuthContext
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(errorMsg);
      console.error('❌ Auth error:', errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    clearError();
    // Keep email but clear password and name for security
    setPassword('');
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo/Title */}
            <View style={styles.logoContainer}>
              <Text style={styles.title}>FRIDAY</Text>
              <Text style={styles.subtitle}>Your AI Voice Assistant</Text>
            </View>

            {/* Auth Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {isSignUpMode ? 'Create Account' : 'Welcome Back'}
              </Text>

              {/* Name Input (Sign Up Only) */}
              {isSignUpMode && (
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#6B5B7A"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError();
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}

              {/* Email Input */}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B5B7A"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Password Input */}
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6B5B7A"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isProcessing}
                activeOpacity={0.7}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isSignUpMode ? 'Sign Up' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Mode Button */}
              <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                <Text style={styles.toggleText}>
                  {isSignUpMode
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Continue as Guest */}
            <TouchableOpacity style={styles.guestButton} onPress={skipLogin}>
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footer}>
              {isSignUpMode
                ? 'Create an account to save your preferences'
                : 'Sign in to personalize your experience'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0118',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#D96BFF',
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9F7AEA',
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#D4BBFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1A0F2E',
    borderWidth: 1,
    borderColor: '#3D2B5F',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#D96BFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D96BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 54,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#9F7AEA',
    textDecorationLine: 'underline',
  },
  guestButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  guestText: {
    fontSize: 14,
    color: '#6B5B7A',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#6B5B7A',
    textAlign: 'center',
  },
});
