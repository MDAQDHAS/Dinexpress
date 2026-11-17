import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity, TextInput, Platform, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, Search, Radio, ShoppingCart, Home, ChevronRight, Heart, Percent, LayoutGrid, Coffee, Beer, CakeSlice, PenTool, Ticket, ReceiptText, ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';
import { MOCK_ITEMS } from '../../constants/MockData';

const FILTER_CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Drinks', 'Cakes', 'Stationery'];

const { width } = Dimensions.get('window');

// Dynamic icon mapping for categories
const iconMap = {
  'All': LayoutGrid,
  'Breakfast': Coffee,
  'Lunch': ChefHat,
  'Snacks': Percent,
  'Drinks': Beer,
  'Cakes': CakeSlice,
  'Stationery': PenTool,
};

// Mapping product names to local images (Case-insensitive matching with /Images folder)
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

  // Fuzzy Fallbacks (Medium Priority)
  if (n.includes('biryani') || n.includes('briyani')) return require('../../Images/veg briyani.jpeg');
  if (n.includes('dosa') || n.includes('dosai')) return require('../../Images/Dosa.jpg');
  if (n.includes('vadai') || n.includes('vada')) return require('../../Images/medhu vadai.jpeg');
  if (n.includes('puff')) return require('../../Images/veg puffs.jpg');
  if (n.includes('bun')) return require('../../Images/bun jam.jpeg');
  if (n.includes('cake')) return require('../../Images/sponge cake.jpg');
  if (n.includes('rice')) return require('../../Images/meals.jpg');
  if (n.includes('juice')) return require('../../Images/lemon juice.jpeg');
  if (n.includes('milk')) return require('../../Images/badam milk.jpg');
  if (n.includes('note')) return require('../../Images/Notes.jpeg');
  if (n.includes('coffee')) return require('../../Images/coffee.jpg');
  
  return require('../../Images/samosa.jpeg');
};

