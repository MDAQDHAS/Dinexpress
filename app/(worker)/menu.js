import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Switch, TextInput, Modal, ScrollView,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, X, ChevronLeft } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { MOCK_ITEMS } from '../../constants/MockData';

// Categories for filtering
const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Cakes', 'Stationery'];

// Fallback logic for DB items that don't have images
const getItemImage = (name) => {
  const n = (name || '').toLowerCase().trim();
  
  // Exact & Specific Mappings (Highest Priority)
  const exactMap = {
    'plain dosai': require('../../Images/plain dosai.jpeg'),
    'masala dosai': require('../../Images/masala dosai.jpeg'),
    'dosa': require('../../Images/Dosa.jpg'),
    'medhu vadai': require('../../Images/medhu vadai.jpeg'),
    'idly': require('../../Images/vean pongal.jpeg'),
    'idli': require('../../Images/vean pongal.jpeg'),
    'idly (2pcs)': require('../../Images/vean pongal.jpeg'),
    'idly(2pcs)': require('../../Images/vean pongal.jpeg'),
    'poori': require('../../Images/poori.jpeg'),
    'poori masala': require('../../Images/poori.jpeg'),
    'upma': require('../../Images/upma.jpg'),
    'vean pongal': require('../../Images/vean pongal.jpeg'),
    'ven pongal': require('../../Images/vean pongal.jpeg'),
    'pakoda': require('../../Images/pakoda.jpeg'),
    'pakkoda': require('../../Images/pakoda.jpeg'),
    'chicken briyani': require('../../Images/chicken briyani.jpg'),
    'chicken biryani': require('../../Images/chicken briyani.jpg'),
    'veg briyani': require('../../Images/veg briyani.jpeg'),
    'veg biryani': require('../../Images/veg briyani.jpeg'),
    'mutton briyani': require('../../Images/mutton briyani.jpeg'),
    'mutton biryani': require('../../Images/mutton briyani.jpeg'),
    'chicken rice': require('../../Images/chicken rice.jpeg'),
    'egg rice': require('../../Images/egg rice.jpeg'),
    'egg noodles': require('../../Images/egg noodles.jpeg'),
    'chicken noodles': require('../../Images/chicken noodles.jpeg'),
    'meals': require('../../Images/meals.jpg'),
    'full meals': require('../../Images/meals.jpg'),
    'sambar rice': require('../../Images/sambar rice.jpg'),
    'curd rice': require('../../Images/curd rice.jpeg'),
    'lemon rice': require('../../Images/lemon rice.jpeg'),
    'bread chilli': require('../../Images/Bread chilli.jpeg'),
    'samosa': require('../../Images/samosa.jpeg'),
    'cutlet': require('../../Images/cutlet.jpeg'),
    'egg puffs': require('../../Images/egg puffs.jpg'),
    'mushroom puffs': require('../../Images/mushroom puffs.jpg'),
    'veg puffs': require('../../Images/veg puffs.jpg'),
    'chicken puffs': require('../../Images/chicken puffs.jpg'),
    'cream bun': require('../../Images/cream bun.jpeg'),
    'bun jam': require('../../Images/bun jam.jpeg'),
    'jam bun': require('../../Images/bun jam.jpeg'),
    'chips packets': require('../../Images/chips packets.jpg'),
    'biscuits': require('../../Images/biscuits.jpeg'),
    'milky bar': require('../../Images/milky bar.jpeg'),
    'tea': require('../../Images/tea.jpeg'),
    'coffee': require('../../Images/coffee.jpg'),
    'coffee 2': require('../../Images/Coffee 2.jpeg'),
    'boost': require('../../Images/boost.jpg'),
    'horlicks': require('../../Images/horlicks.jpg'),
    'badam milk': require('../../Images/badam milk.jpg'),
    'lemon juice': require('../../Images/lemon juice.jpeg'),
    'mullampalam': require('../../Images/Mullampalam.jpeg'),
    'mango juice': require('../../Images/Mullampalam.jpeg'),
    'water bottle': require('../../Images/water bottle.jpeg'),
    'moutain dew': require('../../Images/moutain dew.jpeg'),
    'mountain dew': require('../../Images/moutain dew.jpeg'),
    'sprite': require('../../Images/Sprite.jpeg'),
    '7up': require('../../Images/Sprite.jpeg'),
    '7up / sprite': require('../../Images/Sprite.jpeg'),
    'apple cake': require('../../Images/apple cake.jpeg'),
    'chocolate cake': require('../../Images/Chocolate cake.jpeg'),
    'vennila cake': require('../../Images/Vennila cake.jpeg'),
    'sponge cake': require('../../Images/sponge cake.jpg'),
    'patry cake': require('../../Images/patry cake.jpeg'),
    'pastry cake': require('../../Images/patry cake.jpeg'),
    'pencil': require('../../Images/pencil.jpeg'),
    'eraser': require('../../Images/eraser.jpeg'),
    'sharpner': require('../../Images/Sharpner.jpeg'),
    'sharpener': require('../../Images/Sharpner.jpeg'),
    'scale': require('../../Images/Scale.jpeg'),
    'notes': require('../../Images/Notes.jpeg'),
    'notebook': require('../../Images/Notes.jpeg'),
    'a4 sheets': require('../../Images/a4 sheets.jpeg'),
    'a4 sheet': require('../../Images/a4 sheets.jpeg'),
    'a4 sheets(10)': require('../../Images/a4 sheets.jpeg'),
    'a4 sheets (10)': require('../../Images/a4 sheets.jpeg'),
    'record note': require('../../Images/record note.jpg'),
  };

  if (exactMap[n]) return exactMap[n];

  // Fuzzy Fallbacks
  if (n.includes('biryani') || n.includes('briyani')) return require('../../Images/veg briyani.jpeg');
  if (n.includes('dosa') || n.includes('dosai')) return require('../../Images/Dosa.jpg');
  if (n.includes('puff')) return require('../../Images/veg puffs.jpg');
  if (n.includes('bun')) return require('../../Images/bun jam.jpeg');
  if (n.includes('cake')) return require('../../Images/sponge cake.jpg');
  if (n.includes('juice')) return require('../../Images/lemon juice.jpeg');
  if (n.includes('milk')) return require('../../Images/badam milk.jpg');
  if (n.includes('note')) return require('../../Images/Notes.jpeg');
  
  return require('../../Images/samosa.jpeg');
};

