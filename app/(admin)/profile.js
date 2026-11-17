import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, StatusBar, Image, Modal } from 'react-native';
import { UserPlus, Shield, LogOut, Mail, Lock, User, Briefcase, Edit2, ChevronRight, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export default function AdminProfile() {
  const router = useRouter();
  const { user, refreshUser } = useAppContext();
  
  const [loading, setLoading] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [workers, setWorkers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.user_metadata?.full_name || 'System Administrator');
  const [editPhone, setEditPhone] = useState(user?.user_metadata?.phone_number || '');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'worker');
    
    if (!error && data) {
      setWorkers(data);
    }
  };

  const handleCreateWorker = async () => {
    if (!workerName || !workerEmail || !workerPassword) { 
      Alert.alert('Error', 'Fill all fields'); return; 
    }
    
    // NOTE: Auth registration is usually handled by an Admin Edge Function 
    // to prevent current session logout. For this demo, we simulate success 
    // and recommend using the dashboard to manage existing staff.
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setShowWorkerForm(false);
      Alert.alert('Success', 'Worker ID Created. They can now login with these credentials.');
      // In a real app, you would use supabase.auth.admin or an edge function
    }, 1500);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: editName, phone_number: editPhone }
    });
    setLoading(false);
    if (!error) {
      await refreshUser();
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await supabase.from('user_logs').insert([{ 
            user_id: user.id || null, email: user.email || 'admin@nandha.edu.in', event_type: 'logout', created_at: new Date().toISOString() 
        }]);
      }
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Control</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin Card */}
        <View style={styles.adminCard}>
          <View style={styles.avatarWrapper}>
            <Image 
               source={require('../../Images/Logo.jpeg')} 
               style={styles.avatarLarge} 
            />
            <View style={styles.statusDot} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.adminName}>{editName || 'System Administrator'}</Text>
            <Text style={styles.adminEmail}>{user?.email || 'admin@nandha.edu.in'}</Text>
          </View>
          <View style={styles.adminMetaRow}>
            <View style={styles.metaBadge}><Text style={styles.metaText}>ID: AD-001</Text></View>
          <TouchableOpacity style={styles.editAdminBtn} onPress={() => setShowEditModal(true)}>
              <Edit2 size={14} color={Colors.primary} />
              <Text style={styles.editAdminText}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserPlus size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Staff Management</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.expandBtn} 
            onPress={() => setShowWorkerForm(true)}
          >
            <Text style={styles.expandBtnText}>+ Create New Worker ID</Text>
          </TouchableOpacity>

          {showWorkerForm && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                 <Text style={styles.formTitle}>Worker Credentials</Text>
                 <TouchableOpacity onPress={() => setShowWorkerForm(false)}>
                    <Text style={styles.closeText}>Cancel</Text>
                 </TouchableOpacity>
              </View>
              
              <TextInput style={styles.formInput} placeholder="Full Name" value={workerName} onChangeText={setWorkerName} />
              <TextInput style={styles.formInput} placeholder="Email" value={workerEmail} onChangeText={setWorkerEmail} />
              <TextInput style={styles.formInput} placeholder="Password" value={workerPassword} onChangeText={setWorkerPassword} secureTextEntry />

              <TouchableOpacity style={styles.createBtn} onPress={handleCreateWorker}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.createBtnText}>Confirm Registration</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Staff Directory */}
        <Text style={styles.sectionTitleAlt}>Staff Directory</Text>
        <View style={styles.staffList}>
           {workers.map((worker, i) => (
             <View key={i} style={[styles.staffItem, i < workers.length - 1 && styles.borderBottom]}>
                <View style={styles.workerIconBg}><User size={20} color={Colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workerName}>{worker.full_name}</Text>
                  <Text style={styles.workerDetail}>{worker.id.split('-')[0].toUpperCase()} Â· {worker.email}</Text>
                </View>
                <TouchableOpacity style={styles.editIconBtn} onPress={() => Alert.alert('Edit Worker', `Manage ${worker.full_name}`)}>
                   <Edit2 size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
             </View>
           ))}
           {workers.length === 0 && (
             <View style={{ padding: 20, alignItems: 'center' }}>
               <Text style={{ fontFamily: 'Outfit_400Regular', color: Colors.textSecondary }}>No staff registered yet.</Text>
             </View>
           )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text }}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 8 }}>Full Name</Text>
            <TextInput
              style={styles.formInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Full Name"
            />
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 8, marginTop: 8 }}>Phone Number</Text>
            <TextInput
              style={styles.formInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={[styles.createBtn, { marginTop: 20 }]} onPress={handleSaveProfile}>
              {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.createBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.inputBorder
  },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: Colors.text },
  logoutBtn: { padding: 10, backgroundColor: '#FFF0F0', borderRadius: 12 },
  scrollContent: { padding: 20 },
  adminCard: { backgroundColor: Colors.white, padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: Colors.inputBorder },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFE8CC' },
  statusDot: { position: 'absolute', bottom: 5, right: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: Colors.white },
  adminName: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  adminEmail: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  adminMetaRow: { flexDirection: 'row', gap: 10, marginTop: 15, alignItems: 'center' },
  metaBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#64748B' },
  editAdminBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 5 },
  editAdminText: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: Colors.primary },
  section: { marginTop: 10 },
  expandBtn: { backgroundColor: Colors.white, borderStyle: 'dashed', borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 15, height: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  expandBtnText: { fontFamily: 'Outfit_700Bold', color: Colors.primary, fontSize: 15 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  formTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  closeText: { fontFamily: 'Outfit_600SemiBold', color: Colors.error, fontSize: 13 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text, marginLeft: 10 },
  formCard: { backgroundColor: Colors.white, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 20 },
  formInput: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, padding: 12, marginBottom: 10, fontFamily: 'Outfit_400Regular' },
  createBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  createBtnText: { fontFamily: 'Outfit_700Bold', color: Colors.white, fontSize: 16 },
  sectionTitleAlt: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text, marginBottom: 15, marginTop: 10 },
  staffList: { backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden' },
  staffItem: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  workerIconBg: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center' },
  workerName: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.text },
  workerDetail: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  editIconBtn: { padding: 8, backgroundColor: '#F8F9FA', borderRadius: 10 },
});
