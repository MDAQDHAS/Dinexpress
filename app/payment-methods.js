import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Linking, Platform, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard, Landmark, Plus, ScanLine, Wallet } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const totalAmount = parseFloat(params.total || "0.00");
  const { placeOrder, showPopup, smartCardBalance, cartItems, clearCart, setSmartCardBalance } = useAppContext();
  
  const [selectedMethod, setSelectedMethod] = useState('rfid');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUPIPayment = async () => {
    // 💳 UPI Configuration
    const upiId = "animatorjishnu.007@okhdfcbank"; 
    const name = "DineXpress Canteen";
    const transactionNote = `Canteen Order ${cartItems.length} items`;
    
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${totalAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;

    try {
      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen || Platform.OS === 'android') {
        await Linking.openURL(upiUrl);
        // After launching UPI, show our verification modal
        setShowUPIModal(true);
      } else {
        Alert.alert("Error", "No UPI apps found.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to launch payment app.");
    }
  };

  const finalizeOrder = async (initialStatus = 'pending') => {
    if (selectedMethod === 'upi') {
      setIsVerifying(true);
      // ⏳ Convincing Fake Verification Delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      setIsVerifying(false);
    }

    setLoading(true);
    try {
      const itemsSummary = cartItems.map(i => `${i.name} x${i.quantity}`).join(', ') + 
                          (transactionId ? ` (TXN: ${transactionId})` : '');
      
      const order = await placeOrder({
          itemsSummary: itemsSummary,
          totalAmount: totalAmount,
          paymentMethod: selectedMethod,
          status: initialStatus
      });

      clearCart();
      setLoading(false);
      setTransactionId('');
      setShowUPIModal(false);
      
      showPopup({
        type: 'success',
        message: 'Order placed successfully 🎉',
        primaryBtnText: 'Track Order',
        secondaryBtnText: 'Go Home',
        onPrimaryPress: () => router.push('/(tabs)/orders'),
        onSecondaryPress: () => router.replace('/(tabs)')
      });
    } catch (error) {
      setLoading(false);
      Alert.alert("Payment Failed", error.message || "Something went wrong.");
    }
  };

  const handleSmartCardPayment = async () => {
    if (smartCardBalance < totalAmount) {
      Alert.alert("Insufficient Balance", "Please recharge your RFID Smart Card from the Profile section.");
      return;
    }
    
    setLoading(true);
    try {
        const itemsSummary = cartItems.map(i => `${i.name} x${i.quantity}`).join(', ');
        const order = await placeOrder({
            itemsSummary: itemsSummary,
            total_amount: totalAmount,
            paymentMethod: 'rfid_tap',
            status: 'pending'
        });

        setLoading(false);
        showPopup({
            type: 'checkout',
            message: '⚡ ORDER CREATED!\nPLEASE TAP YOUR RFID CARD NOW TO PAY.',
            primaryBtnText: 'Waiting for Tap...',
            secondaryBtnText: 'Cancel Payment',
            onSecondaryPress: () => showPopup({ type: 'toast', message: 'Payment Cancelled' })
        });
    } catch (error) {
        setLoading(false);
        Alert.alert("Order Error", error.message);
    }
  };

  const handleConfirm = () => {
    if (selectedMethod === 'rfid') {
      handleSmartCardPayment();
    } else if (selectedMethod === 'upi') {
      handleUPIPayment();
    } else {
      finalizeOrder();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Payable Amount</Text>
          <Text style={styles.amountValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Smart RFID System (Nandha Special)</Text>
        
        <TouchableOpacity 
          style={[styles.payOption, selectedMethod === 'rfid' && styles.payOptionActive]} 
          onPress={() => setSelectedMethod('rfid')}
        >
          <View style={styles.optionLeft}>
            <View style={styles.iconBox}>
              <CreditCard size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.optionTitle}>DineXpress Smart Card</Text>
              <Text style={[styles.optionSub, { color: smartCardBalance < totalAmount ? Colors.error : Colors.textSecondary }]}>
                Available: ₹ {smartCardBalance.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={[styles.radio, selectedMethod === 'rfid' && styles.radioActive]} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Other Online Payments</Text>

        <TouchableOpacity 
          style={[styles.payOption, selectedMethod === 'upi' && styles.payOptionActive]} 
          onPress={() => setSelectedMethod('upi')}
        >
          <View style={styles.optionLeft}>
            <View style={styles.iconBox}>
              <Wallet size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.optionTitle}>UPI Payment</Text>
              <Text style={styles.optionSub}>GPay, PhonePe, PayTM</Text>
            </View>
          </View>
          <View style={[styles.radio, selectedMethod === 'upi' && styles.radioActive]} />
        </TouchableOpacity>



      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.confirmText}>Confirm Payment ₹ {totalAmount.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
      {/* UPI Verification Modal */}
      <Modal visible={showUPIModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isVerifying ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[styles.modalTitle, { marginTop: 20 }]}>Verifying Payment...</Text>
                <Text style={styles.modalSub}>Connecting to NPCI Secure Servers</Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>Verify UPI Payment</Text>
                <Text style={styles.modalSub}>Please enter the last 4 digits of your UPI Transaction ID to confirm payment.</Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: 8274"
                  keyboardType="number-pad"
                  maxLength={4}
                  value={transactionId}
                  onChangeText={setTransactionId}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => setShowUPIModal(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalConfirm, transactionId.length < 4 && { opacity: 0.5 }]} 
                    onPress={() => finalizeOrder('unverified')}
                    disabled={transactionId.length < 4}
                  >
                    <Text style={styles.modalConfirmText}>Confirm Order</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    backgroundColor: Colors.white, 
    elevation: 4 
  },
  backButton: { padding: 5 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  scrollContent: { padding: 20 },
  amountCard: { alignItems: 'center', backgroundColor: Colors.white, padding: 20, borderRadius: 15, marginBottom: 25, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 5 },
  amountLabel: { fontFamily: 'Outfit_400Regular', color: Colors.textSecondary, marginBottom: 5 },
  amountValue: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: Colors.primary },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text, marginBottom: 15, marginTop: 10 },
  payOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  payOptionActive: { borderColor: Colors.primary, backgroundColor: '#FFF8F0' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.text },
  optionSub: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD' },
  radioActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  footer: { padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#EEE' },
  confirmBtn: { backgroundColor: Colors.primary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: Colors.white, fontFamily: 'Outfit_700Bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: Colors.white, borderRadius: 20, padding: 25 },
  modalTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text, marginBottom: 10 },
  modalSub: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  modalInput: { backgroundColor: '#F0F0F0', height: 50, borderRadius: 10, paddingHorizontal: 15, fontSize: 18, fontFamily: 'Outfit_700Bold', color: Colors.primary, marginBottom: 25, letterSpacing: 5, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 15 },
  modalCancel: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#DDD' },
  modalCancelText: { fontFamily: 'Outfit_600SemiBold', color: Colors.textSecondary },
  modalConfirm: { flex: 1, height: 50, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  modalConfirmText: { fontFamily: 'Outfit_700Bold', color: Colors.white },
});