// Image helper logic moved to getItemImage above

export default function WorkerMenu() {
  const router = useRouter();
  const { showPopup } = useAppContext();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const fetchItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        // Table doesn't exist or is empty - use Mock Data
        // IMPORTANT: Use the image field already in MockData to avoid mismatches
        setItems(MOCK_ITEMS.map(i => ({
          ...i,
          available: true,
          // Since MockData.js uses ../Images/path, but this file is in app/(worker)/, 
          // we need to be careful if require() paths are relative to MockData.js.
          // They ARE relative to MockData.js, so MOCK_ITEMS[0].image is already a resolved asset number.
          image: i.image || getItemImage(i.name)
        })));
      } else {
        setItems(data.map(i => ({
          ...i,
          available: i.is_available,
          image: i.image_url ? { uri: i.image_url } : getItemImage(i.name)
        })));
      }
    } catch (e) {
      setItems(MOCK_ITEMS.map(i => ({ ...i, available: true })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleAvailability = async (id, currentStatus) => {
    const { error } = await supabase.from('products').update({ is_available: !currentStatus }).eq('id', id);
    if (!error) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, available: !currentStatus } : item));
    } else {
      // Local update for offline
      setItems(prev => prev.map(item => item.id === id ? { ...item, available: !currentStatus } : item));
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, !item.available && styles.unavailableCard]}>
      <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>₹ {item.price}</Text>
      </View>
      <View style={styles.actions}>
        <Text style={[styles.statusText, { color: item.available ? '#22C55E' : Colors.error }]}>
          {item.available ? 'In Stock' : 'Out of Stock'}
        </Text>
        <Switch
          value={item.available}
          onValueChange={() => toggleAvailability(item.id, item.available)}
          trackColor={{ false: '#EEE', true: '#CCF5E3' }}
          thumbColor={item.available ? '#22C55E' : '#BBB'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Kitchen Menu</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search all items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
          <Filter size={20} color={activeFilter !== 'All' ? Colors.primary : Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Categories Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingHorizontal: 15 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity 
             key={cat} 
             style={[styles.catChip, activeFilter === cat && styles.catChipActive]}
             onPress={() => setActiveFilter(cat)}
          >
            <Text style={[styles.catChipText, activeFilter === cat && styles.catChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading all items...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchItems(true)} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySub}>Refresh or check database connection</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="fade" transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setShowFilterModal(false)} activeOpacity={1}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.option, activeFilter === c && styles.optionActive]}
                onPress={() => { setActiveFilter(c); setShowFilterModal(false); }}
              >
                <Text style={[styles.optionText, activeFilter === c && styles.optionTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  headerBtn: { padding: 5 },
  searchSection: { flexDirection: 'row', padding: 12, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, height: 45, borderRadius: 12, borderWidth: 1, borderColor: '#DDD' },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Outfit_400Regular' },
  filterBtn: { backgroundColor: '#FFF', width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  catRow: { flexGrow: 0, marginBottom: 5 },
  catChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 8, backgroundColor: '#FFF', height: 36 },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  catChipTextActive: { color: '#FFF' },
  listContent: { padding: 15, paddingBottom: 30 },
  itemCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  unavailableCard: { opacity: 0.5 },
  itemImage: { width: 60, height: 60, borderRadius: 12 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.text },
  itemCategory: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.textSecondary },
  itemPrice: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.primary, marginTop: 4 },
  actions: { alignItems: 'flex-end', justifyContent: 'center' },
  statusText: { fontFamily: 'Outfit_700Bold', fontSize: 9, marginBottom: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  loadingText: { fontFamily: 'Outfit_400Regular', color: Colors.textSecondary, marginTop: 10 },
  emptyTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  emptySub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 5 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#FFF', width: '80%', borderRadius: 20, padding: 25 },
  modalTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, marginBottom: 15 },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionActive: { backgroundColor: '#FFF5E5' },
  optionText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.textSecondary },
  optionTextActive: { color: Colors.primary },
});
