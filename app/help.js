import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MessageSquare, Phone, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';

export default function HelpScreen() {
  const router = useRouter();
  const { showPopup } = useAppContext();
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim().length === 0) return;
    setMessage('');
    showPopup({ type: 'toast', message: 'Message sent securely!' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:+919360272843')}>
          <View style={styles.iconBox}>
            <Phone size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.contactTitle}>Call Canteen Desk</Text>
            <Text style={styles.contactSub}>+91 93602 72843</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:23ci034@nandhaengg.org')}>
          <View style={styles.iconBox}>
            <Mail size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.contactTitle}>Email Admin</Text>
            <Text style={styles.contactSub}>23ci034@nandhaengg.org</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Send us a Message</Text>
        <View style={styles.messageBox}>
          <TextInput 
            style={styles.textArea} 
            placeholder="Describe your issue with an order..."
            placeholderTextColor={Colors.placeholder}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Submit Request</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>FAQ</Text>
        <View style={styles.faqCard}>
          <Text style={styles.faqQ}>What if my RFID card doesn't scan?</Text>
          <Text style={styles.faqA}>Please go to the admin desk to manually verify your order and replace your student ID if it is physically damaged.</Text>
        </View>
        <View style={styles.faqCard}>
          <Text style={styles.faqQ}>Can I cancel my order?</Text>
          <Text style={styles.faqA}>Pre-ordered meals can only be cancelled within 5 minutes of placing the order via the Active Orders tab.</Text>
        </View>

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
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text, marginBottom: 15, marginTop: 10 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  iconBox: { width: 50, height: 50, backgroundColor: '#FFF5E5', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  contactTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.text },
  contactSub: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  messageBox: { backgroundColor: Colors.white, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 20 },
  textArea: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.text, height: 100, textAlignVertical: 'top' },
  sendButton: { backgroundColor: Colors.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  sendButtonText: { fontFamily: 'Outfit_600SemiBold', color: Colors.white, fontSize: 16 },
  faqCard: { backgroundColor: Colors.white, padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  faqQ: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text, marginBottom: 8 },
  faqA: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }
});
