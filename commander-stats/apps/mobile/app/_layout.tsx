import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { getDb } from '../lib/db';
import { useSettingsStore } from '../lib/store/settingsStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize the database
    getDb().catch(console.error);
    // Load settings
    loadSettings().catch(console.error);
  }, [loadSettings]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor="#0f0f0f" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#0f0f0f' },
              headerTintColor: '#ffffff',
              headerTitleStyle: { color: '#ffffff', fontWeight: '600' },
              contentStyle: { backgroundColor: '#0f0f0f' },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="game/[id]"
              options={{ title: 'Game Details', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="scan/index"
              options={{ title: 'Scan Board State', headerBackTitle: 'Back' }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
