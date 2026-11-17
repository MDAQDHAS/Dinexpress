import { Stack } from 'expo-router';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppProvider } from '../context/AppContext';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(worker)" />
        <Stack.Screen name="scanner" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="worker-emp-profile" />
        <Stack.Screen name="worker-notif" />
        <Stack.Screen name="worker-privacy" />
        <Stack.Screen name="worker-support" />
        <Stack.Screen name="worker-app-settings" />
        <Stack.Screen name="worker-order-detail" />
      </Stack>
    </AppProvider>
  );
}
