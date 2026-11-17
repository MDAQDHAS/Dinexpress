import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, ShoppingCart, Search } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '../constants/Colors';
import { useAppContext } from '../context/AppContext';
import { MOCK_ITEMS } from '../constants/MockData';

// Mapping product names to local images (Exacting matching with /Images folder)
const imageMap = {
  'Bread Chilli': require('../Images/Bread chilli.jpeg'),
  'Chicken Biryani': require('../Images/chicken briyani.jpg'),
  'Chicken Rice': require('../Images/chicken rice.jpeg'),
  'Chicken Noodles': require('../Images/chicken noodles.jpeg'),
  'Egg Rice': require('../Images/egg rice.jpeg'),
  'Egg Noodles': require('../Images/egg noodles.jpeg'),
  'Curd Rice': require('../Images/curd rice.jpeg'),
  'Sambar Rice': require('../Images/sambar rice.jpg'),
  'Lemon Rice': require('../Images/lemon rice.jpeg'),
  'Veg Biryani': require('../Images/veg briyani.jpeg'),
  'Plain Dosa': require('../Images/plain dosai.jpeg'),
  'Masala Dosa': require('../Images/masala dosai.jpeg'),
  'Tea': require('../Images/tea.jpeg'),
  'Coffee': require('../Images/Coffee 2.jpeg'),
  'Samosa': require('../Images/samosa.jpeg'),
  'Mushroom Puff': require('../Images/mushroom puffs.jpg'),
  'Egg Puff': require('../Images/egg puffs.jpg'),
  'Veg Puff': require('../Images/veg puffs.jpg'),
  'Chicken Puff': require('../Images/chicken puffs.jpg'),
  'Vadai': require('../Images/medhu vadai.jpeg'),
  'Apple Cake': require('../Images/apple cake.jpeg'),
  'Chocolate Cake': require('../Images/Chocolate cake.jpeg'),
  'Sponge Cake': require('../Images/sponge cake.jpg'),
  'Vennila Cake': require('../Images/Vennila cake.jpeg'),
  'Pastry Slice': require('../Images/patry cake.jpeg'),
  'Fresh Juice': require('../Images/lemon juice.jpeg'),
  'Water Bottle': require('../Images/water bottle.jpeg'),
  '7Up / Sprite': require('../Images/Sprite.jpeg'),
  'A4 Sheets': require('../Images/a4 sheets.jpeg'),
  'Badam Milk': require('../Images/badam milk.jpg'),
  'Biscuits': require('../Images/biscuits.jpeg'),
  'Boost': require('../Images/boost.jpg'),
  'Horlicks': require('../Images/horlicks.jpg'),
  'Chips Packet': require('../Images/chips packets.jpg'),
  'Cream Bun': require('../Images/cream bun.jpeg'),
  'Jam Bun': require('../Images/bun jam.jpeg'),
  'Butter Jam Bread': require('../Images/bun jam.jpeg'),
  'Cutlet': require('../Images/cutlet.jpeg'),
  'Eraser': require('../Images/eraser.jpeg'),
  'Meals': require('../Images/meals.jpg'),
  'Milky Bar': require('../Images/milky bar.jpeg'),
  'Mountain Dew': require('../Images/moutain dew.jpeg'),
  'Notebook': require('../Images/Notes.jpeg'),
  'Pakkoda': require('../Images/pakoda.jpeg'),
  'Pen / Pencil': require('../Images/pencil.jpeg'),
  'Poori Masala': require('../Images/poori.jpeg'),
  'Record Notebook': require('../Images/record note.jpg'),
  'Scale': require('../Images/Scale.jpeg'),
  'Sharpener': require('../Images/Sharpner.jpeg'),
  'Upma': require('../Images/upma.jpg'),
  'Ven Pongal': require('../Images/vean pongal.jpeg'),
  'Bread Chilli': require('../Images/Bread chilli.jpeg'),
  'Chicken Biryani': require('../Images/chicken briyani.jpg'),
  'Mutton Biryani': require('../Images/mutton briyani.jpeg'),
  'Mango Juice': require('../Images/lemon juice.jpeg'),
};

