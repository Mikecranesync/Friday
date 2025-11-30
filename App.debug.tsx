/**
 * App.debug.tsx - Enhanced debugging wrapper for Friday app
 *
 * This file wraps the main App component with comprehensive error boundary
 * and startup logging to identify mobile crashes.
 *
 * Features:
 * - Logs EVERY step of app initialization
 * - Catches and displays all React errors
 * - Shows detailed error screen with stack traces (dev mode)
 * - Fallback to ultra-minimal UI if App.tsx fails completely
 * - Debug overlay for runtime diagnostics
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logStartup, logError, logInfo, createLogger } from './src/utils/debugLogger';

// Create logger for this module
const logger = createLogger('App.debug');

// Track initialization steps
let initializationSteps: string[] = [];

function addInitStep(step: string) {
  initializationSteps.push(`${new Date().toISOString()} - ${step}`);
  logStartup('App.debug', step);
}

// Try to import App - log any failures
let App: React.ComponentType | null = null;
let AppImportError: Error | null = null;

addInitStep('Starting App import...');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AppModule = require('./App');
  App = AppModule.default || AppModule;
  addInitStep('✅ App imported successfully');
} catch (error) {
  AppImportError = error as Error;
  addInitStep(`❌ App import FAILED: ${error instanceof Error ? error.message : String(error)}`);
  logError('App.debug', 'Failed to import App.tsx', error);
}

// Try to import DebugOverlay
let DebugOverlay: React.ComponentType | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DebugOverlayModule = require('./src/components/DebugOverlay');
  DebugOverlay = DebugOverlayModule.default || DebugOverlayModule;
  addInitStep('✅ DebugOverlay imported successfully');
} catch (error) {
  addInitStep(`⚠️ DebugOverlay import failed: ${error instanceof Error ? error.message : String(error)}`);
  logger.warn('Failed to import DebugOverlay (non-critical)', error);
}

// Error Boundary State
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Enhanced Error Boundary for debugging
 */
class DebugErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    addInitStep('✅ DebugErrorBoundary constructed');
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    addInitStep(`❌ Error caught by boundary: ${error.message}`);
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    addInitStep(`❌ Component error details: ${error.name}`);
    logError('DebugErrorBoundary', 'Component error caught', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      errorInfo,
    });
  }

  componentDidMount(): void {
    addInitStep('✅ DebugErrorBoundary mounted');
    logInfo('DebugErrorBoundary', 'Error boundary is active');
  }

  handleRetry = (): void => {
    addInitStep('🔄 User requested retry');
    logInfo('DebugErrorBoundary', 'Retrying after error');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorScreen
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          initSteps={initializationSteps}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Screen Component
 */
interface ErrorScreenProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  initSteps: string[];
  onRetry: () => void;
}

function ErrorScreen({ error, errorInfo, initSteps, onRetry }: ErrorScreenProps) {
  const colors = {
    background: '#0A0118',
    surface: '#1A0B2E',
    primary: '#D96BFF',
    error: '#F87171',
    textPrimary: '#F5F3FF',
    textSecondary: '#D4BBFF',
    textTertiary: '#9F7AEA',
  };

  return (
    <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.errorScroll}
        contentContainerStyle={styles.errorContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Error Icon */}
        <View style={[styles.errorIcon, { backgroundColor: 'rgba(248, 113, 113, 0.2)' }]}>
          <Text style={styles.errorEmoji}>💥</Text>
        </View>

        {/* Title */}
        <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
          App Crashed
        </Text>

        {/* Error Message */}
        <View style={[styles.errorBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.errorLabel, { color: colors.textTertiary }]}>Error:</Text>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error.name}: {error.message}
          </Text>
        </View>

        {/* Platform Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Platform:</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {Platform.OS} {Platform.Version}
          </Text>
        </View>

        {/* Initialization Steps */}
        <View style={[styles.stepsBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.stepsTitle, { color: colors.textPrimary }]}>
            Initialization Steps:
          </Text>
          {initSteps.map((step, index) => (
            <Text key={index} style={[styles.stepText, { color: colors.textSecondary }]}>
              {step}
            </Text>
          ))}
        </View>

        {/* Dev Mode: Stack Trace */}
        {__DEV__ && error.stack && (
          <View style={[styles.stackBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.stackTitle, { color: colors.textPrimary }]}>
              Stack Trace:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.stackScroll}
            >
              <Text style={[styles.stackText, { color: colors.textTertiary }]}>
                {error.stack}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* Dev Mode: Component Stack */}
        {__DEV__ && errorInfo?.componentStack && (
          <View style={[styles.stackBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.stackTitle, { color: colors.textPrimary }]}>
              Component Stack:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.stackScroll}
            >
              <Text style={[styles.stackText, { color: colors.textTertiary }]}>
                {errorInfo.componentStack}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* Retry Button */}
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          If this error persists, try restarting the app or clearing cache
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Main Debug App Wrapper
 */
export default function AppDebug() {
  addInitStep('✅ AppDebug component rendering');

  // If App import failed, show minimal fallback
  if (AppImportError || !App) {
    addInitStep('⚠️ Rendering fallback UI (App import failed)');
    return (
      <SafeAreaView style={styles.fallbackContainer}>
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackEmoji}>🚫</Text>
          <Text style={styles.fallbackTitle}>Friday Failed to Load</Text>
          <Text style={styles.fallbackMessage}>
            The main app component could not be imported.
          </Text>

          {AppImportError && (
            <View style={styles.fallbackError}>
              <Text style={styles.fallbackErrorTitle}>Error Details:</Text>
              <Text style={styles.fallbackErrorText}>
                {AppImportError.name}: {AppImportError.message}
              </Text>
            </View>
          )}

          <View style={styles.fallbackSteps}>
            <Text style={styles.fallbackStepsTitle}>Initialization Log:</Text>
            {initializationSteps.map((step, index) => (
              <Text key={index} style={styles.fallbackStepText}>
                {step}
              </Text>
            ))}
          </View>

          {__DEV__ && AppImportError?.stack && (
            <ScrollView style={styles.fallbackStack} horizontal>
              <Text style={styles.fallbackStackText}>{AppImportError.stack}</Text>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Wrap App in error boundary and add debug overlay
  addInitStep('✅ Rendering App with DebugErrorBoundary');
  return (
    <DebugErrorBoundary>
      <App />
      {DebugOverlay && <DebugOverlay />}
    </DebugErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
  },
  errorScroll: {
    flex: 1,
  },
  errorContent: {
    padding: 24,
    alignItems: 'center',
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  infoBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  stepsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  stackBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  stackScroll: {
    maxHeight: 200,
  },
  stackText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#0A0118',
  },
  fallbackContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  fallbackTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F3FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackMessage: {
    fontSize: 16,
    color: '#D4BBFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  fallbackError: {
    width: '100%',
    backgroundColor: '#1A0B2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  fallbackErrorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9F7AEA',
    marginBottom: 8,
  },
  fallbackErrorText: {
    fontSize: 12,
    color: '#F87171',
    fontFamily: 'monospace',
  },
  fallbackSteps: {
    width: '100%',
    backgroundColor: '#1A0B2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fallbackStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F3FF',
    marginBottom: 12,
  },
  fallbackStepText: {
    fontSize: 10,
    color: '#D4BBFF',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  fallbackStack: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#1A0B2E',
    padding: 16,
    borderRadius: 12,
  },
  fallbackStackText: {
    fontSize: 9,
    color: '#9F7AEA',
    fontFamily: 'monospace',
  },
});
