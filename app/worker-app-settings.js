import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Moon, Globe, Volume2, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';

export default function WorkerAppSettings() {
  const router = useRouter();
  const { isCanteenOpen, setIsCanteenOpen } = useAppContext();
  const [darkMode, setDarkMode] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const items = [
    { label: 'Canteen Open / Closed', sub: 'Toggle canteen accepting status', value: isCanteenOpen, onChange: setIsCanteenOpen, Icon: Globe, color: '#22C55E' },
    { label: 'Dark Mode', sub: 'Switch to dark theme (coming soon)', value: darkMode, onChange: setDarkMode, Icon: Moon, color: Colors.primary },
    { label: 'Sound Alerts', sub: 'Play audio for incoming orders', value: soundAlerts, onChange: setSoundAlerts, Icon: Volume2, color: Colors.primary },
    { label: 'Auto Refresh Orders', sub: 'Refresh order list every 30 seconds', value: autoRefresh, onChange: setAutoRefresh, Icon: RefreshCw, color: Colors.primary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Canteen Controls</Text>
        <View style={styles.card}>
          {items.map((item, i) => {
            const Icon = item.Icon;
            return (
              <View key={i} style={[styles.row, i < items.length - 1 && styles.borderBottom]}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Icon size={20} color={item.color} />
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.sub}>{item.sub}</Text>
                </View>
                <Switch value={item.value} onValueChange={item.onChange}
                  trackColor={{ false: '#DDD', true: '#FFE8CC' }}
                  thumbColor={item.value ? Colors.primary : '#f4f3f4'} />
              </View>
            );
          })}
        </View>
        <Text style={styles.sectionLabel}>App Info</Text>
        <View style={styles.card}>
          {[{ l: 'App Version', v: 'v2.1.0 (Staff Build)' }, { l: 'DineXpress Build', v: 'Nandha Engineering College' }].map((r, i) => (
            <View key={i} style={[styles.row, i === 0 && styles.borderBottom]}>
              <View style={styles.textCol}><Text style={styles.label}>{r.l}</Text></View>
              <Text style={styles.valueText}>{r.v}</Text>
            </View>
          ))}
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
  sectionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.textSecondary, marginBottom: 12, marginLeft: 4, marginTop: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textCol: { flex: 1 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  sub: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  valueText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary },
});
