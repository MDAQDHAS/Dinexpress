import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Platform, StatusBar } from 'react-native';
import { ChevronLeft, Lock, Bell, HelpCircle, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-security')}>
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
            <ChevronLeft size={20} color={Colors.inputBorder} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: Colors.inputBorder }]}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#FFB84D' }}
              thumbColor={notifications ? Colors.primary : '#f4f3f4'}
              onValueChange={setNotifications}
              value={notifications}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: Colors.inputBorder }]} onPress={() => router.push('/help')}>
            <View style={styles.menuItemLeft}>
              <HelpCircle size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <ChevronLeft size={20} color={Colors.inputBorder} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about')}>
            <View style={styles.menuItemLeft}>
              <Info size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>About App</Text>
            </View>
            <ChevronLeft size={20} color={Colors.inputBorder} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
    elevation: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.white,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginLeft: 15,
  },
});
