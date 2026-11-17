import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Pressable, ScrollView, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [regRole, setRegRole] = useState('student'); // 'student' or 'worker'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Basic Validation
    const validate = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (name.length < 3) return "Name must be at least 3 characters.";
        if (!emailRegex.test(email)) return "Please enter a valid email address.";
        if (phone.length < 10) return "Phone number must be at least 10 digits.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        return null;
    };

    const handleRegister = async () => {
        const errorMsg = validate();
        if (errorMsg) {
            Alert.alert("Validation Error", errorMsg);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    phone_number: phone,
                    role: regRole,
                }
            }
        });

        if (error) {
            Alert.alert("Registry Failed", error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            // 📜 Log Signup Event
            await supabase.from('user_logs').insert([{ 
                user_id: data.user.id, 
                email: email, 
                event_type: 'signup',
                created_at: new Date().toISOString()
            }]);

            Alert.alert("Success", "Account created! Please check your email for confirmation.", [
                { text: "Go to Login", onPress: () => router.replace('/login') }
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>{regRole === 'student' ? 'Student Registration' : 'Worker Registration'}</Text>
                    <Text style={styles.subtitle}>Join the Nandha Smart Canteen Community</Text>
                </View>

                {/* Role Selector Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, regRole === 'student' && styles.activeTab]} 
                        onPress={() => setRegRole('student')}
                    >
                        <Text style={[styles.tabText, regRole === 'student' && styles.activeTabText]}>Student</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, regRole === 'worker' && styles.activeTab]} 
                        onPress={() => setRegRole('worker')}
                    >
                        <Text style={[styles.tabText, regRole === 'worker' && styles.activeTabText]}>Worker</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <User size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={Colors.placeholder}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor={Colors.placeholder}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Phone size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor={Colors.placeholder}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={10}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Create Password (6+ characters)"
                            placeholderTextColor={Colors.placeholder}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.togglePassword}>
                            {showPassword ? <EyeOff size={20} color={Colors.textSecondary} /> : <Eye size={20} color={Colors.textSecondary} />}
                        </Pressable>
                    </View>

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.registerButtonText}>Register</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.replace('/login')}>
                        <Text style={styles.footerLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    scrollContent: { 
        paddingHorizontal: 30, 
        paddingBottom: 40, 
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20 
    },
    backBtn: { marginBottom: 20, width: 40, height: 40, justifyContent:'center' },
    header: { marginBottom: 30 },
    title: { fontSize: 28, fontFamily: 'Outfit_700Bold', color: Colors.text, marginBottom: 8 },
    subtitle: { fontSize: 14, fontFamily: 'Outfit_400Regular', color: Colors.textSecondary },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.inputBg,
        padding: 5,
        borderRadius: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: Colors.inputBorder,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.primary,
    },
    form: { marginBottom: 30 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: '100%', fontFamily: 'Outfit_400Regular', color: Colors.text, fontSize: 15 },
    togglePassword: { padding: 5 },
    registerButton: { backgroundColor: Colors.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    registerButtonText: { color: Colors.white, fontSize: 16, fontFamily: 'Outfit_700Bold' },
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { fontFamily: 'Outfit_400Regular', color: Colors.textSecondary, fontSize: 14 },
    footerLink: { fontFamily: 'Outfit_700Bold', color: Colors.primary, fontSize: 14 }
});
