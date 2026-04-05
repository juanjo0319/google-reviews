import { useEffect, useRef, useState } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import "@/i18n"; // Initialize i18n
import type { EventSubscription } from "expo-modules-core";
import { useColorScheme, AppState, View } from "react-native";
import "react-native-reanimated";
import { useAuthStore } from "@/lib/auth-store";
import {
  registerForPushNotifications,
  registerDeviceToken,
  getReviewIdFromNotification,
} from "@/lib/notifications";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import {
  isBiometricEnabled,
  authenticateWithBiometric,
  isBiometricAvailable,
} from "@/lib/biometric";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, isAuthenticated, loadSession, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const notificationListener = useRef<EventSubscription>(null);
  const responseListener = useRef<EventSubscription>(null);
  const { isConnected } = useNetworkStatus();
  const [biometricLocked, setBiometricLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Hide splash when loaded
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Biometric lock on app foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active" &&
        isAuthenticated
      ) {
        const available = await isBiometricAvailable();
        if (available && isBiometricEnabled()) {
          setBiometricLocked(true);
          const success = await authenticateWithBiometric();
          setBiometricLocked(!success);
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  // Register push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        registerDeviceToken(token);
      }
    });

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification.request.content.title);
      });

    // Handle notification taps (app opened from notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const reviewId = getReviewIdFromNotification(response.notification);
        if (reviewId) {
          router.push(`/(app)/reviews/${reviewId}` as never);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);

  // Auth gate: redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      if (user && !user.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/(app)/(dashboard)");
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  // Handle notification that launched the app (cold start)
  useEffect(() => {
    if (!isAuthenticated) return;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const reviewId = getReviewIdFromNotification(response.notification);
        if (reviewId) {
          router.push(`/(app)/reviews/${reviewId}` as never);
        }
      }
    });
  }, [isAuthenticated]);

  if (isLoading || biometricLocked) {
    return (
      <View style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#151718" : "#F8F9FA" }}>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        {!isConnected && <OfflineBanner />}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
