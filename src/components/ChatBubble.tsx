/**
 * ChatBubble - Gemini-style message display component
 * Displays user and AI messages with appropriate styling
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { bodyLarge, bodySmall } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

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
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Message Bubble */}
      <TouchableOpacity
        onLongPress={handleCopyText}
        activeOpacity={0.8}
        accessibilityRole="text"
        accessibilityLabel={`${isUser ? 'Your message' : 'AI response'}: ${message.content}`}
        accessibilityHint="Long press to copy message to clipboard"
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
            bodyLarge,
            {
              color: isUser ? '#FFFFFF' : colors.text.primary,
            },
          ]}
        >
          {message.content}
        </Text>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            bodySmall,
            {
              color: isUser
                ? 'rgba(255, 255, 255, 0.7)'
                : colors.text.tertiary,
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
            accessibilityRole="button"
            accessibilityLabel="Copy message"
            accessibilityHint="Copies this message to clipboard"
          >
            <Text style={[styles.actionIcon, { color: colors.text.tertiary }]}>
              📋
            </Text>
          </TouchableOpacity>

          {onSpeak && (
            <TouchableOpacity
              onPress={onSpeak}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Read aloud"
              accessibilityHint="Reads this message using text-to-speech"
            >
              <Text style={[styles.actionIcon, { color: colors.text.tertiary }]}>
                🔊
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
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
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
    minWidth: 44, // WCAG 2.1 AA minimum touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
});
