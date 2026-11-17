import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Phone, Mail, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';

export default function WorkerSupport() {
  const router = useRouter();
  const { showPopup } = useAppContext();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage('');
    showPopup({ type: 'toast', message: 'Support request sent to Admin! ✅' });
  };

  const faqs = [
    { q: 'How do I accept an order?', a: 'Go to Orders tab → tap "Accept" on any Pending order.' },
    { q: 'What if an item runs out?', a: 'Go to Menu tab, find the item and toggle it to "Out of Stock".' },
    { q: 'How does RFID delivery work?', a: 'When food is ready, tap "RFID Tap (Deliver)" to confirm student collected the order.' },
    { q: 'How do I add a new menu item?', a: 'Open Menu tab → tap the orange + button → fill in details and submit.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Support</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Contact Admin</Text>
        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:+919360272843')}>
          <View style={styles.iconBox}><Phone size={22} color={Colors.primary} /></View>
          <View>
            <Text style={styles.contactTitle}>Call Canteen Admin</Text>
            <Text style={styles.contactSub}>+91 93602 72843</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:23ci034@nandhaengg.org')}>
          <View style={styles.iconBox}><Mail size={22} color={Colors.primary} /></View>
          <View>
            <Text style={styles.contactTitle}>Email Admin</Text>
            <Text style={styles.contactSub}>23ci034@nandhaengg.org</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Report an Issue</Text>
        <View style={styles.messageBox}>
          <TextInput style={styles.textArea} placeholder="Describe your issue (equipment, order, app bug...)"
            placeholderTextColor={Colors.placeholder} multiline numberOfLines={4}
            value={message} onChangeText={setMessage} />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <MessageSquare size={18} color="#FFF" />
            <Text style={styles.sendBtnText}>Send to Admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Staff FAQ</Text>
        {faqs.map((item, i) => (
          <View key={i} style={styles.faqCard}>
            <Text style={styles.faqQ}>{item.q}</Text>
            <Text style={styles.faqA}>{item.a}</Text>
          </View>
        ))}
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
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: Colors.text, marginBottom: 12, marginTop: 8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.inputBorder },
  iconBox: { width: 48, height: 48, backgroundColor: '#FFF5E5', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  contactTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  contactSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  messageBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 20 },
  textArea: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.text, height: 100, textAlignVertical: 'top' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, padding: 13, borderRadius: 12, marginTop: 10, gap: 8 },
  sendBtnText: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 15 },
  faqCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.inputBorder },
  faqQ: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 6 },
  faqA: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
});
