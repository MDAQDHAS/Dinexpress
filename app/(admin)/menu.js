import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Switch, TextInput, Modal, ScrollView,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, X, Edit2, Trash2, ChevronLeft } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { MOCK_ITEMS } from '../../constants/MockData';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

// Categories for management
const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Cakes', 'Stationery'];

// Robust image fallback mapping for database items
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

export default function AdminMenu() {
  const router = useRouter();
  const { showPopup } = useAppContext();
  
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [activeItem, setActiveItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('Snacks');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: dbData, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (!error && dbData) {
        const formatted = dbData.map(i => ({
          ...i,
          isDb: true,
          available: i.is_available,
          rawImage: i.image_url,
          image: i.image_url && i.image_url.includes('http') ? { uri: i.image_url } : getItemImage(i.name)
        }));
        setItems(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    
    // 🔔 REAL-TIME SYNC for Admin Menu
    const subscription = supabase
      .channel('admin-menu-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [fetchItems]);

  const toggleAvailability = async (id, currentStatus, isDb) => {
    if (isDb) {
        await supabase.from('products').update({ is_available: !currentStatus }).eq('id', id);
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, available: !currentStatus } : item));
  };

  const handleUpdatePrice = async () => {
    const p = parseFloat(editPrice);
    if (isNaN(p)) return;
    if (activeItem.isDb) {
        // 💰 LOG PRICE HISTORY
        await supabase.from('price_history').insert([{
            product_id: activeItem.id,
            old_price: activeItem.price,
            new_price: p
        }]);

        await supabase.from('products').update({ price: p }).eq('id', activeItem.id);
    }
    setItems(prev => prev.map(item => item.id === activeItem.id ? { ...item, price: p } : item));
    setShowEditModal(false);
    showPopup({ type: 'toast', message: 'Price updated!' });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleAddItem = async () => {
    const p = parseFloat(newPrice);
    if (!newName || isNaN(p)) return;

    setUploading(true);
    let publicImageUrl = null;

    try {
        if (selectedImage) {
            const fileName = `${Date.now()}_${newName.replace(/\s+/g, '_')}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(fileName, decode(selectedImage.base64), {
                    contentType: 'image/jpeg'
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('menu-images')
                .getPublicUrl(fileName);
            
            publicImageUrl = publicUrl;
        }

        const { error } = await supabase.from('products').insert([{
            name: newName,
            price: p,
            category: newCat,
            is_available: true,
            image_url: publicImageUrl
        }]);

        if (error) throw error;

        fetchItems();
        setShowAddModal(false);
        setNewName(''); setNewPrice(''); setSelectedImage(null);
        showPopup({ type: 'toast', message: 'Item & Photo added to cloud! ☁️' });
    } catch (err) {
        console.error(err);
        showPopup({ type: 'toast', message: 'Failed to upload photo/item ❌' });
    } finally {
        setUploading(false);
    }
  };

  const handleDeleteItem = (id, name, isDb, imageUrl) => {
    Alert.alert("Delete", `Remove ${name}?`, [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        try {
            if (isDb) {
                await supabase.from('products').delete().eq('id', id);
                if (imageUrl && imageUrl.includes('menu-images')) {
                    const filePath = imageUrl.split('menu-images/')[1];
                    if (filePath) await supabase.storage.from('menu-images').remove([filePath]);
                }
            }
            setItems(prev => prev.filter(i => i.id !== id));
            showPopup({ type: 'toast', message: 'Item & Photo deleted! 🗑️' });
        } catch (err) {
            console.error(err);
            showPopup({ type: 'toast', message: 'Delete failed ❌' });
        }
      }}
    ]);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>₹ {item.price}</Text>
          <TouchableOpacity 
             onPress={() => { setActiveItem(item); setEditPrice(String(item.price)); setShowEditModal(true); }}
             style={styles.editBtn}
          >
            <Edit2 size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleDeleteItem(item.id, item.name, item.isDb, item.rawImage)} style={styles.trashBtn}>
          <Trash2 size={18} color={Colors.error} />
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.availabilityText, { color: item.available ? '#22C55E' : Colors.error }]}>
            {item.available ? 'In Stock' : 'Out of Stock'}
          </Text>
          <Switch
            value={item.available}
            onValueChange={() => toggleAvailability(item.id, item.available, item.isDb)}
            trackColor={{ false: '#EEE', true: '#CCF5E3' }}
            thumbColor={item.available ? '#22C55E' : '#BBB'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: -5 }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* PERFECTLY ALIGNED HEADER */}
      <View style={styles.header}>
        <View style={styles.sideHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Price & Menu</Text>
        <View style={styles.sideHeader}>
            <TouchableOpacity style={styles.addIconBtn} onPress={() => setShowAddModal(true)}><Plus size={24} color="#FFF" /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 5 }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity 
             key={c} 
             style={[styles.catChip, activeFilter === c && styles.catChipActive]}
             onPress={() => setActiveFilter(c)}
             activeOpacity={0.7}
          >
            <Text 
              style={[styles.catChipText, activeFilter === c && styles.catChipTextActive]}
              numberOfLines={1}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 50 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchItems(true)} />}
        />
      )}

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalFull}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalSubTitle}>Add New Item</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}><X size={24} color={Colors.text} /></TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Plus size={30} color={Colors.textSecondary} />
                  <Text style={styles.imageText}>Select Dish Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Item Name" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Price ₹" keyboardType="numeric" value={newPrice} onChangeText={setNewPrice} />
            <Text style={styles.catLabel}>Category</Text>
            <View style={styles.catWrap}>
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <TouchableOpacity key={c} style={[styles.catOption, newCat === c && styles.catOptionActive]} onPress={() => setNewCat(c)}>
                  <Text style={[styles.catOptionText, newCat === c && styles.catOptionTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
                style={[styles.submitBtn, uploading && { opacity: 0.7 }]} 
                onPress={handleAddItem} 
                disabled={uploading}
            >
                {uploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Add to Menu</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Price Modal */}
      <Modal visible={showEditModal} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalSmall}>
            <Text style={styles.modalSubTitle}>Update Price</Text>
            <Text style={styles.itemNameSub}>{activeItem?.name}</Text>
            <TextInput 
               style={styles.priceInput} 
               keyboardType="numeric" 
               value={editPrice} 
               onChangeText={setEditPrice}
               autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalBtn}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleUpdatePrice} style={[styles.modalBtn, styles.modalBtnActive]}><Text style={[styles.modalBtnText, { color: '#FFF' }]}>Update</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15, 
    height: 70, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE'
  },
  sideHeader: { width: 50, justifyContent: 'center' },
  headerTitle: { 
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit_700Bold', 
    fontSize: 20, 
    color: Colors.text
  },
  headerBtn: { padding: 5 },
  addIconBtn: { 
    backgroundColor: Colors.primary, 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  searchSection: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 15, height: 50, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Outfit_400Regular', fontSize: 14 },
  catRow: { flexGrow: 0, marginBottom: 15, height: 45 },
  catChip: { 
    paddingHorizontal: 22, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    marginRight: 12, 
    backgroundColor: '#FFF', 
    alignItems: 'center',
    justifyContent: 'center',
    height: 40
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  catChipTextActive: { color: '#FFF' },
  listContent: { paddingHorizontal: 15, paddingBottom: 40 },
  itemCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  itemImage: { width: 70, height: 70, borderRadius: 15 },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text, marginBottom: 2 },
  itemCategory: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemPrice: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.primary },
  editBtn: { backgroundColor: '#FFF5E5', padding: 5, borderRadius: 8 },
  availabilityText: { fontFamily: 'Outfit_700Bold', fontSize: 10, marginBottom: 2 },
  actions: { height: 70, justifyContent: 'space-between', alignItems: 'flex-end', paddingVertical: 2 },
  trashBtn: { padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalFull: { backgroundColor: '#FFF', width: '92%', borderRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalSubTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 15, padding: 18, marginBottom: 15, fontFamily: 'Outfit_400Regular', fontSize: 15 },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  catOption: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  catOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catOptionText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textSecondary },
  catOptionTextActive: { color: '#FFF' },
  submitBtn: { backgroundColor: Colors.primary, height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  submitBtnText: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 17 },
  modalSmall: { backgroundColor: '#FFF', width: '85%', borderRadius: 30, padding: 25, alignItems: 'center' },
  itemNameSub: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.textSecondary, marginBottom: 25 },
  priceInput: { width: '100%', borderBottomWidth: 3, borderBottomColor: Colors.primary, fontSize: 40, fontFamily: 'Outfit_700Bold', color: Colors.text, textAlign: 'center', marginBottom: 35 },
  modalBtns: { flexDirection: 'row', gap: 15 },
  modalBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
  modalBtnActive: { backgroundColor: Colors.primary },
  modalBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.textSecondary },
  imagePickerBtn: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  catLabel: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
});
