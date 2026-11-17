import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { ArrowLeft, Filter, Search, CheckCircle, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

const MOCK_ORDERS = [
  { id: '#ORD-8821', user: 'Gokulraj', items: '2x Masala Dosa, 1x Tea', total: 110, status: 'Completed', time: '10:45 AM' },
  { id: '#ORD-8820', user: 'Hamsha', items: '1x Onion Uttapam', total: 55, status: 'Pending', time: '11:10 AM' },
  { id: '#ORD-8819', user: 'Jishnu', items: '3x Idli, 1x Coffee', total: 85, status: 'Completed', time: '09:30 AM' },
];

export default function AdminOrders() {
  const router = useRouter();

  const OrderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? '#E1F8ED' : '#FFF5E5' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Completed' ? '#22C55E' : Colors.primary }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.userTitle}>{item.user}</Text>
      <Text style={styles.itemsText}>{item.items}</Text>
      <View style={styles.footer}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.totalText}>₹ {item.total}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Audit</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.inputBorder },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  backBtn: { padding: 4 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontFamily: 'Outfit_700Bold', fontSize: 10 },
  userTitle: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: Colors.text, marginBottom: 5 },
  itemsText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  timeText: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary },
  totalText: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
});