export default function SeeAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = params.category || 'All';
  
  const { addToCart, toggleFavorite, isFavorite, products, showPopup } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddToCart = (item) => {
    addToCart(item);
    showPopup({
      type: 'cart',
      message: 'Added to cart 🛒',
      primaryBtnText: 'View Cart',
      secondaryBtnText: 'Continue',
      onPrimaryPress: () => router.push('/cart')
    });
  };

  // Use products from backend, but fallback to MOCK_ITEMS if database is empty
  const sourceItems = (products && products.length > 0) ? products : [];

  // Ultra-Robust dynamic image mapping
  const items = (sourceItems || []).map(p => {
    const n = (p.name || '').toLowerCase().trim();
    let finalImage = require('../Images/samosa.jpeg');
    
    // Exact & Specific Mappings
    const exactMap = {
      'plain dosai': require('../Images/plain dosai.jpeg'),
      'masala dosai': require('../Images/masala dosai.jpeg'),
      'dosa': require('../Images/Dosa.jpg'),
      'medhu vadai': require('../Images/medhu vadai.jpeg'),
      'idly': require('../Images/vean pongal.jpeg'),
      'idli': require('../Images/vean pongal.jpeg'),
      'idly (2pcs)': require('../Images/vean pongal.jpeg'),
      'idly(2pcs)': require('../Images/vean pongal.jpeg'),
      'poori': require('../Images/poori.jpeg'),
      'poori masala': require('../Images/poori.jpeg'),
      'upma': require('../Images/upma.jpg'),
      'vean pongal': require('../Images/vean pongal.jpeg'),
      'ven pongal': require('../Images/vean pongal.jpeg'),
      'pakoda': require('../Images/pakoda.jpeg'),
      'pakkoda': require('../Images/pakoda.jpeg'),
      'chicken briyani': require('../Images/chicken briyani.jpg'),
      'chicken biryani': require('../Images/chicken briyani.jpg'),
      'veg briyani': require('../Images/veg briyani.jpeg'),
      'veg biryani': require('../Images/veg briyani.jpeg'),
      'mutton briyani': require('../Images/mutton briyani.jpeg'),
      'mutton biryani': require('../Images/mutton briyani.jpeg'),
      'chicken rice': require('../Images/chicken rice.jpeg'),
      'egg rice': require('../Images/egg rice.jpeg'),
      'egg noodles': require('../Images/egg noodles.jpeg'),
      'chicken noodles': require('../Images/chicken noodles.jpeg'),
      'meals': require('../Images/meals.jpg'),
      'full meals': require('../Images/meals.jpg'),
      'sambar rice': require('../Images/sambar rice.jpg'),
      'curd rice': require('../Images/curd rice.jpeg'),
      'lemon rice': require('../Images/lemon rice.jpeg'),
      'bread chilli': require('../Images/Bread chilli.jpeg'),
      'samosa': require('../Images/samosa.jpeg'),
      'cutlet': require('../Images/cutlet.jpeg'),
      'egg puffs': require('../Images/egg puffs.jpg'),
      'mushroom puffs': require('../Images/mushroom puffs.jpg'),
      'veg puffs': require('../Images/veg puffs.jpg'),
      'chicken puffs': require('../Images/chicken puffs.jpg'),
      'cream bun': require('../Images/cream bun.jpeg'),
      'bun jam': require('../Images/bun jam.jpeg'),
      'jam bun': require('../Images/bun jam.jpeg'),
      'chips packets': require('../Images/chips packets.jpg'),
      'biscuits': require('../Images/biscuits.jpeg'),
      'milky bar': require('../Images/milky bar.jpeg'),
      'tea': require('../Images/tea.jpeg'),
      'coffee': require('../Images/coffee.jpg'),
      'coffee 2': require('../Images/Coffee 2.jpeg'),
      'boost': require('../Images/boost.jpg'),
      'horlicks': require('../Images/horlicks.jpg'),
      'badam milk': require('../Images/badam milk.jpg'),
      'lemon juice': require('../Images/lemon juice.jpeg'),
      'mullampalam': require('../Images/Mullampalam.jpeg'),
      'mango juice': require('../Images/Mullampalam.jpeg'),
      'water bottle': require('../Images/water bottle.jpeg'),
      'moutain dew': require('../Images/moutain dew.jpeg'),
      'mountain dew': require('../Images/moutain dew.jpeg'),
      'sprite': require('../Images/Sprite.jpeg'),
      '7up': require('../Images/Sprite.jpeg'),
      '7up / sprite': require('../Images/Sprite.jpeg'),
      'apple cake': require('../Images/apple cake.jpeg'),
      'chocolate cake': require('../Images/Chocolate cake.jpeg'),
      'vennila cake': require('../Images/Vennila cake.jpeg'),
      'sponge cake': require('../Images/sponge cake.jpg'),
      'patry cake': require('../Images/patry cake.jpeg'),
      'pastry cake': require('../Images/patry cake.jpeg'),
      'pencil': require('../Images/pencil.jpeg'),
      'eraser': require('../Images/eraser.jpeg'),
      'sharpner': require('../Images/Sharpner.jpeg'),
      'sharpener': require('../Images/Sharpner.jpeg'),
      'scale': require('../Images/Scale.jpeg'),
      'notes': require('../Images/Notes.jpeg'),
      'notebook': require('../Images/Notes.jpeg'),
      'a4 sheets': require('../Images/a4 sheets.jpeg'),
      'a4 sheet': require('../Images/a4 sheets.jpeg'),
      'a4 sheets(10)': require('../Images/a4 sheets.jpeg'),
      'a4 sheets (10)': require('../Images/a4 sheets.jpeg'),
      'record note': require('../Images/record note.jpg'),
    };

    if (exactMap[n]) {
        finalImage = exactMap[n];
    } 
    else if (p.image_url && p.image_url.includes('http')) {
        finalImage = { uri: p.image_url };
    } 
    else {
        // Fuzzy Fallbacks
        if (n.includes('dosa')) finalImage = require('../Images/Dosa.jpg');
        else if (n.includes('vadai') || n.includes('vada')) finalImage = require('../Images/medhu vadai.jpeg');
        else if (n.includes('briyani') || n.includes('biryani')) finalImage = require('../Images/veg briyani.jpeg');
        else if (n.includes('puffs')) finalImage = require('../Images/veg puffs.jpg');
        else if (n.includes('cake')) finalImage = require('../Images/sponge cake.jpg');
        else if (n.includes('juice')) finalImage = require('../Images/lemon juice.jpeg');
        else if (n.includes('note')) finalImage = require('../Images/Notes.jpeg');
    }
    
    return {
      ...p,
      available: p.is_available ?? true,
      image: finalImage,
      rating: p.rating || '4.5'
    };
  });

  // 1. Filter by category
  let categoryFiltered = initialCategory === 'All' 
    ? items 
    : items.filter(item => item.category === initialCategory);

  // 2. Filter by search query
  if (searchQuery.trim() !== '') {
    categoryFiltered = categoryFiltered.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{initialCategory === 'All' ? 'All Menu Items' : `${initialCategory} Menu`}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search foods, drinks..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {categoryFiltered.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', color: Colors.textSecondary }}>No items found for this search.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {categoryFiltered.map((item) => {
              const isFav = isFavorite(item.id);
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemImageContainer}>
                    <Image source={item.image} style={styles.itemImage} />
                    <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(item.id)}>
                      <Heart size={20} color={isFav ? '#00A86B' : Colors.text} fill={isFav ? '#00A86B' : 'transparent'} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                    <View style={styles.itemBottomRow}>
                      <Text style={styles.itemPriceText}>₹ {item.price}</Text>
                      <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                        <ShoppingCart size={16} color={Colors.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: 20, marginTop: 15, borderRadius: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: Colors.inputBorder },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.text },
  scrollContent: { padding: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  itemCard: { width: '48%', backgroundColor: Colors.white, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden' },
  itemImageContainer: { position: 'relative', height: 110, width: '100%' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 20 },
  itemContent: { padding: 10 },
  itemName: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text, marginBottom: 3 },
  itemDesc: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: Colors.textSecondary, marginBottom: 10, height: 25 },
  itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPriceText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text },
  addButton: { backgroundColor: Colors.primary, padding: 8, borderRadius: 10 }
});
