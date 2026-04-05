import * as LocalAuthentication from "expo-local-authentication";
import { createMMKV, type MMKV } from "react-native-mmkv";

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (!_storage) {
    _storage = createMMKV({ id: "reviewai-biometric" });
  }
  return _storage;
}

const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

/**
 * Check if the device supports biometric auth (Face ID / Touch ID).
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * Get the type of biometric auth available.
 */
export async function getBiometricType(): Promise<string> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return "Face ID";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return "Touch ID";
  }
  return "Biometric";
}

/**
 * Check if the user has enabled biometric lock.
 */
export function isBiometricEnabled(): boolean {
  return getStorage().getBoolean(BIOMETRIC_ENABLED_KEY) ?? false;
}

/**
 * Toggle biometric lock on/off.
 */
export function setBiometricEnabled(enabled: boolean) {
  getStorage().set(BIOMETRIC_ENABLED_KEY, enabled);
}

/**
 * Prompt for biometric authentication. Returns true if successful.
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock ReviewAI",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });
  return result.success;
}
