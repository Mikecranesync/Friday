/**
 * ChatScreen - Main Gemini-style conversational interface with Material 3 animations
 * Voice-first email assistant with chat UI
 * Enhanced with smooth scroll, keyboard handling, and micro-interactions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import { ChatBubble, ChatMessage } from '../components/ChatBubble.animated';
import { SuggestionChip, Suggestion } from '../components/SuggestionChip.animated';
import { TypingIndicator } from '../components/TypingIndicator.animated';
import { CommandModeButton } from '../components/CommandModeButton.animated';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMicroInteractions } from '../hooks/useMicroInteractions';
import {
  loadChatHistory,
  addMessage,
  clearChatHistory,
  generateMessageId,
} from '../utils/chatStorage';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { accelerate, componentDurations } from '../utils/easing';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.4.71:8888';

// Gemini-style suggestions
const SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'Check my urgent emails', icon: '🚨' },
  { id: '2', text: 'Summarize my inbox', icon: '📊' },
  { id: '3', text: 'Read unread messages', icon: '📬' },
  { id: '4', text: 'Search recent emails', icon: '🔍' },
];

export const ChatScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const { scrollViewRef, scrollToBottom } = useScrollAnimation();
  const { toastAnimatedStyle, showToast } = useMicroInteractions();

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const loadHistory = async () => {
    const conversation = await loadChatHistory();
    if (conversation) {
      setMessages(conversation.messages);
      setShowSuggestions(conversation.messages.length === 0);
    }
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    // Animate suggestions out with stagger
    // Note: In production, you'd animate each chip individually with a stagger delay
    sendMessage(suggestion.text);
  };

  const handleVoiceCommand = async (audioUri: string) => {
    console.log('🎙️ Voice command received in ChatScreen:', audioUri);

    // Create placeholder user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: '🎤 Voice message...',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowSuggestions(false);
    setIsProcessing(true);

    try {
      // Create FormData for audio upload
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      console.log('📤 Sending to API:', `${API_URL}/api/voice-command`);

      const response = await fetch(`${API_URL}/api/voice-command`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to process voice command');
      }

      // Update user message with actual transcript
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, content: data.transcript || 'Voice command' }
            : msg
        )
      );

      // Add AI response
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.confirmation,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await addMessage(userMessage);
      await addMessage(assistantMessage);

      // Speak response
      Speech.speak(data.confirmation, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error: any) {
      console.error('❌ Voice command error:', error);

      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      await addMessage(errorMessage);

      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowSuggestions(false);
    setIsProcessing(true);
    await addMessage(userMessage);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(async () => {
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: `I'll help you with: "${text}". This is a placeholder response. The voice command API will provide actual email information.`,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        await addMessage(assistantMessage);
        setIsProcessing(false);

        // Speak response
        Speech.speak(assistantMessage.content, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      }, 1000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to delete all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory();
            setMessages([]);
            setShowSuggestions(true);
            showToast('Chat cleared');
          },
        },
      ]
    );
  };

  const handleSpeakMessage = (content: string) => {
    Speech.speak(content, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text.primary, ...typography.title3 }]}>
            Jarvis
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
            <Text style={{ color: colors.text.tertiary }}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Area with Keyboard Avoidance */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message */}
          {showSuggestions && (
            <View style={styles.welcomeSection}>
              <Text style={[styles.greeting, { color: colors.text.primary, ...typography.title1 }]}>
                Hello
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary, ...typography.title3 }]}>
                Where should we start?
              </Text>

              {/* Suggestions */}
              <View style={styles.suggestionsContainer}>
                {SUGGESTIONS.map((suggestion) => (
                  <SuggestionChip
                    key={suggestion.id}
                    suggestion={suggestion}
                    onPress={handleSuggestionPress}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              onSpeak={() => handleSpeakMessage(message.content)}
            />
          ))}

          {/* Typing Indicator */}
          {isProcessing && <TypingIndicator />}
        </ScrollView>

        {/* Voice Input FAB */}
        <View style={styles.fabContainer}>
          <CommandModeButton
            onCommandRecorded={handleVoiceCommand}
            disabled={isProcessing}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: colors.background.card },
          toastAnimatedStyle,
        ]}
      >
        <Text style={[styles.toastText, { color: colors.text.primary }]}>
          Action completed
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontWeight: '600',
  },
  clearButton: {
    padding: spacing.sm,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  suggestionsContainer: {
    gap: spacing.xs,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 6,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
