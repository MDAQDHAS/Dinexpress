import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Clock, CheckCircle, Search, X } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';

export default function OrdersScreen() {
  const { activeOrders, cancelOrder, fetchMyOrders } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const allOrders = activeOrders;

  const filteredOrders = allOrders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by ID or items..."
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
        {filteredOrders.length === 0 ? (
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{fontFamily: 'Outfit_600SemiBold', color: Colors.textSecondary}}>
              {searchQuery ? 'No matching orders.' : 'No orders found.'}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order, index) => {
            const isCompleted = order.status === 'completed' || order.status === 'ready';
            const isPending = order.status === 'pending';
            const statusColor = isCompleted ? '#22C55E' : (isPending ? Colors.primary : '#F59E0B');
            const Icon = isCompleted ? CheckCircle : Clock;

            return (
              <TouchableOpacity key={index} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, {backgroundColor: statusColor + '20'}]}>
                    <Icon size={14} color={statusColor} style={{marginRight: 5}}/>
                    <Text style={[styles.statusText, {color: statusColor}]}>
                      {order.status.toLowerCase() === 'unverified' ? 'Awaiting Payment Verification' :
                       order.status.toLowerCase() === 'pending' ? 'Awaiting Acceptance' :
                       order.status.toLowerCase() === 'accepted' ? 'Preparing Your Food' :
                       order.status.toLowerCase() === 'preparing' ? 'Cooking Now' :
                       order.status.toLowerCase() === 'ready' ? 'Your Order is Ready!' :
                       order.status.toLowerCase() === 'delivered' ? 'Delivered' : 
                       order.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.orderDetails}>
                  <Text style={styles.orderItems} numberOfLines={1}>{order.items}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.orderTotal}>{order.total}</Text>
                    <ChevronRight size={20} color={Colors.textSecondary} style={{marginLeft: 10}}/>
                  </View>
                </View>
                {order.status.toLowerCase() === 'pending' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(order.id)}>
                    <Text style={styles.cancelBtnText}>Cancel Order</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    backgroundColor: Colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.inputBorder, 
    alignItems: 'center' 
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  orderDate: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
    marginVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 15,
  },
  orderTotal: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
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
  cancelBtn: {
    marginTop: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FF4D4D',
  }
});
