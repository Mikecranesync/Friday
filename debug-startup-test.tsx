/**
 * Startup Test App - Ultra-minimal Friday test
 *
 * Use this to verify Expo Go connection works without any complex dependencies.
 * If this works but App.debug doesn't, the problem is in one of the imported modules.
 *
 * To use:
 * 1. Modify index.ts to import this instead of App.debug
 * 2. Run: expo start --clear
 * 3. Connect with Expo Go
 *
 * If you see "Friday is alive!" then Expo Go connection works fine.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartupTestApp() {
  console.log('🚀 StartupTestApp rendering');
  console.log('Platform:', Platform.OS, Platform.Version);
  console.log('__DEV__:', __DEV__);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>Friday is alive!</Text>
        <Text style={styles.subtitle}>Ultra-minimal test app</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Platform:</Text>
          <Text style={styles.infoValue}>
            {Platform.OS} {Platform.Version}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Dev Mode:</Text>
          <Text style={styles.infoValue}>{__DEV__ ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Timestamp:</Text>
          <Text style={styles.infoValue}>{new Date().toISOString()}</Text>
        </View>

        <Text style={styles.successText}>
          ✅ If you can see this, Expo Go is working correctly!
        </Text>

        <Text style={styles.nextSteps}>
          Next: Switch back to App.debug in index.ts to debug the full app
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0118', // Friday dark background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#D96BFF', // Friday primary purple
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#9F7AEA', // Friday tertiary purple
    marginBottom: 32,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#1A0B2E', // Friday surface
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9F7AEA',
  },
  infoValue: {
    fontSize: 14,
    color: '#F5F3FF', // Friday text primary
    fontFamily: 'monospace',
  },
  successText: {
    fontSize: 16,
    color: '#34D399', // Friday success green
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  nextSteps: {
    fontSize: 12,
    color: '#D4BBFF', // Friday text secondary
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
