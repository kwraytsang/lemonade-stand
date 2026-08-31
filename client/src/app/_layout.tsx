import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/common/animated-icon';
import { ToastProvider } from '@/components/common/toast';
import { Colors } from '@/constants/theme';
import { CartProvider } from '@/context/cart-context';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ToastProvider>
            <CartProvider>
              <AnimatedSplashOverlay />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  headerTitleStyle: { fontWeight: '600' },
                  headerShadowVisible: false,
                  headerBackButtonDisplayMode: 'minimal',
                }}>
                <Stack.Screen name="index" options={{ title: 'Lemonade Stand' }} />
                <Stack.Screen name="cart" options={{ title: 'Your Order' }} />
                <Stack.Screen name="details" options={{ title: 'Your Details' }} />
                <Stack.Screen name="review" options={{ title: 'Review Order' }} />
                <Stack.Screen
                  name="success"
                  options={{ title: '', headerBackVisible: false, gestureEnabled: false }}
                />
              </Stack>
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
