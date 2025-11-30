import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from './src/contexts/SubscriptionContext';
import LoginScreen from './src/screens/LoginScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import PaywallScreen from './src/screens/PaywallScreen';

function AppContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscription();

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#D96BFF" />
        <Text style={styles.loadingText}>Loading Friday...</Text>
      </View>
    );
  }

  // No user -> Show login screen
  if (!user) {
    return <LoginScreen />;
  }

  // Guest user -> Allow access without subscription
  if (user.id === 'guest') {
    return <VoiceScreen />;
  }

  // Show loading while checking subscription status
  if (subscriptionLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#D96BFF" />
        <Text style={styles.loadingText}>Checking subscription...</Text>
      </View>
    );
  }

  // Authenticated user without subscription -> Show paywall
  if (!isSubscribed) {
    return <PaywallScreen />;
  }

  // Authenticated user with active subscription -> Show voice screen
  return <VoiceScreen />;
}

export default function App() {
  return (
    <ErrorBoundary fallbackMessage="Friday encountered an error during startup. Please restart the app.">
      <AuthProvider>
        <SubscriptionProvider>
          <AppContent />
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0118',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
});