export default function DashboardScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const { cartItems, addToCart, toggleFavorite, isFavorite, points, user, showPopup, activeOrders, products, fetchProducts, fetchAllOrders, isCanteenOpen } = useAppContext();
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchAllOrders()]);
    setRefreshing(false);
  }, []);

  // Use products from backend, but fallback to MOCK_ITEMS if database is empty 
  // (ensures user always sees food even if Supabase table isn't populated yet)
  const sourceItems = (products && products.length > 0) ? products : MOCK_ITEMS;

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

  const handleOrderNow = (item) => {
    showPopup({
        type: 'checkout',
        message: 'Proceeding to checkout…',
        primaryBtnText: 'Checkout',
        secondaryBtnText: 'Back',
        onPrimaryPress: () => {
            addToCart(item);
            router.push('/cart');
        }
    });
  };
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || (user?.email?.split('@')[0] || 'Guest');

  // Ultra-Robust dynamic image mapping
  const items = sourceItems.map(p => {
    return {
      ...p,
      available: p.is_available ?? true,
      image: (p.image_url && p.image_url.includes('http')) ? { uri: p.image_url } : getItemImage(p.name),
      rating: p.rating || '4.5'
    };
  });

  // Filter items based on active category
  const currentItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  // We only show first 20 items horizontally to save space on Dashboard
  const displayedItems = currentItems;

  const renderAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />;
    }
    return <Image source={require('../../Images/Gokulraj.jpeg')} style={styles.avatar} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topHeader}>
        {renderAvatar()}
        <View style={styles.headerTextContainer}>
          <Text style={styles.greetingTitle}>Good morning, <Text style={styles.nameBold}>{userName}</Text></Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.locationText}>Nandha Engineering College</Text>
          </View>
        </View>
        <View style={styles.headerActionContainer}>
          <View style={styles.pointsBadge}>
            <Percent size={14} color={Colors.white} style={{marginRight: 4}} />
            <Text style={styles.pointsText}>{points}</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} onPress={() => router.push('/notifications')}>
            <Bell size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={[Colors.primary]} 
                tintColor={Colors.primary}
            />
        }
      >
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search meals,snacks,drinks..."
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <Radio size={24} color={Colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Live Queue</Text>
            <Text style={styles.infoValue}>8 mins</Text>
            <Text style={styles.infoSubtextGreen}>Low Crowd</Text>
          </View>
          <TouchableOpacity style={styles.infoCard} onPress={() => router.push('/cart')}>
            <ShoppingCart size={24} color={Colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>My Cart</Text>
            <Text style={styles.infoValue}>{cartItems.length} items</Text>
            <Text style={styles.infoSubtextGreen}>Ready to view</Text>
          </TouchableOpacity>
          <View style={styles.infoCard}>
            <Home size={24} color={isCanteenOpen ? Colors.primary : Colors.error} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Canteen</Text>
            <Text style={[styles.infoValue, { color: isCanteenOpen ? Colors.text : Colors.error }]}>{isCanteenOpen ? 'Open' : 'Closed'}</Text>
            <Text style={isCanteenOpen ? styles.infoSubtextGreen : styles.infoSubtextRed}>{isCanteenOpen ? 'Closes in 6hr 15m' : 'Closed for now'}</Text>
          </View>
        </View>

        {/* Today's Special */}
        <View style={styles.specialCard}>
          <View style={styles.specialTextSection}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.specialHeader}>Today's Special</Text>
                <Bell size={14} color={Colors.textSecondary} style={{marginLeft: 5}}/>
            </View>
            <Text style={styles.specialTitle}>Bread Chilli</Text>
            <Text style={styles.specialPrice}>₹ 30 <Text style={styles.specialPriceSub}>Only</Text></Text>
            <TouchableOpacity style={styles.orderNowBtn} onPress={() => handleOrderNow(items.find(i=> i.name === 'Bread Chilli') || items[0])}>
              <Text style={styles.orderNowText}>Order now</Text>
            </TouchableOpacity>
          </View>
          <Image source={require('../../Images/Bread chilli.jpeg')} style={styles.specialImage} />
        </View>

        {/* Categories */}
        <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionBullet} />
            <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={{paddingRight:20}}>
          {FILTER_CATEGORIES.map((catName, idx) => {
            const Icon = iconMap[catName] || Coffee;
            const isActive = activeCategory === catName;
            return (
              <TouchableOpacity key={idx} style={styles.categoryItem} onPress={() => setActiveCategory(catName)}>
                <View style={[styles.categoryCircle, isActive && styles.categoryCircleActive]}>
                  <Icon size={24} color={isActive ? Colors.primary : Colors.textSecondary} />
                </View>
                <Text style={[styles.categoryName, isActive && {fontFamily: 'Outfit_700Bold'}]}>{catName}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* All Items Header */}
        <View style={[styles.sectionHeaderContainer, {justifyContent: 'space-between', paddingRight: 20}]}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <View style={styles.sectionBullet} />
                <Text style={styles.sectionTitle}>{activeCategory === 'All' ? 'Best Sellers' : activeCategory}</Text>
            </View>
            <TouchableOpacity style={{flexDirection: 'row', alignItems:'center'}} onPress={() => router.push({ pathname: '/see-all', params: { category: activeCategory }})}>
                <Text style={styles.seeAllText}>See all ({currentItems.length})</Text>
                <ChevronRight size={16} color={Colors.primary}/>
            </TouchableOpacity>
        </View>

        {/* Popular Items Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularItemsScroll}>
          {displayedItems.map((item) => {
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
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>★ {item.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
                  <View style={styles.itemBottomRow}>
                    <Text style={styles.itemPriceText}>₹ {item.price}</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                      <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          })}
        </ScrollView>

        {/* Bottom Sections: Quick Order & Active Order */}
        <View style={styles.bottomSectionsGrid}>
          {/* Quick Order - Use 'Coffee' instead of 'Filter Coffee' */}
          <TouchableOpacity style={styles.quickOrderCard} onPress={() => handleAddToCart(items.find(i=> i.name === 'Coffee') || items[0])}>
            <View style={styles.qoHeader}>
              <ReceiptText size={18} color={Colors.textSecondary} />
              <Text style={styles.qoTitle}>Quick Order</Text>
            </View>
            <Text style={styles.qoSub}>Your last order</Text>
            <Text style={styles.qoItems}>Filter Coffee</Text>
            <Text style={styles.qoTime}>• 1 day ago</Text>
            <View style={styles.qoBtn}>
              <Text style={styles.qoBtnText}>Order again </Text>
              <ChevronRight size={14} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.activeOrderCard} onPress={() => router.push('/orders')}>
            <View style={styles.aoHeader}>
              <ChefHat size={18} color={Colors.primary} />
              <Text style={styles.aoTitle}>Your Active Order</Text>
            </View>
            {activeOrders.length > 0 ? (
              <>
                <Text style={styles.aoId}>{activeOrders[0].id}</Text>
                <View style={styles.aoStatusBadge}>
                  <Text style={styles.aoStatusText}>{activeOrders[0].status}</Text>
                </View>
                <Text style={styles.aoItems} numberOfLines={1}>{activeOrders[0].items}</Text>
                <Text style={styles.aoTimeLeft}>Preparing now...</Text>
              </>
            ) : (
              <>
                <Text style={styles.aoId}>#ORD00000</Text>
                <View style={styles.aoStatusBadge}>
                  <Text style={styles.aoStatusText}>No Active</Text>
                </View>
                <Text style={styles.aoItems} numberOfLines={1}>Explore the menu!</Text>
                <Text style={styles.aoTimeLeft}>No pending orders</Text>
              </>
            )}
            
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
            
            <View style={{alignItems: 'flex-end', marginTop: 5}}>
              <Text style={styles.trackOrderText}>Track Order ></Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15, 
    backgroundColor: Colors.white, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    zIndex: 10 
  },
  scrollContent: { paddingTop: 15, paddingBottom: 100 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  headerTextContainer: { flex: 1, marginLeft: 15 },
  greetingTitle: { fontSize: 16, fontFamily: 'Outfit_400Regular', color: Colors.textSecondary },
  nameBold: { fontFamily: 'Outfit_700Bold', color: Colors.text },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: Colors.textSecondary, marginLeft: 4 },
  headerActionContainer: { flexDirection: 'row', alignItems: 'center' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 10 },
  pointsText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text },
  bellButton: { padding: 5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: 20, borderRadius: 25, paddingHorizontal: 15, height: 50, marginBottom: 20, borderWidth: 1, borderColor: Colors.inputBorder },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.text },
  infoCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  infoCard: { width: (width - 60) / 3, backgroundColor: Colors.white, borderRadius: 15, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.inputBorder },
  infoIcon: { marginBottom: 5 },
  infoTitle: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
  infoValue: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.text, marginBottom: 2 },
  infoSubtextGreen: { fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: '#00A86B' },
  specialCard: { flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: Colors.inputBorder, justifyContent: 'space-between', alignItems: 'center' },
  specialTextSection: { flex: 1 },
  specialHeader: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  specialTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: Colors.text, marginTop: 5 },
  specialPrice: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.text, marginTop: 5 },
  specialPriceSub: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: Colors.textSecondary },
  orderNowBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginTop: 15 },
  orderNowText: { color: Colors.white, fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  specialImage: { width: 100, height: 100, borderRadius: 15, marginLeft: 15 },
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionBullet: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginRight: 10 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.text },
  seeAllText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.primary },
  categoriesScroll: { paddingLeft: 20, marginBottom: 25 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEEEEE', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryCircleActive: { backgroundColor: '#FFE8CC', borderWidth: 1, borderColor: Colors.primary },
  categoryName: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.text },
  popularItemsScroll: { paddingLeft: 20, paddingBottom: 20 },
  itemCard: { width: 220, backgroundColor: Colors.white, borderRadius: 15, marginRight: 15, borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden' },
  itemImageContainer: { position: 'relative', height: 130, width: '100%' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 20 },
  itemContent: { padding: 15 },
  itemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  itemName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text, flex: 1 },
  ratingBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingBadgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: Colors.text },
  itemDesc: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.textSecondary, marginBottom: 15, height: 30 },
  itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPriceText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.text },
  addButton: { backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 15 },
  addButtonText: { color: Colors.white, fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  bottomSectionsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
  quickOrderCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 15, padding: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  qoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  qoTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text, marginLeft: 8 },
  qoSub: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: '#999', marginBottom: 5 },
  qoItems: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.text },
  qoTime: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: Colors.primary, marginBottom: 10 },
  qoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start' },
  qoBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.primary },
  activeOrderCard: { flex: 1.5, backgroundColor: Colors.white, borderRadius: 15, padding: 15, borderWidth: 1, borderColor: Colors.inputBorder },
  aoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aoTitle: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text, marginLeft: 8 },
  aoId: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: '#999' },
  aoStatusBadge: { backgroundColor: '#FFE8CC', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, position: 'absolute', right: 15, top: 40 },
  aoStatusText: { color: Colors.primary, fontFamily: 'Outfit_600SemiBold', fontSize: 10 },
  aoItems: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.text, marginTop: 5, width: '70%' },
  aoTimeLeft: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: Colors.textSecondary, marginBottom: 8 },
  progressBarBg: { height: 6, backgroundColor: '#EEEEEE', borderRadius: 3, width: '100%' },
  progressBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3, width: '60%' },
  trackOrderText: { fontFamily: 'Outfit_600SemiBold', fontSize: 10, color: Colors.primary },
  infoSubtextGreen: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  infoSubtextRed: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.error,
    marginTop: 2,
  },
});
