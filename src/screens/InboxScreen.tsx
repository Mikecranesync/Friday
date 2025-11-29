import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import type { Email } from '../types/email';

export function InboxScreen({ navigation }: any) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTier, setFilterTier] = useState<number | undefined>();

  const loadEmails = async () => {
    try {
      const data = await api.getEmails(filterTier);
      setEmails(data);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [filterTier]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEmails();
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return '#22c55e'; // green
      case 2:
        return '#eab308'; // yellow
      case 3:
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return 'Auto';
      case 2:
        return 'Review';
      case 3:
        return 'Urgent';
      default:
        return 'Unknown';
    }
  };

  const renderEmail = ({ item }: { item: Email }) => (
    <TouchableOpacity
      style={styles.emailCard}
      onPress={() => navigation.navigate('EmailDetail', { email: item })}
    >
      <View style={styles.emailHeader}>
        <Text style={styles.emailFrom} numberOfLines={1}>
          {item.from}
        </Text>
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(item.tier) }]}>
          <Text style={styles.tierText}>{getTierLabel(item.tier)}</Text>
        </View>
      </View>
      <Text style={styles.emailSubject} numberOfLines={2}>
        {item.subject}
      </Text>
      <Text style={styles.emailPreview} numberOfLines={2}>
        {item.body}
      </Text>
      <View style={styles.emailFooter}>
        <Text style={styles.emailTime}>
          {new Date(item.receivedAt).toLocaleDateString()}
        </Text>
        {item.hasAttachments && (
          <Text style={styles.attachmentIcon}>📎</Text>
        )}
      </View>
    </TouchableOpacity>
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
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, !filterTier && styles.filterButtonActive]}
          onPress={() => setFilterTier(undefined)}
        >
          <Text style={[styles.filterText, !filterTier && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterTier === 1 && styles.filterButtonActive]}
          onPress={() => setFilterTier(1)}
        >
          <Text style={[styles.filterText, filterTier === 1 && styles.filterTextActive]}>
            Tier 1
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterTier === 2 && styles.filterButtonActive]}
          onPress={() => setFilterTier(2)}
        >
          <Text style={[styles.filterText, filterTier === 2 && styles.filterTextActive]}>
            Tier 2
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterTier === 3 && styles.filterButtonActive]}
          onPress={() => setFilterTier(3)}
        >
          <Text style={[styles.filterText, filterTier === 3 && styles.filterTextActive]}>
            Tier 3
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={emails}
        renderItem={renderEmail}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No emails found</Text>
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
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
  },
  emailCard: {
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
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailFrom: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emailPreview: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  emailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  attachmentIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
