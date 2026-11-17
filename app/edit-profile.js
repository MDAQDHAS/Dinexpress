import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronLeft, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser, showPopup } = useAppContext();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone_number || '');
  const [college, setCollege] = useState(user?.user_metadata?.college || 'Nandha Engineering College');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone_number || '');
      setCollege(user.user_metadata?.college || 'Nandha Engineering College');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error picking image', error.message);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setUploading(true);
      
      const fileName = uri.split('/').pop();
      const fileExt = fileName.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: fileName,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      });

      // 1. Storage Upload
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, formData);

      if (uploadError) {
          console.error("Storage Error:", uploadError);
          throw new Error(`Storage Failed: ${uploadError.message}`);
      }

      // 2. Get URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // 3. Update Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      if (authError) throw new Error(`Auth Update Failed: ${authError.message}`);

      // 4. Update Database Table
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (dbError) throw new Error(`Database Update Failed: ${dbError.message}`);
      
      await refreshUser();
      showPopup({ type: 'toast', message: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Final Upload error:', error);
      Alert.alert('Update Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Update Auth Metadata (for the current session)
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          phone_number: phone,
          college: college
        }
      });
      if (authError) throw authError;

      // 2. FORCE UPDATE the database table (profiles)
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          // avatar_url is already handled by uploadAvatar, but we sync it just in case
        })
        .eq('id', user.id);
      
      if (dbError) throw dbError;

      await refreshUser();

      showPopup({
          type: 'success',
          message: 'Profile updated in database!',
          primaryBtnText: 'Done',
          onPrimaryPress: () => router.back()
      });
    } catch (error) {
      Alert.alert('Save Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAvatar = () => {
    if (avatarUrl) {
      return <Image source={{ uri: avatarUrl }} style={styles.avatar} />;
    }
    return <Image source={require('../Images/Gokulraj.jpeg')} style={styles.avatar} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {renderAvatar()}
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color={Colors.white} />
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage} disabled={uploading}>
              <Camera size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={fullName} 
              onChangeText={setFullName}
              placeholder="Enter full name" 
              placeholderTextColor={Colors.placeholder} 
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={[styles.input, { opacity: 0.6 }]} 
              value={email} 
              editable={false}
              placeholder="Email address" 
              placeholderTextColor={Colors.placeholder} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput 
              style={styles.input} 
              value={phone} 
              onChangeText={setPhone}
              keyboardType="phone-pad" 
              placeholder="Enter phone number" 
              placeholderTextColor={Colors.placeholder} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College / Department</Text>
            <TextInput 
              style={styles.input} 
              value={college} 
              onChangeText={setCollege}
              placeholder="Enter college/department" 
              placeholderTextColor={Colors.placeholder} 
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading || uploading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    zIndex: 10,
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
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.inputBg,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  formSection: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.inputBg,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
