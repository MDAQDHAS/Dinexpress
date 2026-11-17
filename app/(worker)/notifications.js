import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Platform, StatusBar } from 'react-native';
import { ChevronLeft, Bell, BellOff, Radio, ClipboardList, Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function WorkerNotificationsScreen() {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState(true);
  const [orderReady, setOrderReady] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [announcements, setAnnouncements] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  const items = [
    { label: 'New Order Alerts', sub: 'Get notified when a new order arrives', value: newOrders, onChange: setNewOrders, Icon: ClipboardList },
    { label: 'Order Ready Alert', sub: 'Notify when food is ready for pickup', value: orderReady, onChange: setOrderReady, Icon: Package },
    { label: 'Low Stock Alerts', sub: 'Warn when a menu item is running low', value: lowStock, onChange: setLowStock, Icon: BellOff },
    { label: 'Announcements', sub: 'College canteen notices and updates', value: announcements, onChange: setAnnouncements, Icon: Radio },
    { label: 'Sound Alerts', sub: 'Play audio for every incoming order', value: soundAlerts, onChange: setSoundAlerts, Icon: Bell },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Staff Alert Preferences</Text>
        <View style={styles.card}>
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <View key={i} style={[styles.row, i < items.length - 1 && styles.borderBottom]}>
                <View style={styles.iconBox}>
                  <Icon size={20} color={Colors.primary} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.sub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: '#DDD', true: '#FFE8CC' }}
                  thumbColor={item.value ? Colors.primary : '#f4f3f4'}
                />
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: Colors.inputBorder,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  scroll: { padding: 20 },
  sectionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.textSecondary, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textCol: { flex: 1 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  sub: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
