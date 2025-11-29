import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import type { Email } from '../types/email';

export function EmailDetailScreen({ route, navigation }: any) {
  const { email } = route.params as { email: Email };
  const { readEmail, isSpeaking, stopSpeaking } = useVoiceCommands();

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      readEmail(email.from, email.subject, email.body);
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return '#22c55e';
      case 2: return '#eab308';
      case 3: return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.fromContainer}>
            <Text style={styles.fromLabel}>From:</Text>
            <Text style={styles.fromText}>{email.from}</Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: getTierColor(email.tier) }]}>
            <Text style={styles.tierText}>Tier {email.tier}</Text>
          </View>
        </View>

        <Text style={styles.subject}>{email.subject}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {new Date(email.receivedAt).toLocaleString()}
          </Text>
          <Text style={styles.metaText}>• {email.category}</Text>
          <Text style={styles.metaText}>• {email.priority}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.body}>{email.body}</Text>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, isSpeaking && styles.actionButtonActive]}
          onPress={handleReadAloud}
        >
          <Text style={styles.actionIcon}>{isSpeaking ? '⏸️' : '🔊'}</Text>
          <Text style={styles.actionText}>{isSpeaking ? 'Stop' : 'Read Aloud'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📥</Text>
          <Text style={styles.actionText}>Archive</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>↩️</Text>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  fromContainer: {
    flex: 1,
  },
  fromLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  fromText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  subject: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    padding: 16,
    paddingBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    padding: 16,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#2563eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
