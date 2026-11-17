import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, FlatList, Platform, StatusBar } from 'react-native';
import { Search, Filter, ArrowLeft, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

export default function UserAuditScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Today'); // Today, Weekly, Monthly
  const [statusFilter, setStatusFilter] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data.map(t => ({
        ...t,
        user: t.profiles?.full_name || 'Anonymous',
        date: new Date(t.created_at).toLocaleString(),
        amount: parseFloat(t.amount)
      })));
    }
    setLoading(false);
  };

  const getFilteredTxns = () => {
    let filtered = transactions;
    
    // Search filter (Robust match for ID, User Name, or Amount)
    if (searchQuery) {
       const q = searchQuery.toLowerCase();
       filtered = filtered.filter(t => 
          t.user.toLowerCase().includes(q) || 
          String(t.id).toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
       );
    }

    // Time filter
    if (activeTab === 'Today') {
       const today = new Date().toLocaleDateString();
       filtered = filtered.filter(t => new Date(t.created_at).toLocaleDateString() === today);
    } else if (activeTab === 'Weekly') {
       const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
       filtered = filtered.filter(t => new Date(t.created_at) > weekAgo);
    }

    // Status filter
    if (statusFilter !== 'All') {
       filtered = filtered.filter(t => t.type === statusFilter);
    }
    
    return filtered;
  };

  const currentTxns = getFilteredTxns();
  const totalVolume = currentTxns.reduce((acc, curr) => acc + (curr.status === 'Success' ? Math.abs(curr.amount) : 0), 0);

  const TransactionItem = ({ item }) => (
    <View style={styles.txnCard}>
      <View style={[styles.iconBg, { backgroundColor: item.amount > 0 ? '#E1F8ED' : '#FFF5E5' }]}>
        {item.amount > 0 ? <ArrowDownLeft size={18} color="#22C55E" /> : <ArrowUpRight size={18} color={Colors.primary} />}
      </View>
      <View style={styles.txnInfo}>
        <View style={styles.txnRow}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={[styles.txnAmount, { color: item.amount > 0 ? '#22C55E' : Colors.text }]}>
            {item.amount > 0 ? '+' : ''}₹ {Math.abs(item.amount)}
          </Text>
        </View>
        <View style={styles.txnRow}>
          <Text style={styles.txnId}>
            {String(item.id).includes('-') ? String(item.id).split('-')[0].toUpperCase() : String(item.id).toUpperCase()} · {item.type}
          </Text>
          <Text style={styles.txnDate}>{item.date}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Registry</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by name, ID or amount..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        {['Today', 'Weekly', 'Monthly'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContainer}>
        {['Success', 'Failed', 'All'].map(s => (
          <TouchableOpacity 
            key={s} 
            style={[styles.statusTab, statusFilter === s && styles.activeStatusTab]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.statusTabText, statusFilter === s && styles.activeStatusTabText]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={currentTxns}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
           <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                 <Text style={styles.summaryLabel}>Total Volume</Text>
                 <Text style={styles.summaryValue}>₹ {totalVolume}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                 <Text style={styles.summaryLabel}>Matches</Text>
                 <Text style={styles.summaryValue}>{currentTxns.length}</Text>
              </View>
           </View>
        )}
      />
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
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  backBtn: { padding: 4 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF5E5', justifyContent: 'center', alignItems: 'center' },
  searchSection: { padding: 20, paddingBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 15, height: 50, borderRadius: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Outfit_400Regular', fontSize: 14 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.inputBorder },
  activeTab: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  activeTabText: { color: Colors.white },
  statusTab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, backgroundColor: '#F1F5F9' },
  activeStatusTab: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.primary },
  statusTabText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: Colors.textSecondary },
  activeStatusTabText: { color: Colors.primary },
  listContent: { padding: 20, paddingTop: 0 },
  summaryCard: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.inputBorder, alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  divider: { width: 1, height: 30, backgroundColor: Colors.inputBorder },
  txnCard: { flexDirection: 'row', backgroundColor: Colors.white, padding: 15, borderRadius: 18, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder },
  iconBg: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txnInfo: { flex: 1 },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.text },
  txnAmount: { fontFamily: 'Outfit_700Bold', fontSize: 16 },
  txnId: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  txnDate: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.textSecondary },
});
