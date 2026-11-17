import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import CustomModal from '../components/CustomModal';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [points, setPoints] = useState(150);
  const [smartCardBalance, setSmartCardBalance] = useState(750); 

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    message: '',
    primaryBtnText: 'OK',
    secondaryBtnText: '',
    onPrimaryPress: null,
    onSecondaryPress: null
  });

  const showPopup = (config) => {
    setModalConfig({
      type: config.type || 'success',
      message: config.message || '',
      primaryBtnText: config.primaryBtnText || 'OK',
      secondaryBtnText: config.secondaryBtnText || '',
      onPrimaryPress: config.onPrimaryPress || null,
      onSecondaryPress: config.onSecondaryPress || null
    });
    setModalVisible(true);
    
    if (config.type === 'toast') {
        const timer = setTimeout(() => setModalVisible(false), 2000);
        return () => clearTimeout(timer);
    }
  };

  const [products, setProducts] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isCanteenOpen, setIsCanteenOpen] = useState(true);
  const [isCanteenLoading, setIsCanteenLoading] = useState(true);

  // Sync Canteen Status
  useEffect(() => {
    fetchCanteenStatus();
    
    const settingsChannel = supabase
      .channel('system-settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `email=eq.admin@nandhacen.edu.in` }, (payload) => {
          // We use the admin's 'dark_mode' column as a hacky way to store canteen status 
          // if we don't want to create new tables, OR we just use a specific admin profile field.
          // For now, let's just use local state + worker update.
      })
      .subscribe();

    return () => supabase.removeChannel(settingsChannel);
  }, []);

  const fetchCanteenStatus = async () => {
     // Mocking for demo - In production this would be a DB fetch
     setIsCanteenLoading(false);
  };

  const toggleCanteenStatus = () => {
    setIsCanteenOpen(prev => !prev);
  };

  useEffect(() => {
    checkUser();
    fetchProducts();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        checkUser(); // Re-fetch full profile including role
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [allOrders, setAllOrders] = useState([]);

  // Worker Side: Fetch every order in the system
  const fetchAllOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles:user_id(full_name)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAllOrders(data);
    }
  }, []);

  // Sync balance and subscribe to global orders
  useEffect(() => {
    if (user) {
      fetchUserBalance();
      fetchFavorites();
      
      // 1. Subscribe to MY orders (For Students)
      const myOrdersChannel = supabase
        .channel('my-orders')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'orders',
            filter: `user_id=eq.${user.id}`
        }, (payload) => {
            // fetchMyOrders(); 
            
            if (payload.new && payload.old && payload.new.status !== payload.old.status) {
                const status = payload.new.status.toLowerCase();
                const orderIdShort = payload.new.id.slice(0,8).toUpperCase();

                if (status === 'accepted') {
                    showPopup({
                        type: 'success',
                        message: `Chef Accepted Order #${orderIdShort}! 👨‍🍳`,
                        primaryBtnText: 'Great!'
                    });
                } else if (status === 'ready') {
                    showPopup({
                        type: 'success',
                        message: `Order #${orderIdShort} is READY for Pickup! 🍜`,
                        primaryBtnText: 'I am coming!'
                    });
                }
            }
        })
        .subscribe();

      // 2. Subscribe to ALL orders (For Workers/Admins)
      const globalOrdersChannel = supabase
        .channel('global-orders')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'orders' 
        }, (payload) => {
            fetchAllOrders();
            
            // Notify Worker/Admin of new influx
            showPopup({
                type: 'toast',
                message: `New Order Received! 🍜`,
            });
        })
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders' 
        }, () => {
            fetchAllOrders();
        })
        .subscribe();

      // 3. Subscribe to MY PROFILE (For Wallet Balance Sync)
      const myProfileChannel = supabase
        .channel('my-profile')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${user.id}`
        }, () => {
            fetchUserBalance();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(myOrdersChannel);
        supabase.removeChannel(globalOrdersChannel);
        supabase.removeChannel(myProfileChannel);
      };
    }
  }, [user, fetchAllOrders]);

  useEffect(() => {
    fetchProducts();
    
    // ðŸ” Subscribe to REAL-TIME MENU UPDATES
    const productsChannel = supabase
        .channel('menu-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
            fetchProducts();
        })
        .subscribe();

    const profilesChannel = supabase
        .channel('profile-sync')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, async (payload) => {
            const isMe = payload.new.id === user?.id;
            console.log(`👤 Tap Detected for: ${payload.new.full_name} | Match: ${isMe ? 'YES' : 'NO'} | Cart: ${cartItems.length} items`);
            
            if (isMe) {
                // 🚀 HARDWARE TRIGGER FOR LOGGED IN USER
                if (cartItems.length > 0) {
                   const itemsSummary = cartItems.map(i => `${i.name} x${i.quantity}`).join(', ');
                   const total = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
                   
                   console.log('💎 Remote Placing Order for ₹' + total);
                   await placeOrder({
                      itemsSummary: itemsSummary,
                      total_amount: total,
                      paymentMethod: 'rfid_tap',
                      status: 'pending' 
                   });
                   
                   setCartItems([]);
                } else {
                   showPopup({
                      type: 'toast',
                      message: '🎯 RFID Tap Detected! Cart is empty.'
                   });
                }
            }
        })
        .subscribe();

    const ordersChannel = supabase
        .channel('orders-hub')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
            console.log('Order Sync:', payload.eventType);
            fetchAllOrders();
            fetchMyOrders();
            
            // 🎯 RFID Success Signal
            if (payload.new && payload.new.status === 'completed' && payload.new.user_id === user?.id) {
               showPopup({
                  type: 'success',
                  message: `Payment Successful! 🍛\n₹${payload.new.total_amount} deducted from RFID Wallet.`,
                  primaryBtnText: 'View Order',
                  onPrimaryPress: () => router.push('/(tabs)/orders')
               });
               refreshUser(); // 💸 Balance drops instantly on screen!
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(profilesChannel);
    };
  }, [user?.id, cartItems]);

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch COMPLETE profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const userData = { 
          ...session.user, 
          ...profile, 
          role: profile?.role || 'student' 
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh User Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUser = refreshUser;

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (!error && data) {
      if (data.length === 0) {
        // One-time seeding for demo purposes
        const { MOCK_ITEMS } = require('../constants/MockData');
        const seedItems = MOCK_ITEMS.map(item => ({
          name: item.name,
          price: parseFloat(item.price),
          category: item.category,
          is_available: true,
          image_url: null
        }));
        await supabase.from('products').insert(seedItems);
        
        // Re-fetch to get real DB items
        const { data: newData } = await supabase.from('products').select('*').order('name');
        setProducts(newData || []);
      } else {
        setProducts(data);
      }
    }
  };




  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const fetchUserBalance = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_balance, loyalty_points, dark_mode')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setSmartCardBalance(parseFloat(data.wallet_balance || 0));
      setPoints(data.loyalty_points || 0);
    }
  }, [user]);

  const rechargeSmartCard = async (amount) => {
    if (!user) return;
    const newBalance = smartCardBalance + amount;
    
    // Update DB
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id);

    if (!error) {
       setSmartCardBalance(newBalance);
       showPopup({ type: 'toast', message: `Card Recharged: +₹${amount} ✅` });
       
       // Record Transaction
       await supabase.from('transactions').insert([{
         profile_id: user.id,
         amount: amount,
         type: 'topup',
         description: 'Wallet recharge via UPI/Card'
       }]);
    } else {
       showPopup({ type: 'toast', message: 'Recharge failed ❌' });
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const dbStatus = newStatus.toLowerCase();
    const targetId = orderId.startsWith('#ORD') ? activeOrders.find(o => o.id === orderId)?.dbId : orderId;

    if (!targetId) return;

    const { error } = await supabase.from('orders').update({ status: dbStatus }).eq('id', targetId);

    if (!error) {
      // 📜 AUDIT LOG: Who updated this order?
      await supabase.from('user_logs').insert([{
        user_id: user.id,
        email: user.email,
        event_type: 'ORDER_STATUS_UPDATE',
        created_at: new Date().toISOString()
      }]);

      setActiveOrders(prev => prev.map(order => 
        (order.id === orderId || order.dbId === targetId) ? { ...order, status: dbStatus } : order
      ));
      
      let msg = `Order ${newStatus}`;
      if (dbStatus === 'ready') msg = 'Order ready for Pickup! 🔔';
      showPopup({ type: 'toast', message: msg });
    }
  };

  const cancelOrder = async (orderId) => {
    const targetId = orderId.startsWith('#ORD') ? activeOrders.find(o => o.id === orderId)?.dbId : orderId;
    if (!targetId) return;

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', targetId);
    
    if (!error) {
       setActiveOrders(prev => prev.filter(o => o.id !== orderId));
       showPopup({ type: 'toast', message: 'Order Cancelled and Recorded 🚫' });
    } else {
       showPopup({ type: 'toast', message: 'Failed to cancel order in DB' });
    }
  };
  const simulateRFIDTap = (orderId) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (order && order.status.toLowerCase() === 'ready') {
      updateOrderStatus(orderId, 'completed');
    } else {
      showPopup({ type: 'toast', message: 'Ready status required! ❌' });
    }
  };

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setFavorites(data.map(f => f.product_id));
    }
  }, [user]);

  const toggleFavorite = async (rawId) => {
    if (!user) {
        showPopup({ type: 'toast', message: 'Please login to favorite items!' });
        return;
    }
    
    // Ensure ID is a clean Number for comparison
    const productId = Number(rawId);
    const isFav = favorites.some(id => Number(id) === productId);

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (!error) {
        setFavorites(prev => prev.filter(id => Number(id) !== productId));
        showPopup({ type: 'toast', message: 'Removed from favorites' });
      } else {
        console.error("Fav Delete Error:", error.message, error.code);
        showPopup({ type: 'toast', message: `Error: ${error.message} ❌` });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, product_id: productId }]);
      
      if (!error) {
        setFavorites(prev => [...prev, productId]);
        showPopup({ type: 'toast', message: 'Added to favorites ❤️' });
      } else {
        console.error("Fav Insert Error:", error.message, error.code, productId);
        showPopup({ type: 'toast', message: `DB Error: ${error.message} ❌` });
      }
    }
  };

  const isFavorite = (rawId) => favorites.some(id => Number(id) === Number(rawId));
  const addPoints = (p) => setPoints(prev => prev + p);

  const placeOrder = async (orderDetails) => {
    if (!user) throw new Error("Please log in to order");
    if (orderDetails.paymentMethod !== 'upi' && smartCardBalance < orderDetails.totalAmount) {
        throw new Error("Insufficient Balance! Please recharge your wallet.");
    }

    try {
        // 1. Create Transaction for Payment
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: user.id,
            total_amount: orderDetails.total_amount || orderDetails.totalAmount, // Handle both
            status: 'pending',
            items_summary: orderDetails.itemsSummary,
            payment_method: orderDetails.paymentMethod || 'wallet'
          }])
          .select()
          .single();
        
        if (orderError) throw orderError;
        
        // 2. Update Profile Balance (Only if not UPI)
        if (orderDetails.paymentMethod !== 'upi') {
            const newBalance = smartCardBalance - (orderDetails.total_amount || orderDetails.totalAmount);
            const { error: balanceError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
            if (balanceError) throw balanceError;
            setSmartCardBalance(newBalance);
        }

        // 3. Record Transaction
        const { error: txnError } = await supabase.from('transactions').insert([{
          profile_id: user.id,
          amount: -(orderDetails.total_amount || orderDetails.totalAmount),
          type: 'purchase',
          description: `Order ${orderData.id.split('-')[0].toUpperCase()}`
        }]);
        if (txnError) throw txnError;

        // 4. Audit Log
        await supabase.from('user_logs').insert([{
            user_id: user.id,
            email: user.email,
            event_type: 'ORDER_PLACED',
            created_at: new Date().toISOString()
        }]);

        setActiveOrders(prev => [orderData, ...prev]);
        setAllOrders(prev => [orderData, ...prev]);
        return orderData;
    } catch (err) {
        console.error('CRITICAL ORDER ERROR:', err);
        Alert.alert("Store Error", `Transaction failed: ${err.message}`);
        throw err;
    }
  };

  const fetchMyOrders = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setActiveOrders(data.map(o => ({
        ...o,
        dbId: o.id,
        items: o.items_summary,
        total: `₹ ${o.total_amount}`,
        id: `#ORD${o.id.split('-')[0].toUpperCase()}`
      })));
    }
  };


  return (
    <AppContext.Provider value={{ 
      user, setUser, loading, refreshUser,
      cartItems, addToCart, removeFromCart: (id) => setCartItems(p => p.filter(i => i.id !== id)), 
      updateQuantity: (id, d) => {
        setCartItems(prev => prev.map(item => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + d);
            return { ...item, quantity: newQty };
          }
          return item;
        }));
      }, clearCart: () => setCartItems([]),
      favorites, toggleFavorite, isFavorite,
      points, setPoints, addPoints, smartCardBalance, setSmartCardBalance, rechargeSmartCard,
      activeOrders, setActiveOrders, placeOrder, updateOrderStatus, simulateRFIDTap, cancelOrder,
      fetchMyOrders, fetchAllOrders,
      products, fetchProducts,
      isCanteenOpen, toggleCanteenStatus,
      allOrders, fetchAllOrders,
      showPopup
    }}>
      {children}
      <CustomModal visible={modalVisible} onClose={() => setModalVisible(false)} {...modalConfig} />
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
