import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, TrendingUp, Clock, CheckCircle2, ListOrdered, ChevronRight, Play, CheckCircle, CreditCard } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function WorkerDashboard() {
  const router = useRouter();
  const { isCanteenOpen, setIsCanteenOpen, updateOrderStatus, allOrders, fetchAllOrders } = useAppContext();

  // Filter for active orders (excluding completed/cancelled)
  const activeQueue = (allOrders || [])
    .filter(o => !['completed', 'cancelled'].includes(o.status.toLowerCase()))
    .map(o => ({
        ...o,
        dbId: o.id,
        items: o.items_summary || 'No items',
        total: `₹ ${o.total_amount}`,
        id: `#ORD${o.id.toString().slice(0, 6).toUpperCase()}`,
        userName: o.profiles?.full_name || 'Student'
    }));

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusUpdate = async (order, newStatus) => {
    await updateOrderStatus(order.dbId, newStatus);
  };

  const orders = activeQueue;

  const stats = [
    { title: 'New Orders', value: orders.filter(o => o.status === 'pending').length, icon: ListOrdered, color: '#3B82F6' },
    { title: 'In Kitchen', value: orders.filter(o => o.status === 'preparing').length, icon: Clock, color: '#F59E0B' },
    { title: 'Ready', value: orders.filter(o => o.status === 'ready').length, icon: CheckCircle2, color: '#22C55E' },
  ];

  const kitchenLiveStream = [
    { item: 'Masala Dosa', count: 8, status: 'Cooking' },
    { item: 'Plain Dosa', count: 4, status: 'Pending' },
    { item: 'Tea', count: 12, status: 'Ready' },
  ];

  const nextOrder = orders[0] || null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Kitchen Console</Text>
          <Text style={styles.subGreeting}>{isCanteenOpen ? 'Accepting Incoming Orders' : 'Canteen is Closed'}</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Bell size={24} color={Colors.text} />
          {orders.filter(o => o.status.toLowerCase() === 'pending').length > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{orders.filter(o => o.status.toLowerCase() === 'pending').length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={[styles.statNum, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statTab}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Live Orders Queue */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Order Queue</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/orders')}>
            <Text style={styles.seeAllText}>View All Queue</Text>
          </TouchableOpacity>
        </View>

        {orders.slice(0, 3).map((order) => (
          <View key={order.dbId || order.id} style={styles.priorityCard}>
             <View style={styles.priorityHeader}>
               <View style={[styles.tag, { backgroundColor: order.status.toLowerCase() === 'preparing' ? '#E1F8ED' : '#FFF5E5' }]}>
                 <Text style={[styles.tagText, { color: order.status.toLowerCase() === 'preparing' ? '#22C55E' : Colors.primary }]}>
                   {order.status.toUpperCase()}
                 </Text>
               </View>
               <Text style={styles.orderId}>{order.id}</Text>
             </View>
             <Text style={styles.orderItems}>{order.items}</Text>
             <View style={styles.actionRow}>
               {order.status.toLowerCase() === 'pending' ? (
                  <TouchableOpacity 
                    style={[styles.readyBtn, { backgroundColor: '#3B82F6' }]} 
                    onPress={() => handleStatusUpdate(order, 'accepted')}
                  >
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.btnText}>Accept Order</Text>
                  </TouchableOpacity>
               ) : order.status.toLowerCase() === 'accepted' ? (
                  <TouchableOpacity 
                    style={styles.startBtn} 
                    onPress={() => handleStatusUpdate(order, 'preparing')}
                  >
                    <Play size={16} color={Colors.white} fill={Colors.white} />
                    <Text style={styles.btnText}>Start Preparing</Text>
                  </TouchableOpacity>
               ) : order.status.toLowerCase() === 'preparing' ? (
                  <TouchableOpacity 
                    style={styles.readyBtn} 
                    onPress={() => handleStatusUpdate(order, 'ready')}
                  >
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.btnText}>Mark as Ready</Text>
                  </TouchableOpacity>
               ) : (
                  <View style={styles.waitingTag}>
                    <Text style={styles.waitingText}>Order Ready for Student Pickup</Text>
                  </View>
               )}
             </View>
           </View>
        ))}
        {orders.length === 0 && (
          <View style={styles.emptyQueue}>
            <Text style={styles.emptyQueueText}>No active orders at the moment</Text>
          </View>
        )}

        {/* Kitchen Aggregate View */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preparation Stream</Text>
          <Text style={styles.itemCount}>Total 3 Unique Items</Text>
        </View>
        
        <View style={styles.streamList}>
          {kitchenLiveStream.map((item, index) => (
            <View key={index} style={styles.streamItem}>
              <View style={styles.streamLeft}>
                <View style={styles.qtyCircle}>
                  <Text style={styles.qtyText}>{item.count}</Text>
                </View>
                <Text style={styles.streamName}>{item.item}</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: item.status === 'Cooking' ? '#FFE8CC' : (item.status === 'Ready' ? '#E1F8ED' : '#F4F5F7') }]}>
                <Text style={[styles.statusTagText, { color: item.status === 'Cooking' ? Colors.primary : (item.status === 'Ready' ? '#22C55E' : Colors.textSecondary) }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.linkGrid}>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(worker)/orders')}>
            <ListOrdered size={24} color={Colors.primary} />
            <Text style={styles.linkText}>Incoming Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]} onPress={() => router.push('/(worker)/pos')}>
            <CreditCard size={24} color="#0EA5E9" />
            <Text style={[styles.linkText, { color: '#0369A1' }]}>Counter-Top POS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(worker)/menu')}>
            <TrendingUp size={24} color={Colors.primary} />
            <Text style={styles.linkText}>Menu Availability</Text>
          </TouchableOpacity>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <Text style={styles.toggleLabel}>Accepting New Orders</Text>
          <Switch
            value={isCanteenOpen}
            onValueChange={setIsCanteenOpen}
            trackColor={{ false: '#767577', true: '#FFE8CC' }}
            thumbColor={isCanteenOpen ? Colors.primary : '#f4f3f4'}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder
  },
  greeting: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.text },
  subGreeting: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary },
  bellButton: { padding: 8, backgroundColor: Colors.inputBg, borderRadius: 12, position: 'relative' },
  notifBadge: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    minWidth: 18, 
    height: 18, 
    borderRadius: 9, 
    backgroundColor: Colors.error, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white
  },
  notifBadgeText: {
    color: Colors.white,
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    lineHeight: 12
  },
  scrollContent: { padding: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: Colors.white, borderRadius: 15, padding: 15, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: Colors.inputBorder },
  statNum: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
  statTab: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  priorityCard: { backgroundColor: Colors.white, padding: 20, borderRadius: 24, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  priorityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tag: { backgroundColor: '#FFF5E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: Colors.primary },
  orderId: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.textSecondary },
  orderItems: { fontFamily: 'Outfit_600SemiBold', fontSize: 18, color: Colors.text, marginBottom: 20 },
  actionRow: { borderTopWidth: 1, borderTopColor: '#F4F5F7', paddingTop: 15 },
  startBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 15 },
  readyBtn: { backgroundColor: '#22C55E', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 15 },
  btnText: { color: Colors.white, fontFamily: 'Outfit_700Bold', fontSize: 15, marginLeft: 10 },
  waitingTag: { backgroundColor: '#F4F5F7', paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  waitingText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  itemCount: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.primary },
  seeAllText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.primary },
  emptyQueue: { backgroundColor: Colors.white, padding: 30, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder, borderStyle: 'dashed' },
  emptyQueueText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary },
  streamList: { backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 25 },
  streamItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.inputBorder },
  streamLeft: { flexDirection: 'row', alignItems: 'center' },
  qtyCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  qtyText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.primary },
  streamName: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.text },
  statusTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusTagText: { fontFamily: 'Outfit_700Bold', fontSize: 10 },
  linkGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  linkCard: { flex: 1, backgroundColor: Colors.white, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder },
  linkText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.text, marginTop: 10 },
  masterToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: Colors.inputBorder },
  toggleLabel: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text },
});
