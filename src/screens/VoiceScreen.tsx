import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

export function VoiceScreen() {
  const { isListening, isSpeaking, speak } = useVoiceCommands();
  const [lastCommand, setLastCommand] = useState('');

  const voiceCommands = [
    { command: 'Read my emails', action: () => speak('You have 3 unread emails') },
    { command: 'Read urgent emails', action: () => speak('Reading urgent emails') },
    { command: 'Archive all newsletters', action: () => speak('Archiving newsletters') },
    { command: 'Show drafts', action: () => speak('Showing pending drafts') },
  ];

  const handleCommand = (command: string, action: () => void) => {
    setLastCommand(command);
    action();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Commands</Text>
        <Text style={styles.subtitle}>
          Tap a command or say "Hey Jarvis" followed by the command
        </Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot,
            isSpeaking ? styles.statusDotActive : styles.statusDotInactive
          ]} />
          <Text style={styles.statusText}>
            {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready'}
          </Text>
        </View>
        {lastCommand && (
          <Text style={styles.lastCommand}>Last: "{lastCommand}"</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Email Commands</Text>
        {voiceCommands.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.commandButton}
            onPress={() => handleCommand(item.command, item.action)}
          >
            <Text style={styles.commandIcon}>🎤</Text>
            <Text style={styles.commandText}>{item.command}</Text>
            <Text style={styles.commandArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ How to Use</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Wake Word:</Text> Say "Hey Jarvis"
            {'\n\n'}
            <Text style={styles.infoBold}>Examples:</Text>
            {'\n'}• "Hey Jarvis, read my emails"
            {'\n'}• "Hey Jarvis, what's urgent?"
            {'\n'}• "Hey Jarvis, archive this"
            {'\n'}• "Hey Jarvis, send draft"
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Quick Actions</Text>
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardBlue]}
          onPress={() => speak('Reading your inbox summary')}
        >
          <Text style={styles.actionIcon}>📬</Text>
          <Text style={styles.actionTitle}>Inbox Summary</Text>
          <Text style={styles.actionSubtitle}>Get a quick overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardYellow]}
          onPress={() => speak('Showing emails that need your attention')}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <Text style={styles.actionTitle}>Urgent Items</Text>
          <Text style={styles.actionSubtitle}>Check high priority</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardGreen]}
          onPress={() => speak('Showing drafts ready for review')}
        >
          <Text style={styles.actionIcon}>✍️</Text>
          <Text style={styles.actionTitle}>Review Drafts</Text>
          <Text style={styles.actionSubtitle}>Approve AI responses</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotActive: {
    backgroundColor: '#22c55e',
  },
  statusDotInactive: {
    backgroundColor: '#d1d5db',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  lastCommand: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  commandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commandIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  commandText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  commandArrow: {
    fontSize: 24,
    color: '#d1d5db',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1e40af',
  },
  infoBold: {
    fontWeight: '700',
  },
  actionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionCardBlue: {
    backgroundColor: '#dbeafe',
  },
  actionCardYellow: {
    backgroundColor: '#fef3c7',
  },
  actionCardGreen: {
    backgroundColor: '#dcfce7',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
