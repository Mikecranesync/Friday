/**
 * ChatScreen - Main Gemini-style conversational interface
 * Voice-first email assistant with chat UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import { ChatBubble, ChatMessage } from '../components/ChatBubble';
import { SuggestionChip, Suggestion } from '../components/SuggestionChip';
import { TypingIndicator } from '../components/TypingIndicator';
import { BottomInputBar } from '../components/BottomInputBar';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  loadChatHistory,
  addMessage,
  clearChatHistory,
  generateMessageId,
} from '../utils/chatStorage';
import { headlineLarge, titleMedium } from '../theme/typography';
import { spacing } from '../theme/spacing';

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
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
      <View style={[styles.header, { borderBottomColor: colors.border.light, paddingTop: insets.top || spacing.md }]}>
        {/* Hamburger Menu */}
        <TouchableOpacity
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          accessibilityHint="Opens navigation menu"
        >
          <Text style={[styles.hamburgerIcon, { color: colors.text.primary }]}>☰</Text>
        </TouchableOpacity>

        {/* Gemini Logo (Center) */}
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Gemini
          </Text>
        </View>

        {/* Theme Toggle */}
        <ThemeToggle style={styles.themeToggle} />

        {/* User Avatar */}
        <View
          style={[styles.avatar, { backgroundColor: colors.accent.magenta }]}
          accessibilityRole="image"
          accessibilityLabel="User profile"
        >
          <Text style={styles.avatarText}>M</Text>
        </View>
      </View>

      {/* Chat Area */}
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
              <Text style={[styles.greeting, headlineLarge, { color: colors.text.primary }]}>
                Hi there
              </Text>
              <Text style={[styles.subtitle, titleMedium, { color: colors.text.primary }]}>
                Gemini 3 is here. See what's new for you
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

        {/* Bottom Input Bar */}
        <BottomInputBar
          onVoiceCommand={handleVoiceCommand}
          onTextSubmit={sendMessage}
          disabled={isProcessing}
        />
      </KeyboardAvoidingView>
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
    paddingBottom: spacing.md,
    // paddingTop set dynamically via safe area insets
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    fontSize: 24,
    fontWeight: '400',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
  },
  themeToggle: {
    marginHorizontal: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
