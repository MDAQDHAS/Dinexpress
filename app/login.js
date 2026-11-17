import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Colors from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const { setUser } = useAppContext();
    const [loginRole, setLoginRole] = useState('student'); // 'student' or 'worker'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // ... (previous useEffect omit)
    useEffect(() => {
        checkConnectivity();
        const handleDeepLink = (event) => {
            const { url } = event;
            if (url && url.includes('google-auth')) {
                checkSession();
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    }, []);

    const checkConnectivity = async () => {
        try {
            const { error } = await supabase.from('products').select('id').limit(1);
            if (error) {
                console.warn("Backend Sync Issue:", error.message);
            }
        } catch (e) {
            console.error("Connection error:", e);
        }
    };

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch role from profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                
                const userData = { ...session.user, role: profile?.role || 'student' };
                setUser(userData);
                navigateUser(userData);
            }
        } catch (e) {
            console.error("Session check failed", e);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const redirectUrl = Linking.createURL('google-auth');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            Alert.alert("OAuth Error", error.message);
            setLoading(false);
            return;
        }

        if (data?.url) {
            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            if (res.type === 'success') {
                checkSession();
            }
        }
        setLoading(false);
    };

    const navigateUser = (userData) => {
        const email = userData.email.toLowerCase();
        if (email.endsWith('.edu.in')) {
            router.replace('/(admin)');
        } else if (email.endsWith('@gmail.com')) {
            router.replace('/(worker)');
        } else {
            router.replace('/(tabs)');
        }
    };

    const handleLogin = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (password.length < 1) {
            Alert.alert("Missing Password", "Please enter your password.");
            return;
        }

        setLoading(true);

        // Developmental Bypass 
        if (email.endsWith('.edu.in') && password === 'admin123') {
            const userData = { email, role: 'admin' };
            
            // Log the event AND ensure profile exists in DB
            try {
                await supabase.from('user_logs').insert([{ email, event_type: 'login-bypass' }]);
                await supabase.from('profiles').upsert([
                    { email: email, full_name: 'Admin Master', role: 'admin', last_login: new Date().toISOString() }
                ], { onConflict: 'email' });
            } catch (e) { console.error(e); }

            setUser(userData);
            navigateUser(userData);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            const isGrantError = error.message.toLowerCase().includes('granting user');
            Alert.alert(
                isGrantError ? "Database Handshake Error" : "Login Failed", 
                isGrantError ? "Please run the 'Permission Reset' SQL script in your Supabase Editor." : error.message
            );
            setLoading(false);
            return;
        }

        if (data.user) {
            const emailLower = data.user.email.toLowerCase();
            let role = 'student';
            if (emailLower.endsWith('.edu.in')) role = 'admin';
            else if (emailLower.endsWith('@gmail.com')) role = 'worker';

            const userData = { ...data.user, role };
            try {
                await recordEvent(data.user.id, data.user.email, 'login');
                await supabase.from('profiles').upsert({ id: data.user.id, last_login: new Date().toISOString() }, { onConflict: 'id' });
            } catch (e) {
                console.warn("Post-login sync skipped:", e.message);
            }
            setUser(userData);
            setLoading(false);
            navigateUser(userData);
        }
    };

    const recordEvent = async (userId, email, type) => {
        try {
            await supabase.from('user_logs').insert([
                { user_id: userId, email: email, event_type: type }
            ]);
        } catch (e) {
            console.error('Logging Error:', e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.logoContainer, loginRole === 'worker' && { backgroundColor: '#E1F8ED' }]}>
                        <Image source={require('../Images/Logo.jpeg')} style={styles.logo} />
                    </View>
                    <Text style={styles.title}>DineXpress</Text>
                    <Text style={styles.subtitle}>
                        {loginRole === 'student' ? 'Smart Canteen Student Console' : 'Cafeteria Staff Management Portal'}
                    </Text>
                </View>

                <View style={styles.form}>
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
                        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={Colors.placeholder}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.togglePassword}>
                            {showPassword ? <EyeOff size={20} color={Colors.textSecondary} /> : <Eye size={20} color={Colors.textSecondary} />}
                        </Pressable>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.loginButtonText}>Login</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                </View>

                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.googleIcon} />
                    <Text style={styles.googleText}>Sign in with Google</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    {loginRole === 'worker' && (
                        <TouchableOpacity onPress={() => router.push('/(admin)')} style={styles.adminAccessBtn}>
                            <Text style={styles.adminAccessText}>Access Admin Console</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>New here? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.footerLink}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    logoContainer: { width: 90, height: 90, borderRadius: 20, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    logo: { width: 70, height: 70, borderRadius: 10 },
    title: { fontSize: 32, fontFamily: 'Outfit_700Bold', color: Colors.text },
    subtitle: { fontSize: 14, fontFamily: 'Outfit_400Regular', color: Colors.textSecondary },
    form: { marginBottom: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: '100%', fontFamily: 'Outfit_400Regular', color: Colors.text, fontSize: 15 },
    togglePassword: { padding: 5 },
    loginButton: { backgroundColor: Colors.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    loginButtonText: { color: Colors.white, fontSize: 16, fontFamily: 'Outfit_700Bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    divider: { flex: 1, height: 1, backgroundColor: Colors.inputBorder },
    dividerText: { marginHorizontal: 10, fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#AAA' },
    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: '#DDD', borderRadius: 15, height: 55 },
    googleIcon: { width: 22, height: 22, marginRight: 12 },
    googleText: { fontFamily: 'Outfit_600SemiBold', color: Colors.text, fontSize: 16 },
    footerLink: { fontFamily: 'Outfit_700Bold', color: Colors.primary, fontSize: 14 },
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
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 14,
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.primary,
    },
    footer: { marginTop: 30 },
    footerRow: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { fontFamily: 'Outfit_400Regular', color: Colors.textSecondary, fontSize: 14 },
    adminAccessBtn: { 
        backgroundColor: '#F8FAFC', 
        borderWidth: 1, 
        borderColor: Colors.inputBorder, 
        paddingVertical: 12, 
        paddingHorizontal: 25, 
        borderRadius: 15, 
        marginBottom: 20,
        width: '100%',
        alignItems: 'center'
    },
    adminAccessText: { fontFamily: 'Outfit_700Bold', color: Colors.text, fontSize: 15 },
});
