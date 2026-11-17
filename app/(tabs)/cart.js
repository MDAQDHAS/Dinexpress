import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Plus, Minus, CreditCard, Banknote, Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, addPoints, showPopup } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredItems = cartItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subTotal;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    showPopup({
        type: 'checkout',
        message: 'Proceeding to checkout…',
        primaryBtnText: 'Checkout',
        secondaryBtnText: 'Back',
        onPrimaryPress: () => {
            addPoints(10);
            router.push({ pathname: '/payment-methods', params: { total: grandTotal.toFixed(2) } });
        }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={{color: Colors.error, fontFamily: 'Outfit_600SemiBold'}}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search items in cart..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.placeholder}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredItems.length === 0 ? (
          <View style={{alignItems:'center', marginTop: 50}}>
            <Text style={{fontFamily: 'Outfit_600SemiBold', color: Colors.textSecondary, fontSize: 16}}>
                {searchQuery ? 'No matching items found.' : 'Your cart is empty.'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹ {item.price}</Text>
              </View>
              <View style={styles.actionContainer}>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                    <Minus size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity style={[styles.qtyBtn, {backgroundColor: Colors.primary}]} onPress={() => updateQuantity(item.id, 1)}>
                    <Plus size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Bill Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sub Total</Text>
            <Text style={styles.summaryValue}>₹ {subTotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹ {grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <View style={styles.checkoutLeft}>
           <Text style={styles.totalLabelSmall}>Total</Text>
           <Text style={styles.checkoutPrice}>₹ {grandTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={[styles.checkoutBtn, cartItems.length === 0 && {backgroundColor: Colors.textSecondary}]} onPress={handleCheckout} disabled={cartItems.length === 0}>
          <Text style={styles.checkoutBtnText}>Pay Now</Text>
          <Banknote size={20} color={Colors.white} style={{marginLeft: 10}}/>
        </TouchableOpacity>
      </View>
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
  cartItem: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.text },
  itemPrice: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.primary, marginTop: 5 },
  actionContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  qtyBtn: { backgroundColor: '#EEEEEE', padding: 5, borderRadius: 8 },
  qtyText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, marginHorizontal: 10 },
  summaryContainer: { backgroundColor: Colors.white, borderRadius: 15, padding: 20, marginTop: 10, borderWidth: 1, borderColor: Colors.inputBorder },
  summaryTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text, marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.inputBorder, paddingTop: 15, marginTop: 5, marginBottom: 0 },
  totalLabel: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  totalValue: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.primary },
  checkoutContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.inputBorder },
  checkoutLeft: { justifyContent: 'center' },
  totalLabelSmall: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary },
  checkoutPrice: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: Colors.text },
  checkoutBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  checkoutBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.white },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.text,
  },
});
