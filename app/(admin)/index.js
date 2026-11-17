import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, StatusBar, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, TrendingUp, DollarSign, Users, ShoppingBag, Package, UserPlus, X, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { isCanteenOpen, setIsCanteenOpen } = useAppContext();
  
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    newUsers: 0,
    breakfastTotal: 0,
    lunchTotal: 0,
    snacksTotal: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    const now = new Date();
    let query = supabase.from('orders').select('*').not('status', 'eq', 'cancelled');

    if (selectedPeriod === 'Today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      query = query.gte('created_at', startOfDay);
    } else if (selectedPeriod === 'Weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', weekAgo);
    } else if (selectedPeriod === 'Monthly') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      query = query.gte('created_at', monthAgo);
    }

    const { data: orders } = await query;
    const revenue = orders?.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0) || 0;
    const ordersCount = orders?.length || 0;

    // 🎯 REAL-TIME CATEGORY GROUPING
    let bTotal = 0; let lTotal = 0; let sTotal = 0;
    
    (orders || []).forEach(o => {
      const summary = (o.items_summary || '').toLowerCase();
      const amount = parseFloat(o.total_amount);
      
      // Semantic grouping based on seeding list
      if (summary.match(/dosa|idly|vada|poori|upma|pongal/)) bTotal += amount;
      else if (summary.match(/briyani|biryani|rice|noodles|meals|chilli/)) lTotal += amount;
      else if (summary.match(/puffs|tea|coffee|bun|juice|cake|sprite|7up|dew|bottle|note|pencil|eraser/)) sTotal += amount;
      else sTotal += amount; // Fallback for misc/stationery
    });

    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    setAnalytics({ 
      totalRevenue: revenue, 
      ordersCount: ordersCount, 
      newUsers: usersCount || 0,
      breakfastTotal: bTotal,
      lunchTotal: lTotal,
      snacksTotal: sTotal
    });
  };

  const getPieAngles = () => {
    if (analytics.totalRevenue === 0) return { r1: '0deg', r2: '0deg', r3: '0deg', p: '0%' };
    const p1 = (analytics.breakfastTotal / analytics.totalRevenue) * 360;
    const p2 = (analytics.lunchTotal / analytics.totalRevenue) * 360;
    return {
      r1: '0deg',
      r2: `${p1}deg`,
      r3: `${p1 + p2}deg`,
      p: `${Math.round((analytics.lunchTotal / analytics.totalRevenue) * 100)}%`
    };
  };

  const pie = { 
    ...getPieAngles(), 
    color1: '#4ADE80', color2: '#FBBF24', color3: '#F87171' 
  };

  const stats = [
    { title: 'New Users', value: String(analytics.newUsers), icon: Users, color: '#3B82F6', interactive: true, route: '/(admin)/users' },
    { title: 'Orders Placed', value: String(analytics.ordersCount), icon: ShoppingBag, color: '#8B5CF6', interactive: true, route: '/(admin)/orders' },
    { title: 'Total Sold', value: `₹ ${analytics.totalRevenue.toLocaleString()}`, icon: Package, color: '#22C55E', interactive: true, route: '/(admin)/users' },
  ];

  const salesBreakdown = [
    { name: 'Masala Dosa', count: 120, total: '₹ 5,400' },
    { name: 'Onion Uttapam', count: 85, total: '₹ 4,675' },
    { name: 'Idli (2 Pcs)', count: 65, total: '₹ 1,950' },
    { name: 'Vada (2 Pcs)', count: 42, total: '₹ 1,260' },
    { name: 'Tea/Coffee', count: 30, total: '₹ 450' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>System Admin</Text>
          <Text style={styles.headerSub}>Revenue & System Control</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.logoutBtn}>
          <LogOut size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Revenue Analytics Card */}
        <View style={styles.revenueCard}>
          <View style={styles.pieRow}>
             <View style={styles.pieChartContainer}>
                <View style={[styles.pieSegment, { backgroundColor: pie.color1, transform: [{ rotate: pie.r1 }] }]} />
                <View style={[styles.pieSegment, { backgroundColor: pie.color2, transform: [{ rotate: pie.r2 }] }]} />
                <View style={[styles.pieSegment, { backgroundColor: pie.color3, transform: [{ rotate: pie.r3 }] }]} />
                <View style={styles.pieCenter} />
                <View style={styles.pieOverlay}>
                   <Text style={styles.piePercent}>{pie.p}</Text>
                </View>
             </View>
             <View style={styles.pieLegend}>
                <Text style={styles.revLabel}>Total Revenue</Text>
                <Text style={styles.revValueBig}>₹ {analytics.totalRevenue.toLocaleString()}</Text>
                <View style={styles.breakdownGrid}>
                   <View style={styles.breakdownItem}><View style={[styles.dot, { backgroundColor: pie.color1 }]} /><Text style={styles.breakdownText}>Breakfast</Text></View>
                   <View style={styles.breakdownItem}><View style={[styles.dot, { backgroundColor: pie.color2 }]} /><Text style={styles.breakdownText}>Lunch</Text></View>
                   <View style={styles.breakdownItem}><View style={[styles.dot, { backgroundColor: pie.color3 }]} /><Text style={styles.breakdownText}>Snacks</Text></View>
                </View>
             </View>
          </View>

          <View style={styles.periodTabs}>
            {['Today', 'Weekly', 'Monthly'].map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[styles.periodTab, selectedPeriod === p && styles.periodTabActive]}
                onPress={() => setSelectedPeriod(p)}
              >
                <Text style={[styles.periodTabText, selectedPeriod === p && styles.periodTabTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dynamic Interactive Stats Row */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const CardContent = (
              <>
                <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                  <Icon size={18} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
                {stat.interactive && <Text style={[styles.viewHint, { color: stat.color }]}>View Detail</Text>}
              </>
            );

            if (stat.interactive) {
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.statCard}
                  onPress={() => stat.modal ? setShowSoldModal(true) : router.push(stat.route)}
                >
                  {CardContent}
                </TouchableOpacity>
              );
            }
            return (
              <View key={index} style={styles.statCard}>
                {CardContent}
              </View>
            );
          })}
        </View>

        {/* Sales Breakdown Modal */}
        <Modal visible={showSoldModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.soldModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Item Sales Breakdown</Text>
                <TouchableOpacity onPress={() => setShowSoldModal(false)}><X size={24} color={Colors.text} /></TouchableOpacity>
              </View>
              <ScrollView>
                {salesBreakdown.map((item, i) => (
                  <View key={i} style={[styles.soldRow, i < salesBreakdown.length - 1 && styles.borderBottom]}>
                    <View style={styles.soldInfo}>
                      <Text style={styles.soldName}>{item.name}</Text>
                      <Text style={styles.soldQty}>{item.count} items sold</Text>
                    </View>
                    <Text style={styles.soldTotal}>{item.total}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSoldModal(false)}>
                <Text style={styles.closeBtnText}>Close Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <View style={styles.masterIconBg}>
              <Package size={22} color={Colors.white} />
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.statusTitle}>Canteen Operations</Text>
              <Text style={styles.statusDesc}>{isCanteenOpen ? 'Currently Accepting Orders' : 'System Offline'}</Text>
            </View>
          </View>
          <Switch 
            value={isCanteenOpen} 
            onValueChange={setIsCanteenOpen} 
            trackColor={{ false: '#EEE', true: '#FFE8CC' }}
            thumbColor={isCanteenOpen ? Colors.primary : '#BBB'}
          />
        </View>

        {/* Administrative Hub */}
        <Text style={styles.sectionTitle}>Administrative Hub</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/staffing')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E1F8ED' }]}>
              <Briefcase size={20} color="#22C55E" />
            </View>
            <Text style={styles.actionText}>Staff Roster</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/menu')}>
             <View style={[styles.actionIcon, { backgroundColor: '#FFEECC' }]}>
               <Package size={20} color={Colors.primary} />
             </View>
             <Text style={styles.actionText}>Pricing</Text>
           </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/users')}>
             <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
               <Users size={20} color="#3B82F6" />
             </View>
             <Text style={styles.actionText}>Audit Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(admin)/profile')}>
             <View style={[styles.actionIcon, { backgroundColor: '#FFEDD5' }]}>
               <UserPlus size={20} color="#F97316" />
             </View>
             <Text style={styles.actionText}>Setup Profile</Text>
           </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: Colors.white, 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.inputBorder 
  },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.text },
  headerSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary },
  logoutBtn: { padding: 10, backgroundColor: '#FFF0F0', borderRadius: 12 },
  scrollContent: { padding: 20 },
  revenueCard: {
    backgroundColor: Colors.primary,
    padding: 25,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden'
  },
  pieRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  pieChartContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    overflow: 'hidden',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  pieSegment: { 
    position: 'absolute', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderLeftWidth: 50, 
    borderLeftColor: 'transparent', 
    borderRightWidth: 50, 
    borderRightColor: 'transparent', 
    borderTopWidth: 50 
  },
  pieCenter: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary, zIndex: 1 },
  pieOverlay: { zIndex: 2, alignItems: 'center' },
  piePercent: { color: Colors.white, fontFamily: 'Outfit_700Bold', fontSize: 18 },
  pieLegend: { marginLeft: 25, flex: 1 },
  breakdownGrid: { marginTop: 8 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakdownText: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit_600SemiBold', fontSize: 11, marginLeft: 8 },
  revLabel: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  revValueBig: { color: Colors.white, fontFamily: 'Outfit_700Bold', fontSize: 28, marginVertical: 4 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  soldModalContent: { backgroundColor: Colors.white, width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  soldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  soldInfo: { flex: 1 },
  soldName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  soldQty: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  soldTotal: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.primary },
  closeBtn: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  closeBtnText: { fontFamily: 'Outfit_700Bold', color: Colors.textSecondary },

  periodTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', padding: 4, borderRadius: 12 },
  periodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  periodTabActive: { backgroundColor: Colors.white },
  periodTabText: { color: Colors.white, fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  periodTabTextActive: { color: Colors.primary },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: (width - 64) / 3, backgroundColor: Colors.white, borderRadius: 18, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder },
  statIconBg: { padding: 10, borderRadius: 12, marginBottom: 10 },
  statValue: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  statLabel: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  viewHint: { fontFamily: 'Outfit_600SemiBold', fontSize: 8, marginTop: 8, textTransform: 'uppercase' },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, padding: 15, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: Colors.inputBorder },
  masterIconBg: { width: 44, height: 44, borderRadius: 15, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  statusTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  statusDesc: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text, marginBottom: 15 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: (width - 52) / 2, backgroundColor: Colors.white, borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 12 },
  actionIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.text },
});
