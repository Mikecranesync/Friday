import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, skipLogin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#D96BFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.title}>FRIDAY</Text>
          <Text style={styles.subtitle}>Your AI Voice Assistant</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featureTitle}>What Friday Can Do</Text>
          <Text style={styles.feature}>Voice conversations with AI</Text>
          <Text style={styles.feature}>Quick answers to questions</Text>
          <Text style={styles.feature}>Natural language processing</Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={signIn}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.signInText}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Continue as Guest */}
        <TouchableOpacity style={styles.guestButton} onPress={skipLogin}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Sign in to personalize your experience
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0118',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#D96BFF',
    letterSpacing: 6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9F7AEA',
    letterSpacing: 2,
  },
  features: {
    alignItems: 'center',
    marginBottom: 60,
  },
  featureTitle: {
    fontSize: 16,
    color: '#D4BBFF',
    marginBottom: 16,
    fontWeight: '600',
  },
  feature: {
    fontSize: 14,
    color: '#9F7AEA',
    marginBottom: 8,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#D96BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  signInText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#6B5B7A',
    textAlign: 'center',
  },
  guestButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  guestText: {
    fontSize: 14,
    color: '#9F7AEA',
    textDecorationLine: 'underline',
  },
});
