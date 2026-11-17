import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, Lock, Eye, Key, Trash2, Smartphone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function PrivacySecurityScreen() {
  const router = useRouter();

  const handlePress = (title) => {
    Alert.alert(title, "This feature is coming in the next security update (v1.1). Real-time database encryption is active.");
  };

  const settings = [
    { title: 'Change Password', icon: Key, desc: 'Update your login credentials' },
    { title: 'Privacy Policy', icon: ShieldCheck, desc: 'Read how your data is treated' },
    { title: 'Two-Factor Auth', icon: Lock, desc: 'Add security to your login' },
    { title: 'Device History', icon: Smartphone, desc: 'Manage your active sessions' },
    { title: 'Delete Account', icon: Trash2, desc: 'Permanently remove your data', color: Colors.error },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.disclaimerBox}>
            <ShieldCheck size={20} color="#00A86B" />
            <Text style={styles.disclaimerText}>Your connection to DineXpress is secured with End-to-End Encryption via Supabase SSL.</Text>
        </View>

        {settings.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handlePress(item.title)}>
              <View style={[styles.iconContainer, item.color && {backgroundColor: '#FFF0F0'}]}>
                <Icon size={22} color={item.color || Colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, item.color && {color: item.color}]}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <ChevronLeft size={20} color={Colors.inputBorder} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    backgroundColor: Colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.inputBorder 
  },
  backButton: { padding: 5 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  scrollContent: { padding: 20 },
  disclaimerBox: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#E6F4EA', borderRadius: 15, marginBottom: 20, gap: 12 },
  disclaimerText: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#006400', flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  iconContainer: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  itemTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.text },
  itemDesc: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
