import React from 'react';
import { Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Lock, Info, Landmark, Smartphone, MoreHorizontal, X } from 'lucide-react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar, Alert, Modal, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, showPopup, smartCardBalance, rechargeSmartCard } = useAppContext();
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Top Up States
  const [showTopUp, setShowTopUp] = React.useState(false);
  const [rechargeAmount, setRechargeAmount] = React.useState('');
  const [payMethod, setPayMethod] = React.useState('upi'); // 'upi', 'card', 'netbank'
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const handleTopUpConfirm = async () => {
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt < 10) {
        Alert.alert("Invalid Amount", "Minimum recharge is ₹10");
        return;
    }
    
    // 💳 UPI Intent Configuration
    const upiId = "animatorjishnu.007@okhdfcbank"; 
    const name = "DineXpress Wallet Recharge";
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;

    setProcessing(true);
    try {
        if (payMethod === 'upi') {
            const canOpen = await Linking.canOpenURL(upiUrl);
            if (canOpen || Platform.OS === 'android') {
                await Linking.openURL(upiUrl);
                
                // Show a verification popup to simulate payment approval
                showPopup({
                    type: 'checkout',
                    message: `Waiting for Payment Confirmation for ₹${amt}...`,
                    primaryBtnText: 'Payment Successful ✅',
                    secondaryBtnText: 'Payment Failed ❌',
                    onPrimaryPress: async () => {
                        await rechargeSmartCard(amt);
                        setShowTopUp(false);
                        setRechargeAmount('');
                        fetchHistory();
                        showPopup({ type: 'success', message: `₹${amt} added successfully! 🎉` });
                    },
                    onSecondaryPress: () => showPopup({ type: 'toast', message: 'Recharge Cancelled' })
                });
            } else {
                throw new Error("No UPI apps found on this device.");
            }
        } else {
            // Simulate Card/Netbank Gateway friction
            setTimeout(async () => {
                await rechargeSmartCard(amt);
                setShowTopUp(false);
                setRechargeAmount('');
                fetchHistory();
                showPopup({ type: 'success', message: `₹${amt} added successfully! 💳` });
                setProcessing(false);
            }, 2000);
            return;
        }
    } catch (err) {
        Alert.alert("Payment Gateway Error", err.message);
    } finally {
        setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Record Logout Event 
      if (user) {
        await supabase.from('user_logs').insert([
            { user_id: user.id || null, email: user.email, event_type: 'logout' }
        ]);
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const menuItems = [
    { title: 'Payment Methods', icon: CreditCard, route: '/payment-methods' },
    { title: 'Privacy & Security', icon: Lock, route: '/privacy-security' },
    { title: 'Notifications', icon: Bell, route: '/notifications' },
    { title: 'Settings', icon: Settings, route: '/settings' },
    { title: 'Help & Support', icon: HelpCircle, route: '/help' },
    { title: 'About DineXpress', icon: Info, route: '/about' },
  ];

  const renderAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatarLarge} />;
    }
    return <Image source={require('../../Images/Gokulraj.jpeg')} style={styles.avatarLarge} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {renderAvatar()}
          <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* RFID Smart Card Section */}
        <View style={styles.rfidCard}>
          <View style={styles.rfidHeader}>
             <View style={styles.rfidInfo}>
               <CreditCard size={20} color="#FFF" />
               <Text style={styles.rfidTitle}>RFID Smart Card</Text>
             </View>
             <Text style={styles.rfidBrand}>DineXpress</Text>
          </View>
          <Text style={styles.rfidBalanceLabel}>Current Balance</Text>
          <Text style={styles.rfidBalance}>₹ {(smartCardBalance || 0).toFixed(2)}</Text>
          <View style={styles.rfidFooter}>
             <Text style={styles.rfidNumber}>**** **** **** 9928</Text>
             <TouchableOpacity style={styles.rechargeBtn} onPress={() => setShowTopUp(true)}>
                <Text style={styles.rechargeText}>Top Up</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Top Up Modal UI */}
        <Modal visible={showTopUp} transparent animationType="slide">
           <View style={styles.modalOverlay}>
              <View style={styles.topUpContent}>
                 <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Smart Card Top Up</Text>
                    <TouchableOpacity onPress={() => setShowTopUp(false)}>
                       <X size={24} color={Colors.text} />
                    </TouchableOpacity>
                 </View>

                 <Text style={styles.inputLabel}>Enter Amount (₹)</Text>
                 <View style={styles.amountInputContainer}>
                    <Text style={styles.currencyPrefix}>₹</Text>
                    <TextInput 
                        style={styles.amountInput}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={rechargeAmount}
                        onChangeText={setRechargeAmount}
                        autoFocus
                    />
                 </View>

                 <Text style={styles.inputLabel}>Select Payment Method</Text>
                 <View style={styles.methodList}>
                    {[
                        { id: 'upi', label: 'UPI (GPay/PhonePe)', icon: Smartphone },
                        { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                        { id: 'netbank', label: 'Net Banking', icon: Landmark }
                    ].map(m => (
                        <TouchableOpacity 
                            key={m.id} 
                            style={[styles.methodItem, payMethod === m.id && styles.methodItemSelected]}
                            onPress={() => setPayMethod(m.id)}
                        >
                           <View style={styles.methodLeft}>
                              <m.icon size={20} color={payMethod === m.id ? Colors.primary : Colors.textSecondary} />
                              <Text style={[styles.methodLabel, payMethod === m.id && styles.methodLabelSelected]}>{m.label}</Text>
                           </View>
                           {payMethod === m.id && <View style={styles.selectedDot} />}
                        </TouchableOpacity>
                    ))}
                 </View>

                 <TouchableOpacity 
                    style={[styles.confirmBtn, (!rechargeAmount || processing) && { opacity: 0.5 }]} 
                    onPress={handleTopUpConfirm}
                    disabled={!rechargeAmount || processing}
                 >
                    {processing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmBtnText}>Pay & Recharge Now</Text>}
                 </TouchableOpacity>
              </View>
           </View>
        </Modal>

        {/* Recent Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={fetchHistory}>
               <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>No recent transactions found.</Text>
            </View>
          ) : (
            history.map((item, idx) => (
              <View key={idx} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: item.amount > 0 ? '#E1F8ED' : '#FEE2E2' }]}>
                   <CreditCard size={14} color={item.amount > 0 ? '#059669' : '#DC2626'} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityDesc}>{item.description}</Text>
                  <Text style={styles.activityDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.activityAmount, { color: item.amount > 0 ? '#059669' : '#DC2626' }]}>
                  {item.amount > 0 ? '+' : ''}₹ {Math.abs(item.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => item.route !== '#' ? router.push(item.route) : null}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Icon size={20} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color={Colors.inputBorder} />
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => {
            showPopup({
                type: 'logout',
                message: 'Are you sure you want to logout?',
                primaryBtnText: 'Logout',
                secondaryBtnText: 'Cancel',
                onPrimaryPress: handleLogout
            });
        }}>
          <LogOut size={20} color={Colors.error} style={{marginRight: 10}}/>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    backgroundColor: Colors.white, 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.inputBorder 
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: Colors.inputBg,
  },
  profileName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: Colors.text,
  },
  profileEmail: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 15 },
  activitySection: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.inputBorder },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  activityTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  refreshText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.primary },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityDesc: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.text },
  activityDate: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary },
  activityAmount: { fontFamily: 'Outfit_700Bold', fontSize: 15 },
  emptyActivity: { padding: 10, alignItems: 'center' },
  emptyText: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary },
  editButton: {
    backgroundColor: '#FFE8CC',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    color: Colors.primary,
    fontSize: 14,
  },
  rfidCard: {
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  rfidHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  rfidInfo: { flexDirection: 'row', alignItems: 'center' },
  rfidTitle: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 13, marginLeft: 10 },
  rfidBrand: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit_700Bold', fontSize: 13 },
  rfidBalanceLabel: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit_400Regular', fontSize: 12 },
  rfidBalance: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 32, marginVertical: 8 },
  rfidFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  rfidNumber: { color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  rechargeBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  rechargeText: { color: Colors.primary, fontFamily: 'Outfit_700Bold', fontSize: 13 },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#FFF0F0',
    padding: 15,
    borderRadius: 15,
  },
  logoutText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.error,
  },
  // New Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  topUpContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  inputLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 25,
  },
  currencyPrefix: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    height: 60,
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.text,
  },
  methodList: {
    marginBottom: 30,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: 10,
  },
  methodItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
  },
  methodLabelSelected: {
    color: Colors.primary,
    fontFamily: 'Outfit_700Bold',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: 'Outfit_700Bold',
    color: '#FFF',
    fontSize: 16,
  }
});
