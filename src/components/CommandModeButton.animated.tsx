/**
 * Command Mode Button - Press & Hold to Record Voice Command
 * Gemini-style voice interaction with Material 3 animations
 * Enhanced with proper pulse animation matching design specs
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Alert,
  Easing,
} from 'react-native';
import { Audio } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { standard, emphasized, componentDurations } from '../utils/easing';

interface CommandModeButtonProps {
  onCommandRecorded: (audioUri: string) => Promise<void>;
  disabled?: boolean;
}

export const CommandModeButton: React.FC<CommandModeButtonProps> = ({
  onCommandRecorded,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recording = useRef<Audio.Recording | null>(null);
  const recordingStartTime = useRef<number | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation when recording (Material 3 specs: 1.0 → 1.15 → 1.0, 1000ms)
  useEffect(() => {
    if (isRecording) {
      // Color transition to red
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 200,
        easing: standard,
        useNativeDriver: false,
      }).start();

      // Continuous pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: componentDurations.fabPulse / 2,
            easing: standard,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: componentDurations.fabPulse / 2,
            easing: standard,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop pulse immediately
      pulseAnim.stopAnimation();

      // Return to original state
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: componentDurations.messageSend,
          easing: emphasized,
          useNativeDriver: true,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 200,
          easing: standard,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording process...');
      console.log('📱 Platform:', Platform.OS);

      // Request permissions
      console.log('🔐 Requesting audio permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('🔐 Permission status:', status);

      if (status !== 'granted') {
        console.warn('❌ Audio permission not granted:', status);
        Alert.alert(
          'Microphone Permission Required',
          'Please grant microphone access to use voice commands.\n\nGo to Settings > Jarvis > Permissions > Microphone',
          [{ text: 'OK' }]
        );
        return;
      }

      // Set audio mode for recording
      console.log('⚙️ Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('✅ Audio mode configured');

      // Start recording
      console.log('🎙️ Creating recording instance...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      console.log('✅ Recording instance created');

      recording.current = newRecording;
      recordingStartTime.current = Date.now();
      setIsRecording(true);
      console.log('🔴 Recording started successfully');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Recording Error',
        `Failed to start recording:\n${errorMessage}\n\nTroubleshooting:\n1. Check microphone permissions\n2. Close other apps using microphone\n3. Restart the app`,
        [{ text: 'OK' }]
      );
    }
  };

  const stopRecording = async () => {
    if (!recording.current) {
      console.warn('⚠️ stopRecording called but no recording instance exists');
      return;
    }

    try {
      console.log('🔴 Stop recording triggered');

      // Check minimum recording duration (500ms to capture valid audio)
      const recordingDuration = recordingStartTime.current
        ? Date.now() - recordingStartTime.current
        : 0;
      console.log(`⏱️ Recording duration: ${recordingDuration}ms`);

      if (recordingDuration < 500) {
        console.warn('⚠️ Recording too short, discarding');
        setIsRecording(false);
        recording.current = null;
        recordingStartTime.current = null;
        Alert.alert(
          'Recording Too Short',
          'Please hold the button longer to record your command (at least 1 second).',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsRecording(false);
      setIsProcessing(true);

      console.log('⏹️ Stopping and unloading recording...');
      await recording.current.stopAndUnloadAsync();

      const uri = recording.current.getURI();
      console.log('📁 Recording URI:', uri);
      console.log('📏 URI length:', uri?.length || 0);

      // Validate URI exists and is accessible
      if (!uri) {
        throw new Error('Recording URI is null or undefined');
      }

      // Check if URI is a valid file path
      if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
        console.warn('⚠️ iOS URI missing file:// prefix:', uri);
      }

      recording.current = null;
      recordingStartTime.current = null;
      console.log('🚀 Sending recording to backend...');

      // Send to backend for processing
      await onCommandRecorded(uri);
      console.log('✅ Recording processed successfully');
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        'Processing Error',
        `Failed to process voice command:\n${errorMessage}\n\nPossible causes:\n1. Recording too short\n2. Network connection issue\n3. Backend server offline`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePressIn = () => {
    if (!disabled && !isProcessing) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Interpolate color from blue to red
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary[500], colors.error],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isProcessing}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: isProcessing ? '#9aa0a6' : backgroundColor,
            transform: [{ scale: pulseAnim }],
          },
          shadows.large,
        ]}
      >
        {isProcessing ? (
          <Text style={styles.icon}>⏳</Text>
        ) : isRecording ? (
          <Text style={styles.icon}>⏸️</Text>
        ) : (
          <Text style={styles.icon}>🎙️</Text>
        )}
      </Animated.View>

      {/* Status text below FAB */}
      {(isRecording || isProcessing) && (
        <Text
          style={[
            styles.statusText,
            { color: colors.text.secondary, ...typography.caption },
          ]}
        >
          {isRecording
            ? 'Release to send'
            : 'Processing...'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 20,  // Material 3 spec: 20dp for custom FAB
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Android shadow
  },
  icon: {
    fontSize: 32,
  },
  statusText: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});
