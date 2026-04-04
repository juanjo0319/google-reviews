import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";
import {
  useGoogleBusinessAuth,
  exchangeGoogleCode,
  getGoogleRedirectUri,
} from "@/lib/google-auth";
import { MapPin, RefreshCw, Trash2, Link as LinkIcon } from "lucide-react-native";

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  is_verified: boolean;
  last_synced_at: string | null;
  reviewCount: number;
  avgRating: number;
}

export default function LocationsScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Google OAuth
  const [request, response, promptAsync] = useGoogleBusinessAuth();

  // Handle Google OAuth response
  useEffect(() => {
    if (!response || response.type !== "success" || !activeOrg) return;

    const code = response.params.code;
    if (!code) return;

    setConnecting(true);
    const redirectUri = getGoogleRedirectUri();

    exchangeGoogleCode(code, redirectUri, activeOrg.id)
      .then(() => {
        Alert.alert(
          "Connected",
          "Google Business Profile connected. Your locations will appear shortly.",
          [{ text: "OK", onPress: () => fetchLocations() }]
        );
      })
      .catch(() => {
        Alert.alert("Error", "Failed to connect Google Business Profile");
      })
      .finally(() => setConnecting(false));
  }, [response]);

  const fetchLocations = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const result = await api<{ locations: Location[] }>(
        `/api/mobile/locations?orgId=${activeOrg.id}`
      );
      setLocations(result.locations);
    } catch (err) {
      console.error("Locations fetch error:", err);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchLocations().finally(() => setLoading(false));
  }, [fetchLocations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  }, [fetchLocations]);

  async function handleSync(locationId: string) {
    if (!activeOrg) return;
    setSyncing(locationId);
    try {
      await api("/api/mobile/locations/sync", {
        method: "POST",
        body: { orgId: activeOrg.id, locationId },
      });
      Alert.alert("Syncing", "Review sync started. Pull to refresh in a moment.");
    } catch {
      Alert.alert("Error", "Failed to start sync");
    } finally {
      setSyncing(null);
    }
  }

  async function handleDelete(locationId: string, name: string) {
    Alert.alert("Remove Location", `Remove "${name}" from your organization?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/mobile/locations/${locationId}`, {
              method: "DELETE",
            });
            await fetchLocations();
          } catch {
            Alert.alert("Error", "Failed to remove location");
          }
        },
      },
    ]);
  }

  function renderStars(rating: number) {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  }

  const renderLocation = ({ item }: { item: Location }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <MapPin size={18} color={colors.primary} />
        <Text style={[styles.locationName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
      <Text style={[styles.address, { color: colors.textSecondary }]}>
        {item.address}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {item.reviewCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Reviews
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={{ color: colors.star, fontSize: 14 }}>
            {renderStars(item.avgRating)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {item.avgRating > 0 ? item.avgRating.toFixed(1) : "N/A"}
          </Text>
        </View>
      </View>

      {item.last_synced_at && (
        <Text style={[styles.syncedText, { color: colors.textSecondary }]}>
          Last synced: {new Date(item.last_synced_at).toLocaleDateString()}
        </Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: colors.primaryLight }]}
          onPress={() => handleSync(item.id)}
          disabled={syncing === item.id}
        >
          {syncing === item.id ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <RefreshCw size={14} color={colors.primary} />
          )}
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}>
            Sync
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: colors.danger + "15" }]}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Trash2 size={14} color={colors.danger} />
          <Text style={{ fontSize: 13, color: colors.danger, fontWeight: "500" }}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={locations}
      keyExtractor={(item) => item.id}
      renderItem={renderLocation}
      contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
      style={{ backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }

      ListHeaderComponent={
        locations.length > 0 ? (
          <TouchableOpacity
            style={[
              styles.connectButton,
              { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => promptAsync()}
            disabled={!request || connecting}
          >
            {connecting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <LinkIcon size={18} color={colors.primary} />
            )}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Connect More Locations
            </Text>
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <MapPin size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No locations yet
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Connect your Google Business Profile to start managing reviews.
          </Text>
          <TouchableOpacity
            style={[
              styles.connectButtonLarge,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => promptAsync()}
            disabled={!request || connecting}
          >
            {connecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <LinkIcon size={20} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  Connect Google Business
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationName: { fontSize: 17, fontWeight: "600", flex: 1 },
  address: { fontSize: 14, marginTop: 4, marginLeft: 26 },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2 },
  syncedText: { fontSize: 12, marginTop: 10 },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  emptyDesc: { fontSize: 14, textAlign: "center", maxWidth: 260 },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 10,
    marginBottom: 16,
  },
  connectButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
