import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { api } from "./api";

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request push notification permissions and register the device token.
 * Returns the Expo push token or null if permissions denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  // Get the push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData.data;

    // Configure iOS-specific settings
    if (Platform.OS === "ios") {
      await Notifications.setNotificationCategoryAsync("review", [
        {
          identifier: "respond",
          buttonTitle: "Respond",
          options: { opensAppToForeground: true },
        },
        {
          identifier: "dismiss",
          buttonTitle: "Dismiss",
          options: { isDestructive: true },
        },
      ]);
    }

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Register the push token with the backend API.
 */
export async function registerDeviceToken(token: string): Promise<void> {
  try {
    await api("/api/mobile/devices/register", {
      method: "POST",
      body: {
        token,
        platform: Platform.OS,
      },
    });
  } catch (error) {
    console.error("Error registering device token:", error);
  }
}

/**
 * Unregister the device token (call on logout).
 */
export async function unregisterDeviceToken(token: string): Promise<void> {
  try {
    await api("/api/mobile/devices/register", {
      method: "DELETE",
      body: { token },
    });
  } catch {
    // Best-effort — don't block logout
  }
}

/**
 * Extract a review ID from a notification's data payload.
 */
export function getReviewIdFromNotification(
  notification: Notifications.Notification
): string | null {
  const data = notification.request.content.data;
  if (!data) return null;
  return (data.reviewId as string) ?? (data.review_id as string) ?? null;
}
