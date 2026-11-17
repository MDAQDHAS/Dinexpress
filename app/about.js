import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '../constants/Colors';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About DineXpress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?q=80&w=200' }} 
            style={styles.appLogo} 
          />
          <Text style={styles.appName}>DineXpress v1.0.4</Text>
          <Text style={styles.appVersion}>Nandha Smart Canteen Initiative</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Our Mission</Text>
          <Text style={styles.cardText}>
            DineXpress is dedicated to transforming the dining experience at Nandha Engineering College. 
            Our digital platform eliminates long queues by allowing students to browse, order, and track food in real-time.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👨‍💻 The Development Team</Text>
          <Text style={styles.cardText}>
            This project is proudly developed by: {"\n\n"}
            • Hamsha {"\n"}
            • Gokulraj {"\n"}
            • Jishnu {"\n"}
            • Aqdhas {"\n\n"}
            Department: Nandha Engineering College {"\n"}
            Goal: 100% Digital & Paperless Canteen
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔒 Security & Privacy</Text>
          <Text style={styles.cardText}>
            All order data is encrypted locally. We prioritize student data privacy and seamless RFID integration for safe, fast collections.
          </Text>
        </View>

        <Text style={styles.footerText}>Designed with ❤️ for Nandha Students</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
      paddingBottom: 15,
      backgroundColor: '#FFF', 
      borderBottomWidth: 1, 
      borderBottomColor: '#EEE' 
  },
  backButton: { padding: 5 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#333' },
  scrollContent: { padding: 20 },
  logoSection: { alignItems: 'center', marginVertical: 30 },
  appLogo: { width: 100, height: 100, borderRadius: 25, backgroundColor: '#EEE' },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 15 },
  appVersion: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#F57C00' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  cardText: { fontSize: 15, color: '#555', lineHeight: 22 },
  footerText: { textAlign: 'center', marginTop: 20, color: '#888', fontStyle: 'italic' }
});
