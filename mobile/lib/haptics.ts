import * as Haptics from "expo-haptics";

/**
 * Light tap — tab switches, toggle, chip selection.
 */
export function tapLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Medium tap — pull-to-refresh complete, action button press.
 */
export function tapMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Success — response approved, published, saved.
 */
export function notifySuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Warning — destructive action confirmation.
 */
export function notifyWarning() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Error — failed action.
 */
export function notifyError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
