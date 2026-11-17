import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, BellDot, Gift, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    { id: 1, title: 'Order Ready!', desc: 'Your order #ORD12345 is ready for pickup at the counter.', time: 'Just now', icon: BellDot, type: 'order' },
    { id: 2, title: 'Special Offer', desc: 'Get 20% off on all lunch meals today by using code LUNCH20.', time: '2 hours ago', icon: Gift, type: 'promo' },
    { id: 3, title: 'System Maintenance', desc: 'The canteen app will be down for maintenance briefly at 12 AM.', time: 'Yesterday', icon: Info, type: 'info' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((notif) => {
          const Icon = notif.icon;
          const iconBgColor = notif.type === 'order' ? '#E8F5E9' : notif.type === 'promo' ? '#FFF3E0' : '#E3F2FD';
          const iconColor = notif.type === 'order' ? '#388E3C' : notif.type === 'promo' ? '#F57C00' : '#1976D2';

          return (
            <TouchableOpacity key={notif.id} style={styles.notifCard}>
              <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                <Icon size={24} color={iconColor} />
              </View>
              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifDesc}>{notif.desc}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
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
    elevation: 4 
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
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notifTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  notifTime: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notifDesc: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
