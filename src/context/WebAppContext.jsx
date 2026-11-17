import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MOCK_ITEMS } from '../constants/MockData';

const WebAppContext = createContext();

export const WebAppProvider = ({ children }) => {
  // Demo Student Default for immediate recruiter testing
  const DEFAULT_STUDENT = {
    id: 'demo-student-id-1234',
    email: 'demo_student@nandhacen.edu.in',
    full_name: 'Gokulraj (Student)',
    role: 'student',
    wallet_balance: 450.00,
    loyalty_points: 180,
  };

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dinexpress_user');
      return saved ? JSON.parse(saved) : DEFAULT_STUDENT;
    } catch {
      return DEFAULT_STUDENT;
    }
  });

  const [products, setProducts] = useState(MOCK_ITEMS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dinexpress_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('dinexpress_favs');
      return saved ? JSON.parse(saved) : [1, 2, 11, 31, 51];
    } catch {
      return [1, 2, 11, 31, 51];
    }
  });

  const [smartCardBalance, setSmartCardBalance] = useState(user?.wallet_balance || 450.00);
  const [points, setPoints] = useState(user?.loyalty_points || 180);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'favorites' | 'kitchen' | 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCanteenOpen, setIsCanteenOpen] = useState(true);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3200);
  };

  // Orders State (Seed initial mock orders for recruiter demo)
  const [allOrders, setAllOrders] = useState([
    {
      id: 'ORD-8921',
      dbId: '8921',
      user_id: 'demo-student-id-1234',
      userName: 'Gokulraj (Student)',
      items_summary: 'Masala Dosa x2, Tea x1',
      total_amount: 100,
      status: 'preparing',
      payment_method: 'rfid_tap',
      created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-7643',
      dbId: '7643',
      user_id: 'demo-student-id-1234',
      userName: 'Gokulraj (Student)',
      items_summary: 'Chicken Briyani x1, Lemon Juice x1',
      total_amount: 150,
      status: 'ready',
      payment_method: 'wallet',
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-5512',
      dbId: '5512',
      user_id: 'user-2',
      userName: 'Hamsha N',
      items_summary: 'Veg Briyani x1, Mullampalam x1',
      total_amount: 105,
      status: 'pending',
      payment_method: 'upi',
      created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-3319',
      dbId: '3319',
      user_id: 'demo-student-id-1234',
      userName: 'Gokulraj (Student)',
      items_summary: 'Puffs x2, Filter Coffee x1',
      total_amount: 45,
      status: 'delivered',
      payment_method: 'rfid_tap',
      created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    },
  ]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dinexpress_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Cart storage error:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('dinexpress_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Favorites storage error:', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('dinexpress_user', JSON.stringify(user));
    } catch (e) {
      console.warn('User storage error:', e);
    }
  }, [user]);

  // Check for real active Supabase Session on initial mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const role =
            profile?.role ||
            (session.user.email?.endsWith('.edu.in')
              ? 'admin'
              : session.user.email?.endsWith('@gmail.com')
              ? 'worker'
              : 'student');

          const realUser = {
            id: session.user.id,
            email: session.user.email,
            full_name:
              profile?.full_name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0],
            role: role,
            wallet_balance: parseFloat(profile?.wallet_balance || 450.00),
            loyalty_points: profile?.loyalty_points || 180,
            isRealAuth: true,
          };
          setUser(realUser);
          setSmartCardBalance(realUser.wallet_balance);
        }
      } catch (err) {
        console.warn('Supabase session restoration skipped:', err);
      }
    };

    restoreSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        restoreSession();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch Products from Supabase with fallback to MOCK_ITEMS
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to local mock data
        setProducts(MOCK_ITEMS);
      }
    } catch (err) {
      console.warn('Supabase fetch products error, using fallback:', err);
      setProducts(MOCK_ITEMS);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch Orders from Supabase
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id(full_name)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted = data.map((o) => ({
          ...o,
          dbId: o.id,
          id: `ORD-${(o.id || '').toString().slice(0, 4).toUpperCase()}`,
          userName: o.profiles?.full_name || 'Campus Student',
          items_summary: o.items_summary || 'Food Items',
          total_amount: parseFloat(o.total_amount || 0),
          status: o.status || 'pending',
          payment_method: o.payment_method || 'wallet',
          created_at: o.created_at || new Date().toISOString(),
        }));
        setAllOrders(formatted);
      }
    } catch (err) {
      console.warn('Supabase fetch orders error, keeping local queue:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchOrders();

    // Setup Supabase Realtime Channels
    try {
      const ordersChannel = supabase
        .channel('realtime-orders-web')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          fetchOrders();
          if (payload.eventType === 'INSERT') {
            showToast('New incoming order received! 🍜', 'info');
          }
        })
        .subscribe();

      const productsChannel = supabase
        .channel('realtime-products-web')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchProducts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(productsChannel);
      };
    } catch (e) {
      console.warn('Realtime subscription not active:', e);
    }
  }, [fetchProducts, fetchOrders]);

  // Recruiter 1-click Role Switcher
  const switchRole = (newRole) => {
    if (newRole === 'admin') {
      const adminUser = {
        id: 'admin-master-id',
        email: 'admin@nandhacen.edu.in',
        full_name: 'Admin Master',
        role: 'admin',
        wallet_balance: 5000.00,
        loyalty_points: 999,
      };
      setUser(adminUser);
      setSmartCardBalance(adminUser.wallet_balance);
      setActiveTab('admin');
      showToast('Switched to System Admin Console 🛡️', 'info');
    } else if (newRole === 'worker') {
      const workerUser = {
        id: 'worker-chef-id',
        email: 'staff@gmail.com',
        full_name: 'Kitchen Chef',
        role: 'worker',
        wallet_balance: 120.00,
        loyalty_points: 50,
      };
      setUser(workerUser);
      setSmartCardBalance(workerUser.wallet_balance);
      setActiveTab('kitchen');
      showToast('Switched to Kitchen Worker Console 👨‍🍳', 'info');
    } else {
      const studentUser = {
        id: 'demo-student-id-1234',
        email: 'demo_student@nandhacen.edu.in',
        full_name: 'Gokulraj (Student)',
        role: 'student',
        wallet_balance: 450.00,
        loyalty_points: 180,
      };
      setUser(studentUser);
      setSmartCardBalance(studentUser.wallet_balance);
      setActiveTab('menu');
      showToast('Switched to Student Ordering Mode 🎓', 'info');
    }
  };

  // Cart Operations
  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart! 🛒`, 'success');
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Favorites
  const toggleFavorite = async (id) => {
    const numId = Number(id);
    const isFav = favorites.includes(numId);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter((f) => f !== numId);
      showToast('Removed from favorites', 'info');
    } else {
      newFavs = [...favorites, numId];
      showToast('Added to favorites! ❤️', 'success');
    }
    setFavorites(newFavs);

    if (user?.id) {
      try {
        if (isFav) {
          await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', numId);
        } else {
          await supabase.from('favorites').insert([{ user_id: user.id, product_id: numId }]);
        }
      } catch (e) {
        console.warn('Favorites DB sync error:', e);
      }
    }
  };

  const isFavorite = (id) => favorites.includes(Number(id));

  // Wallet Recharge
  const rechargeWallet = async (amount) => {
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) return;
    const newBal = smartCardBalance + numAmt;
    setSmartCardBalance(newBal);
    setUser((prev) => ({ ...prev, wallet_balance: newBal }));
    showToast(`Wallet Recharged: +₹${numAmt} 🎉`, 'success');

    try {
      if (user?.id && user?.id !== 'demo-student-id-1234') {
        await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', user.id);
        await supabase.from('transactions').insert([
          {
            profile_id: user.id,
            amount: numAmt,
            type: 'topup',
            description: 'RFID Wallet Recharge via Web',
          },
        ]);
      }
    } catch (e) {
      console.warn('Recharge DB sync error:', e);
    }
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Place Order
  const placeOrder = async ({ paymentMethod = 'rfid_tap' }) => {
    if (isPlacingOrder) return false;
    if (cartItems.length === 0) {
      showToast('Your cart is empty!', 'error');
      return false;
    }

    setIsPlacingOrder(true);
    try {
      const total = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

      if (paymentMethod === 'rfid_tap' || paymentMethod === 'wallet') {
        if (smartCardBalance < total) {
          showToast('Insufficient RFID Balance! Please recharge.', 'error');
          setIsWalletModalOpen(true);
          return false;
        }
      }

      const itemsSummary = cartItems.map((i) => `${i.name} x${i.quantity}`).join(', ');
      const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: newOrderId,
        dbId: newOrderId,
        user_id: user?.id || 'demo-student-id-1234',
        userName: user?.full_name || 'Gokulraj (Student)',
        items_summary: itemsSummary,
        total_amount: total,
        status: 'pending',
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      };

      // Deduct Balance if wallet/rfid
      if (paymentMethod === 'rfid_tap' || paymentMethod === 'wallet') {
        const updatedBalance = smartCardBalance - total;
        setSmartCardBalance(updatedBalance);
        setUser((prev) => ({ ...prev, wallet_balance: updatedBalance }));
      }

      // Award loyalty points
      const earnedPoints = Math.floor(total / 10);
      setPoints((prev) => prev + earnedPoints);

      // Update Local Orders
      setAllOrders((prev) => [newOrder, ...prev]);
      clearCart();
      setIsCartOpen(false);
      setIsPaymentModalOpen(false);
      setActiveTab('orders');
      showToast(`Order #${newOrderId} placed successfully! 🍛`, 'success');

      // Attempt DB sync
      try {
        await supabase.from('orders').insert([
          {
            items_summary: itemsSummary,
            total_amount: total,
            status: 'pending',
            payment_method: paymentMethod,
            user_id: user?.id && user.id.includes('-') && user.id.length > 20 ? user.id : null,
          },
        ]);
        await supabase.from('user_logs').insert([
          {
            email: user?.email || 'guest@nandhacen.edu.in',
            event_type: 'ORDER_PLACED_WEB',
          },
        ]);
      } catch (e) {
        console.warn('Order DB sync error:', e);
      }

      return true;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Update Order Status (Worker/Admin)
  const updateOrderStatus = async (orderId, newStatus) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.dbId === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order ${orderId} moved to ${newStatus.toUpperCase()} 👨‍🍳`, 'info');

    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    } catch (e) {
      console.warn('Status DB sync error:', e);
    }
  };

  // Cancel Order
  const cancelOrder = async (orderId) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.dbId === orderId ? { ...o, status: 'cancelled' } : o))
    );
    showToast(`Order ${orderId} cancelled`, 'info');

    try {
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    } catch (e) {
      console.warn('Cancel order DB sync error:', e);
    }
  };

  // Toggle Product Availability (Admin)
  const toggleProductAvailability = async (productId, currentStatus) => {
    const newStatus = !currentStatus;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_available: newStatus } : p))
    );
    showToast(`Product ${newStatus ? 'Activated' : 'Marked Out of Stock'}`, 'info');

    try {
      await supabase.from('products').update({ is_available: newStatus }).eq('id', productId);
    } catch (e) {
      console.warn('Product availability DB sync error:', e);
    }
  };

  // Auth Operations
  const loginWithEmail = async (email, password) => {
    const trimmed = (email || '').trim().toLowerCase();

    // 1. Admin Bypass check
    if (trimmed.endsWith('.edu.in') && password === 'admin123') {
      const adminUser = {
        id: 'admin-master-id',
        email: trimmed,
        full_name: 'System Admin',
        role: 'admin',
        wallet_balance: 5000.00,
        loyalty_points: 999,
      };
      setUser(adminUser);
      setSmartCardBalance(adminUser.wallet_balance);
      setIsAuthModalOpen(false);
      setActiveTab('admin');
      showToast('Logged in as Admin 🛡️', 'success');
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password: password,
      });

      if (error) {
        // Fallback for demo emails
        let role = 'student';
        if (trimmed.endsWith('.edu.in')) role = 'admin';
        else if (trimmed.endsWith('@gmail.com')) role = 'worker';

        const fallbackUser = {
          id: `usr-${Date.now()}`,
          email: trimmed,
          full_name: trimmed.split('@')[0],
          role: role,
          wallet_balance: 350.00,
          loyalty_points: 100,
        };
        setUser(fallbackUser);
        setSmartCardBalance(fallbackUser.wallet_balance);
        setIsAuthModalOpen(false);
        setActiveTab(role === 'admin' ? 'admin' : role === 'worker' ? 'kitchen' : 'menu');
        showToast(`Welcome back, ${fallbackUser.full_name}! 👋`, 'success');
        return true;
      }

      if (data?.user) {
        let role = 'student';
        if (trimmed.endsWith('.edu.in')) role = 'admin';
        else if (trimmed.endsWith('@gmail.com')) role = 'worker';

        const loggedUser = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || trimmed.split('@')[0],
          role: role,
          wallet_balance: 400.00,
          loyalty_points: 150,
        };
        setUser(loggedUser);
        setSmartCardBalance(loggedUser.wallet_balance);
        setIsAuthModalOpen(false);
        setActiveTab(role === 'admin' ? 'admin' : role === 'worker' ? 'kitchen' : 'menu');
        showToast('Login successful! 🎉', 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return false;
    }
  };

  const registerWithEmail = async (email, password, fullName, chosenRole = 'student') => {
    const trimmed = (email || '').trim().toLowerCase();
    const newUser = {
      id: `usr-${Date.now()}`,
      email: trimmed,
      full_name: fullName || trimmed.split('@')[0],
      role: chosenRole,
      wallet_balance: 200.00,
      loyalty_points: 50,
    };
    setUser(newUser);
    setSmartCardBalance(newUser.wallet_balance);
    setIsAuthModalOpen(false);
    setActiveTab(chosenRole === 'admin' ? 'admin' : chosenRole === 'worker' ? 'kitchen' : 'menu');
    showToast(`Account created! Welcome, ${newUser.full_name} 🎉`, 'success');

    try {
      await supabase.auth.signUp({
        email: trimmed,
        password: password,
        options: { data: { full_name: fullName, role: chosenRole } },
      });
    } catch (e) {
      console.warn('Supabase signup error:', e);
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
    setActiveTab('menu');
    showToast('Logged out successfully', 'info');
    try {
      supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout error:', e);
    }
  };

  const myOrders = allOrders.filter(
    (o) => o.user_id === user?.id || (user?.email && o.user_id === 'demo-student-id-1234')
  );

  return (
    <WebAppContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        products,
        loadingProducts,
        fetchProducts,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        isFavorite,
        smartCardBalance,
        rechargeWallet,
        points,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isCanteenOpen,
        setIsCanteenOpen,
        allOrders,
        myOrders,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        toggleProductAvailability,
        isCartOpen,
        setIsCartOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        toast,
        showToast,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </WebAppContext.Provider>
  );
};

export const useWebApp = () => useContext(WebAppContext);
