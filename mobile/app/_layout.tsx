import { useEffect, useRef } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import type { EventSubscription } from "expo-modules-core";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { useAuthStore } from "@/lib/auth-store";
import {
  registerForPushNotifications,
  registerDeviceToken,
  getReviewIdFromNotification,
} from "@/lib/notifications";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, isAuthenticated, loadSession, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const notificationListener = useRef<EventSubscription>(null);
  const responseListener = useRef<EventSubscription>(null);

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
        // Could update badge count or show in-app toast here
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </ThemeProvider>
  );
}
