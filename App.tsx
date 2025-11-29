import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Simple mock emails
const MOCK_EMAILS = [
  { id: '1', from: 'boss@work.com', subject: 'Urgent: Meeting today', snippet: 'We need to discuss the project...', unread: true },
  { id: '2', from: 'newsletter@tech.com', subject: 'Weekly Tech News', snippet: 'Top stories this week...', unread: false },
  { id: '3', from: 'friend@gmail.com', subject: 'Lunch tomorrow?', snippet: 'Hey, are you free for lunch...', unread: true },
];

export default function App() {
  const [emails] = useState(MOCK_EMAILS);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Jarvis</Text>
        <Text style={styles.subtitle}>{emails.length} emails</Text>
      </View>

      {/* Email List */}
      <ScrollView style={styles.list}>
        {emails.map(email => (
          <TouchableOpacity key={email.id} style={styles.emailCard}>
            <View style={styles.emailHeader}>
              <Text style={[styles.from, email.unread && styles.unread]}>
                {email.from}
              </Text>
              {email.unread && <View style={styles.dot} />}
            </View>
            <Text style={[styles.subject, email.unread && styles.unread]}>
              {email.subject}
            </Text>
            <Text style={styles.snippet} numberOfLines={1}>
              {email.snippet}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Simple Voice Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>🎤</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2563eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#93c5fd',
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  emailCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  from: {
    fontSize: 14,
    color: '#6b7280',
  },
  subject: {
    fontSize: 16,
    marginTop: 4,
    color: '#1f2937',
  },
  snippet: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  unread: {
    fontWeight: '600',
    color: '#111827',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    fontSize: 24,
  },
});
