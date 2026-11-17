import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, ChevronRight, Check, Play, CheckCircle, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';

export default function WorkerOrders() {
  const router = useRouter();
  const { updateOrderStatus, allOrders, fetchAllOrders, showPopup } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Active'); // 'Active' or 'All'

  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  // Filter and Format Orders from Global State
  const formattedOrders = (allOrders || []).map(o => ({
      ...o,
      dbId: o.id,
      displayId: `#ORD${String(o.id).slice(0, 6).toUpperCase()}`,
      customerName: o.profiles?.full_name || 'Student',
      items: o.items_summary || 'N/A',
      total: `₹ ${parseFloat(o.total_amount || 0).toFixed(2)}`,
      timeAgo: getTimeAgo(o.created_at),
  }));

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'unverified') return '#EF4444';
    if (s === 'pending') return '#F59E0B';
    if (s === 'accepted' || s === 'preparing') return '#8B5CF6';
    if (s === 'ready') return '#22C55E';
    if (s === 'delivered' || s === 'completed') return '#10B981';
    return Colors.textSecondary;
  };

  const handleStatusUpdate = async (order, newStatus) => {
    await updateOrderStatus(order.dbId, newStatus);
    // Real-time listener in AppContext will handle the refresh!
  };

  const currentTabOrders = activeTab === 'Active' 
    ? formattedOrders.filter(o => !['completed', 'cancelled', 'delivered'].includes((o.status || '').toLowerCase()))
    : formattedOrders;

  const filteredOrders = currentTabOrders.filter(order =>
    order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(order.items).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const priority = { pending: 1, accepted: 2, preparing: 3, ready: 4, delivered: 5, completed: 6, cancelled: 7 };
    const aP = priority[(a.status || '').toLowerCase()] || 9;
    const bP = priority[(b.status || '').toLowerCase()] || 9;
    return aP - bP;
  });

  const renderItem = ({ item }) => {
    const statusLower = (item.status || '').toLowerCase();
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.displayId}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.orderTime}>{item.timeAgo}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {(item.status || '').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemContainer}>
          <Text style={styles.itemsList}>{item.items}</Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemCount}>{String(item.items).split(',').length} Item(s)</Text>
            <Text style={styles.itemTotal}>{item.total}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          {statusLower === 'unverified' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
              onPress={() => handleStatusUpdate(item, 'preparing')}
            >
              <CheckCircle size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Verify & Prepare</Text>
            </TouchableOpacity>
          )}

          {statusLower === 'pending' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
              onPress={() => handleStatusUpdate(item, 'preparing')}
            >
              <Check size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Accept & Prepare</Text>
            </TouchableOpacity>
          )}

          {statusLower === 'preparing' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#22C55E' }]}
              onPress={() => handleStatusUpdate(item, 'ready')}
            >
              <CheckCircle size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Mark Ready</Text>
            </TouchableOpacity>
          )}

          {statusLower === 'ready' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
              onPress={() => handleStatusUpdate(item, 'completed')}
            >
              <CheckCircle size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Complete (RFID)</Text>
            </TouchableOpacity>
          )}

          {(statusLower === 'completed' || statusLower === 'delivered') && (
            <View style={styles.completedBadge}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => router.push(`/(worker)/order-detail?id=${encodeURIComponent(item.dbId)}`)}
          >
            <Text style={styles.detailBtnText}>Details</Text>
            <ChevronRight size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Queue</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {formattedOrders.filter(o => !['completed', 'delivered'].includes((o.status || '').toLowerCase())).length}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID or items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.placeholder}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['Active', 'All'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptySubText}>Fetching orders...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedOrders}
          keyExtractor={(item) => item.dbId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchAllOrders}
          refreshing={loading}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Clock size={48} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubText}>
                {activeTab === 'Active' ? 'All current orders have been handled!' : 'No orders placed yet.'}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: Colors.text, flex: 1 },
  countBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { color: Colors.white, fontFamily: 'Outfit_700Bold', fontSize: 12 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    paddingHorizontal: 15, height: 48, margin: 15, marginBottom: 8,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.inputBorder,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.text },
  tabRow: { flexDirection: 'row', paddingHorizontal: 15, marginBottom: 5, gap: 10 },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.inputBorder, backgroundColor: Colors.white },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  tabBtnTextActive: { color: Colors.white },
  listContent: { padding: 15, paddingBottom: 40 },
  orderCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.inputBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04,
    shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  orderId: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  customerName: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginTop: 1 },
  orderTime: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontFamily: 'Outfit_700Bold', fontSize: 11 },
  itemContainer: {
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 14,
  },
  itemsList: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.text, lineHeight: 22 },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  itemCount: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary },
  itemTotal: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: Colors.primary },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12, flex: 1, justifyContent: 'center', gap: 6,
  },
  actionBtnText: { color: Colors.white, fontFamily: 'Outfit_700Bold', fontSize: 13 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  detailBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginRight: 2 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  completedText: { color: '#10B981', fontFamily: 'Outfit_700Bold', fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyText: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text, marginTop: 16 },
  emptySubText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
