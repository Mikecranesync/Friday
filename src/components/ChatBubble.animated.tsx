/**
 * ChatBubble - Gemini-style message display component with Material 3 animations
 * Displays user and AI messages with appropriate styling
 * Includes entrance animations (fade in + translateY + scale)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { useMessageAnimation } from '../hooks/useMessageAnimation';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatBubbleProps {
  message: ChatMessage;
  onCopy?: () => void;
  onSpeak?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onCopy,
  onSpeak,
}) => {
  const { colors, isDark } = useTheme();
  const isUser = message.role === 'user';
  const { animatedStyle } = useMessageAnimation();

  const handleCopyText = () => {
    Clipboard.setString(message.content);
    Alert.alert('Copied', 'Message copied to clipboard');
    onCopy?.();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        animatedStyle,
      ]}
    >
      {/* Message Bubble */}
      <TouchableOpacity
        onLongPress={handleCopyText}
        activeOpacity={0.8}
        style={[
          styles.bubble,
          isUser
            ? {
                backgroundColor: colors.primary[500],
                ...shadows.small,
              }
            : {
                backgroundColor: isDark
                  ? colors.background.card
                  : '#FFFFFF',
                ...shadows.small,
                borderWidth: 1,
                borderColor: colors.border.light,
              },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isUser ? '#FFFFFF' : colors.text.primary,
              ...typography.body,
            },
          ]}
        >
          {message.content}
        </Text>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            {
              color: isUser
                ? 'rgba(255, 255, 255, 0.7)'
                : colors.text.tertiary,
              ...typography.caption,
            },
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </TouchableOpacity>

      {/* Action Buttons (for assistant messages) */}
      {!isUser && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleCopyText}
            style={styles.actionButton}
          >
            <Text style={[styles.actionIcon, { color: colors.text.tertiary }]}>
              📋
            </Text>
          </TouchableOpacity>

          {onSpeak && (
            <TouchableOpacity
              onPress={onSpeak}
              style={styles.actionButton}
            >
              <Text style={[styles.actionIcon, { color: colors.text.tertiary }]}>
                🔊
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    minWidth: 60,
  },
  messageText: {
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
});
