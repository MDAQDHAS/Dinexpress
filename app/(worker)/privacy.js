import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Platform, StatusBar } from 'react-native';
import { ChevronLeft, Lock, KeyRound, Eye, EyeOff, Fingerprint } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function WorkerPrivacyScreen() {
  const router = useRouter();
  const [biometric, setBiometric] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionLog, setSessionLog] = useState(true);

  const sections = [
    {
      title: 'Access Control',
      items: [
        { label: 'Biometric Login', sub: 'Use fingerprint to access staff console', value: biometric, onChange: setBiometric, Icon: Fingerprint },
        { label: 'Auto Lock Screen', sub: 'Lock app after 5 min of inactivity', value: autoLock, onChange: setAutoLock, Icon: Lock },
        { label: 'Two-Factor Auth', sub: 'Extra OTP verification on login', value: twoFactor, onChange: setTwoFactor, Icon: KeyRound },
        { label: 'Session Activity Log', sub: 'Track when and where you log in', value: sessionLog, onChange: setSessionLog, Icon: Eye },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {sections.map((section, si) => (
          <View key={si}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, i) => {
                const Icon = item.Icon;
                return (
                  <View key={i} style={[styles.row, i < section.items.length - 1 && styles.borderBottom]}>
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
          </View>
        ))}

        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.borderBottom]}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
              <KeyRound size={20} color={Colors.error} />
            </View>
            <View style={styles.textCol}>
              <Text style={[styles.label, { color: Colors.error }]}>Change Password</Text>
              <Text style={styles.sub}>Update your staff login credentials</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
              <EyeOff size={20} color={Colors.error} />
            </View>
            <View style={styles.textCol}>
              <Text style={[styles.label, { color: Colors.error }]}>Revoke All Sessions</Text>
              <Text style={styles.sub}>Log out from all devices immediately</Text>
            </View>
          </TouchableOpacity>
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
  scroll: { padding: 20, gap: 20 },
  sectionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.textSecondary, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textCol: { flex: 1 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  sub: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
