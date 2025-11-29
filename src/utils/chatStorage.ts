/**
 * Chat Storage Utility
 * Manages conversation history persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../components/ChatBubble';

const CHAT_STORAGE_KEY = '@jarvis_chat_history';
const MAX_MESSAGES = 100; // Keep last 100 messages

export interface Conversation {
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Load chat history from storage
 */
export async function loadChatHistory(): Promise<Conversation | null> {
  try {
    const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return null;
  }
}

/**
 * Save chat history to storage
 */
export async function saveChatHistory(conversation: Conversation): Promise<void> {
  try {
    // Limit message count
    if (conversation.messages.length > MAX_MESSAGES) {
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
    }

    conversation.updatedAt = Date.now();
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversation));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

/**
 * Add a new message to chat history
 */
export async function addMessage(message: ChatMessage): Promise<void> {
  try {
    let conversation = await loadChatHistory();

    if (!conversation) {
      conversation = {
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    conversation.messages.push(message);
    await saveChatHistory(conversation);
  } catch (error) {
    console.error('Failed to add message:', error);
  }
}

/**
 * Clear all chat history
 */
export async function clearChatHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
