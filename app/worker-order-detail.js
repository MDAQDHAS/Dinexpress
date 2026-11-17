import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, CheckCircle, Package, Truck, Circle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';

export default function WorkerOrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activeOrders } = useAppContext();

  const order = activeOrders.find(o => o.id === decodeURIComponent(id || ''));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Accepted': return '#3B82F6';
      case 'Preparing': return '#8B5CF6';
      case 'Ready': return '#22C55E';
      case 'Delivered': return '#10B981';
      default: return Colors.textSecondary;
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}>
          <Circle size={48} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={styles.notFoundText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const itemList = order.items.split(',').map(i => i.trim());

  const timeline = [
    { label: 'Order Placed', done: true, Icon: Clock },
    { label: 'Accepted by Staff', done: ['Accepted','Preparing','Ready','Delivered'].includes(order.status), Icon: CheckCircle },
    { label: 'Preparing in Kitchen', done: ['Preparing','Ready','Delivered'].includes(order.status), Icon: Package },
    { label: 'Ready for Pickup', done: ['Ready','Delivered'].includes(order.status), Icon: CheckCircle },
    { label: 'Delivered (RFID Tap)', done: order.status === 'Delivered', Icon: Truck },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderDate}>{order.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '18' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{order.total}</Text>
        </View>

        {/* Items Ordered */}
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        <View style={styles.itemsCard}>
          {itemList.map((item, i) => (
            <View key={i} style={[styles.itemRow, i < itemList.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }]}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Order Timeline */}
        <Text style={styles.sectionTitle}>Order Timeline</Text>
        <View style={styles.timelineCard}>
          {timeline.map((step, i) => {
            const Icon = step.Icon;
            return (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: step.done ? Colors.primary : '#E0E0E0' }]}>
                    <Icon size={12} color={step.done ? '#FFF' : '#999'} />
                  </View>
                  {i < timeline.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: step.done ? Colors.primary : '#E0E0E0' }]} />
                  )}
                </View>
                <Text style={[styles.timelineLabel, { color: step.done ? Colors.text : Colors.textSecondary }]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15, paddingBottom: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: Colors.inputBorder },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  scroll: { padding: 20 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontFamily: 'Outfit_600SemiBold', color: Colors.textSecondary, marginTop: 12 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 20 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  orderDate: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
  totalLabel: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary },
  totalValue: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: Colors.primary, marginTop: 4 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text, marginBottom: 12 },
  itemsCard: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden', marginBottom: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  itemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginRight: 12 },
  itemText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  timelineCard: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: Colors.inputBorder, padding: 18 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  timelineLeft: { alignItems: 'center', marginRight: 14, width: 28 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  timelineLine: { width: 2, height: 26, marginTop: 2 },
  timelineLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, paddingTop: 5, flex: 1 },
});
