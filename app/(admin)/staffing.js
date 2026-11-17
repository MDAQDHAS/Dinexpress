import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, UserPlus, Mail, Phone, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

export default function StaffingScreen() {
    const router = useRouter();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'worker');
        
        if (!error && data) {
            setWorkers(data);
        }
        setLoading(false);
    };

    const renderWorker = ({ item }) => (
        <View style={styles.workerCard}>
            <Image 
                source={require('../../Images/Gokulraj.jpeg')} 
                style={styles.workerAvatar} 
            />
            <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.full_name || 'Staff Member'}</Text>
                <View style={styles.detailRow}>
                    <Mail size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{item.email}</Text>
                </View>
                <View style={styles.detailRow}>
                    <ShieldCheck size={14} color={Colors.primary} />
                    <Text style={[styles.detailText, { color: Colors.primary, fontFamily: 'Outfit_700Bold' }]}>
                        Verified Kitchen Staff
                    </Text>
                </View>
            </View>
        </View>
    );

    const [modalVisible, setModalVisible] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');

    const handleAddUser = async () => {
        if (!newEmail || !newName) {
            alert('Please fill all fields');
            return;
        }
        setLoading(true);
        // In a real app, this would use a service role or edge function to create a user.
        // For the demo, we insert into profiles and assume the user will sign up/be signed up.
        const { error } = await supabase.from('profiles').insert([
            { email: newEmail, full_name: newName, role: 'worker' }
        ]);

        if (error) alert(error.message);
        else {
            alert('Staff member added successfully!');
            setModalVisible(false);
            fetchStaff();
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Staff Management</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <UserPlus size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Staff</Text>
                        <TextInput 
                            placeholder="Full Name" 
                            style={styles.input} 
                            value={newName} 
                            onChangeText={setNewName} 
                        />
                        <TextInput 
                            placeholder="Email (Must be @gmail.com)" 
                            style={styles.input} 
                            value={newEmail} 
                            onChangeText={setNewEmail} 
                            autoCapitalize="none"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleAddUser}>
                                <Text style={styles.confirmBtnText}>Add Worker</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={workers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderWorker}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No workers registered yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingVertical: 15, 
        backgroundColor: Colors.white, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.inputBorder 
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold', color: Colors.text },
    addBtn: { backgroundColor: Colors.primary, padding: 8, borderRadius: 10 },
    list: { padding: 20 },
    workerCard: { 
        flexDirection: 'row', 
        backgroundColor: Colors.white, 
        padding: 15, 
        borderRadius: 16, 
        marginBottom: 15, 
        borderWidth: 1, 
        borderColor: Colors.inputBorder,
        alignItems: 'center'
    },
    workerAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    workerInfo: { flex: 1 },
    workerName: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: Colors.text, marginBottom: 4 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
    detailText: { fontSize: 13, fontFamily: 'Outfit_400Regular', color: Colors.textSecondary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontFamily: 'Outfit_400Regular', color: Colors.textSecondary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
    modalTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 10, marginBottom: 15, fontFamily: 'Outfit_400Regular' },
    modalButtons: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, padding: 12, alignItems: 'center' },
    cancelBtnText: { color: Colors.textSecondary, fontFamily: 'Outfit_600SemiBold' },
    confirmBtn: { flex: 2, backgroundColor: Colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
    confirmBtnText: { color: '#FFF', fontFamily: 'Outfit_700Bold' },
});
