import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar, TextInput } from 'react-native';
import { ChevronLeft, User, Mail, Phone, BadgeCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function EmployeeProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('Mohamed Aqdhas');
  const [email, setEmail] = useState('aqdhas@nandhaengg.org');
  const [phone, setPhone] = useState('+91 93602 72843');
  const [editing, setEditing] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editText}>{editing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <Image source={require('../../Images/aqhas.jpg')} style={styles.avatar} />
          <Text style={styles.name}>Mohamed Aqdhas</Text>
          <View style={styles.badge}>
            <BadgeCheck size={14} color="#22C55E" />
            <Text style={styles.badgeText}>Verified Canteen Staff</Text>
          </View>
        </View>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Employee ID</Text>
          <Text style={styles.idValue}>WD-9928 · Nandha Engineering College</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formLabel}>Full Name</Text>
          <View style={styles.inputRow}>
            <User size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={editing}
              placeholder="Full Name"
            />
          </View>

          <Text style={styles.formLabel}>Email</Text>
          <View style={styles.inputRow}>
            <Mail size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={editing}
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.formLabel}>Phone</Text>
          <View style={styles.inputRow}>
            <Phone size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              editable={editing}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.formLabel}>Department</Text>
          <View style={[styles.inputRow, { backgroundColor: '#F8F8F8' }]}>
            <BadgeCheck size={18} color={Colors.textSecondary} />
            <Text style={[styles.input, { color: Colors.textSecondary, paddingTop: 12 }]}>Canteen Operations</Text>
          </View>

          <Text style={styles.formLabel}>Shift</Text>
          <View style={[styles.inputRow, { backgroundColor: '#F8F8F8' }]}>
            <BadgeCheck size={18} color={Colors.textSecondary} />
            <Text style={[styles.input, { color: Colors.textSecondary, paddingTop: 12 }]}>Morning Shift (08:00 AM – 03:00 PM)</Text>
          </View>
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
  editText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.primary },
  scroll: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFE8CC', marginBottom: 12 },
  name: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: '#E1F8ED', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#22C55E', marginLeft: 6 },
  idCard: { backgroundColor: Colors.primary, padding: 16, borderRadius: 16, marginBottom: 20 },
  idLabel: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit_400Regular', fontSize: 12 },
  idValue: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 15, marginTop: 4 },
  form: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.inputBorder },
  formLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginTop: 14, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.inputBorder },
  input: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.text, padding: 12, marginLeft: 8 },
});
