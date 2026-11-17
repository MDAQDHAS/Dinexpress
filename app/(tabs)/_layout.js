import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, ShoppingCart, Heart, ClipboardList, User } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useAppContext } from '../../context/AppContext';

export default function TabLayout() {
  const { isDarkMode } = useAppContext();
  
  const theme = {
    background: isDarkMode ? '#121212' : Colors.background,
    text: isDarkMode ? '#FFFFFF' : Colors.text,
    card: isDarkMode ? '#1E1E1E' : Colors.white,
    primary: Colors.primary
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: isDarkMode ? '#333' : '#EEE',
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 12,
        }
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
