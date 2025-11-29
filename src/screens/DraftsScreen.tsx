import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import type { Draft } from '../types/email';

export function DraftsScreen() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrafts = async () => {
    try {
      const data = await api.getDrafts();
      setDrafts(data);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDrafts();
  };

  const handleApprove = async (draftId: string) => {
    try {
      await api.approveDraft(draftId);
      Alert.alert('Success', 'Draft approved and will be sent');
      loadDrafts();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve draft');
    }
  };

  const handleReject = async (draftId: string) => {
    try {
      await api.rejectDraft(draftId);
      Alert.alert('Rejected', 'Draft has been rejected');
      loadDrafts();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject draft');
    }
  };

  const renderDraft = ({ item }: { item: Draft }) => (
    <View style={styles.draftCard}>
      <View style={styles.draftHeader}>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {Math.round(item.confidence * 100)}% confidence
          </Text>
        </View>
        <Text style={styles.tone}>{item.tone}</Text>
      </View>

      <Text style={styles.draftContent}>{item.content}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectText}>❌ Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.approveText}>✅ Approve & Send</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.timestamp}>
        Generated {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drafts}
        renderItem={renderDraft}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✍️</Text>
            <Text style={styles.emptyText}>No drafts to review</Text>
            <Text style={styles.emptySubtext}>
              AI-generated drafts will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  draftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  tone: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  draftContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  approveButton: {
    backgroundColor: '#dcfce7',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  approveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
