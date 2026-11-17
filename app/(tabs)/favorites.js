import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Trash2, ShoppingCart, Search, X } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { MOCK_ITEMS } from '../../constants/MockData';

// Mapping product names to local images (Case-insensitive matching with /Images folder)
const getItemImage = (name) => {
  const n = (name || '').toLowerCase().trim();
  
  // Exact & Specific Mappings
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
  if (n.includes('cake')) return require('../../Images/sponge cake.jpg');
  if (n.includes('juice')) return require('../../Images/lemon juice.jpeg');
  if (n.includes('note')) return require('../../Images/Notes.jpeg');
  
  return require('../../Images/samosa.jpeg');
};

export default function FavoritesScreen() {
  const { favorites: favoriteIds, toggleFavorite, addToCart, products } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Use products from backend, but fallback to MOCK_ITEMS if database is empty 
  const sourceItems = (products && products.length > 0) ? products : MOCK_ITEMS;

  // Map IDs back to full product objects
  const favoriteItems = (sourceItems || [])
    .filter(p => (favoriteIds || []).some(id => Number(id) === Number(p.id)))
    .map(p => ({
      ...p,
      image: (p.image_url && p.image_url.includes('http')) ? { uri: p.image_url } : getItemImage(p.name)
    }));

  const filteredItems = favoriteItems.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search favorites..."
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
          <View style={styles.emptyContainer}>
            <Heart size={48} color={Colors.textSecondary} style={{marginBottom: 15, opacity: 0.5}} />
            <Text style={styles.emptyText}>{searchQuery ? 'No matching favorites' : "You haven't added any favorites yet."}</Text>
            <Text style={styles.emptySubText}>{searchQuery ? 'Try a different keyword.' : 'Tap the heart icon on any food item to save it here!'}</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹ {item.price}</Text>
              </View>
              <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                  <ShoppingCart size={16} color={Colors.white} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.removeBtn}>
                  <Trash2 size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    backgroundColor: Colors.white, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.inputBorder, 
    alignItems: 'center' 
  },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.text, marginBottom: 5 },
  emptySubText: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  cartItem: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.text },
  itemPrice: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.primary, marginTop: 5 },
  actionContainer: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },
  addBtn: { flexDirection: 'row', backgroundColor: Colors.primary, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 10 },
  addBtnText: { color: Colors.white, fontFamily: 'Outfit_600SemiBold', fontSize: 12, marginLeft: 5 },
  removeBtn: { padding: 5 },
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
