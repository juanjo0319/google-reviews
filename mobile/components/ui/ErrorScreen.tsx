import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";

interface ErrorScreenProps {
  error: Error;
  retry: () => void;
}

/**
 * Full-screen error state used as ErrorBoundary fallback in route groups.
 */
export function ErrorScreen({ error, retry }: ErrorScreenProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AlertTriangle size={40} color={colors.danger} />
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {error.message || "An unexpected error occurred"}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={retry}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
