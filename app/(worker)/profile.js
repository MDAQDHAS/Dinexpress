import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Shield, HelpCircle, Bell, ChevronRight, Settings } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../context/AppContext';

import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';

export default function WorkerProfile() {
  const router = useRouter();
  const { user, setUser, showPopup, refreshUser } = useAppContext();
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    try {
      if (user) {
        await supabase.from('user_logs').insert([{ 
            user_id: user.id, email: user.email, event_type: 'logout', created_at: new Date().toISOString() 
        }]);
      }
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
  };

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (image) => {
    setUploading(true);
    try {
      const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(image.base64), { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update DB
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      await refreshUser(); // Sync AppContext
      showPopup({ type: 'toast', message: 'Profile picture updated! ✅' });

    } catch (err) {
      console.error(err);
      showPopup({ type: 'toast', message: 'Upload failed âŒ' });
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    { icon: User,        label: 'Staff Information',  sub: `ID: ${user?.employee_id || 'WD-' + user?.id?.slice(0,4)} Â· Verified`, route: null },
    { icon: Bell,        label: 'Staff Alerts',       sub: 'Order & queue updates',          route: '/worker-notif' },
    { icon: HelpCircle,  label: 'Admin Support',      sub: 'Contact Canteen Master',        route: null },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Worker Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickAvatar} disabled={uploading}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={user?.avatar_url ? { uri: user.avatar_url } : { uri: 'https://ui-avatars.com/api/?name=' + (user?.full_name || 'Staff') }} 
                style={[styles.avatar, uploading && { opacity: 0.5 }]} 
              />
              {uploading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
              <View style={styles.editIcon}>
                <Settings size={12} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{user?.full_name || user?.email?.split('@')[0] || 'Staff Member'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.department || 'Kitchen Staff'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }]}
                onPress={() => item.route && router.push(item.route)}
                disabled={!item.route}
              >
                <View style={styles.menuIconBg}>
                  <Icon size={20} color={Colors.primary} />
                </View>
                <View style={styles.menuTextSection}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                {item.route && <ChevronRight size={18} color={Colors.textSecondary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout from Staff Console</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DineXpress Staff v2.1.0 (PRO)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
    alignItems: 'center'
  },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  scrollContent: { padding: 20 },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.inputBorder
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarWrapper: { position: 'relative' },
  loader: { position: 'absolute', top: 25, left: 25, zIndex: 10 },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white },
  profileInfo: { marginLeft: 20 },
  nameText: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  roleBadge: { backgroundColor: '#FFF5E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginTop: 5, borderWidth: 1, borderColor: '#FFE8CC' },
  roleText: { color: Colors.primary, fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  menuContainer: { backgroundColor: Colors.white, borderRadius: 20, padding: 5, borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  menuIconBg: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuTextSection: { flex: 1 },
  menuLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  menuSub: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#FFE5E5', gap: 10 },
  logoutText: { color: Colors.error, fontFamily: 'Outfit_700Bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#CCC', fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 20 },
});
