import { View, Text, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";

/**
 * Persistent banner shown when the device has no network connectivity.
 */
export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <WifiOff size={14} color="#fff" />
      <Text style={styles.text}>You're offline. Changes will sync when reconnected.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});
