/**
 * BottomInputBar - Gemini-style bottom input bar
 * Full input bar with 6 elements: [+] [📷] [Input] [Fast ⚡] [🎤] [🔊]
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { bodyLarge, labelMedium } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

interface BottomInputBarProps {
  onVoiceCommand: (audioUri: string) => Promise<void>;
  onTextSubmit: (text: string) => void;
  disabled?: boolean;
}

export const BottomInputBar: React.FC<BottomInputBarProps> = ({
  onVoiceCommand,
  onTextSubmit,
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recording = useRef<Audio.Recording | null>(null);
  const recordingStartTime = useRef<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation when recording
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording process...');

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'Please grant microphone access to use voice commands.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = newRecording;
      recordingStartTime.current = Date.now();
      setIsRecording(true);
      startPulseAnimation();
      console.log('🔴 Recording started successfully');
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording.current) {
      return;
    }

    try {
      console.log('🔴 Stop recording triggered');

      // Check minimum recording duration
      const recordingDuration = recordingStartTime.current
        ? Date.now() - recordingStartTime.current
        : 0;

      if (recordingDuration < 500) {
        console.warn('⚠️ Recording too short, discarding');
        setIsRecording(false);
        stopPulseAnimation();
        recording.current = null;
        recordingStartTime.current = null;
        Alert.alert(
          'Recording Too Short',
          'Please hold the button longer to record your command.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsRecording(false);
      stopPulseAnimation();
      setIsProcessing(true);

      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      recording.current = null;
      recordingStartTime.current = null;

      // Send to backend for processing
      await onVoiceCommand(uri);
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert('Processing Error', 'Failed to process voice command.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMicPressIn = () => {
    if (!disabled && !isProcessing) {
      startRecording();
    }
  };

  const handleMicPressOut = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTextSubmit = () => {
    if (inputText.trim() && !disabled) {
      onTextSubmit(inputText.trim());
      setInputText('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary, paddingBottom: insets.bottom || spacing.sm }]}>
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: isDark ? colors.accent.inputBg : '#FFFFFF',
            ...shadows.medium,
          },
        ]}
      >
        {/* Plus Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => Alert.alert('Add', 'Add feature coming soon')}
          accessibilityRole="button"
          accessibilityLabel="Add attachment"
          accessibilityHint="Opens menu to add files or images"
        >
          <Text style={[styles.iconText, { color: colors.accent.iconGray }]}>+</Text>
        </TouchableOpacity>

        {/* Camera Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => Alert.alert('Camera', 'Camera feature coming soon')}
          accessibilityRole="button"
          accessibilityLabel="Open camera"
          accessibilityHint="Take a photo to include in your message"
        >
          <Text style={styles.emoji}>📷</Text>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={[
            styles.textInput,
            bodyLarge,
            {
              color: colors.text.primary,
            },
          ]}
          placeholder="Ask Gemini"
          placeholderTextColor={colors.text.tertiary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleTextSubmit}
          returnKeyType="send"
          editable={!disabled}
          accessibilityLabel="Message input"
          accessibilityHint="Type your message here. Press enter to send."
        />

        {/* Fast Chip */}
        <TouchableOpacity
          style={[
            styles.fastChip,
            { borderColor: colors.border.light },
          ]}
        >
          <Text style={[styles.fastText, labelMedium, { color: colors.text.secondary }]}>
            Fast
          </Text>
          <Text style={styles.lightningEmoji}>⚡</Text>
        </TouchableOpacity>

        {/* Microphone Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPressIn={handleMicPressIn}
          onPressOut={handleMicPressOut}
          disabled={disabled || isProcessing}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? "Recording voice" : "Record voice message"}
          accessibilityHint="Press and hold to record, release to send"
          accessibilityState={{ disabled: disabled || isProcessing, busy: isProcessing }}
        >
          <Animated.Text
            style={[
              styles.emoji,
              {
                transform: [{ scale: pulseAnim }],
                opacity: isRecording ? 0.8 : 1,
              },
            ]}
          >
            {isProcessing ? '⏳' : isRecording ? '⏸️' : '🎤'}
          </Animated.Text>
        </TouchableOpacity>

        {/* Voice Mode Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => Alert.alert('Voice Mode', 'Voice mode feature coming soon')}
        >
          <Text style={styles.emoji}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Recording Status */}
      {(isRecording || isProcessing) && (
        <Text
          style={[
            styles.statusText,
            labelMedium,
            { color: colors.text.tertiary },
          ]}
        >
          {isRecording ? 'Release to send' : 'Processing...'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    // paddingBottom set dynamically via safe area insets
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    elevation: 3, // Android shadow
  },
  iconButton: {
    width: 48, // WCAG 2.1 AA minimum touch target
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
    fontWeight: '400',
  },
  emoji: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fastChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: spacing.xs,
    gap: 2,
  },
  fastText: {
    // Typography comes from labelMedium
  },
  lightningEmoji: {
    fontSize: 14,
  },
  statusText: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
