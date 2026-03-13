import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthSubscription, useIsAuthenticated } from '@/features/auth/hooks/useAuth';
import { useHouseholdSubscription } from '@/features/household/hooks/useHousehold';
import { useCurrentUserDoc } from '@/features/auth/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AuthGate() {
  useAuthSubscription();
  useHouseholdSubscription();

  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const userDoc = useCurrentUserDoc();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but in auth group — redirect based on household
      if (userDoc?.householdId) {
        router.replace('/(app)/(home)');
      } else {
        router.replace('/(auth)/join-household');
      }
    } else if (isAuthenticated && !inAuthGroup) {
      // In app group but no household yet
      if (!userDoc?.householdId && segments[0] !== '(auth)') {
        router.replace('/(auth)/join-household');
      }
    }
  }, [isAuthenticated, isLoading, userDoc?.householdId, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
