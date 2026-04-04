import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

export default function NotificationPrefsScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);

  const [newReviewEmail, setNewReviewEmail] = useState(true);
  const [newReviewInApp, setNewReviewInApp] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [negativeReviewAlert, setNegativeReviewAlert] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPrefs = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const result = await api<{
        preferences: {
          new_review_email: boolean;
          new_review_in_app: boolean;
          weekly_digest: boolean;
          negative_review_alert: boolean;
        };
      }>(`/api/mobile/settings/notifications?orgId=${activeOrg.id}`);
      setNewReviewEmail(result.preferences.new_review_email);
      setNewReviewInApp(result.preferences.new_review_in_app);
      setWeeklyDigest(result.preferences.weekly_digest);
      setNegativeReviewAlert(result.preferences.negative_review_alert);
    } catch (err) {
      console.error("Notification prefs fetch error:", err);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchPrefs().finally(() => setLoading(false));
  }, [fetchPrefs]);

  async function handleSave() {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await api("/api/mobile/settings/notifications", {
        method: "PUT",
        body: {
          orgId: activeOrg.id,
          new_review_email: newReviewEmail,
          new_review_in_app: newReviewInApp,
          weekly_digest: weeklyDigest,
          negative_review_alert: negativeReviewAlert,
        },
      });
      Alert.alert("Saved", "Notification preferences updated.");
    } catch {
      Alert.alert("Error", "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const prefs = [
    {
      label: "New review email",
      description: "Get an email when a new review is posted",
      value: newReviewEmail,
      onToggle: setNewReviewEmail,
    },
    {
      label: "In-app notifications",
      description: "Show new review alerts in the app",
      value: newReviewInApp,
      onToggle: setNewReviewInApp,
    },
    {
      label: "Negative review alerts",
      description: "Immediate alert for 1-2 star reviews",
      value: negativeReviewAlert,
      onToggle: setNegativeReviewAlert,
    },
    {
      label: "Weekly digest",
      description: "Weekly summary of reviews and performance",
      value: weeklyDigest,
      onToggle: setWeeklyDigest,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {prefs.map((pref, i) => (
          <View
            key={pref.label}
            style={[
              styles.row,
              i < prefs.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {pref.label}
              </Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                {pref.description}
              </Text>
            </View>
            <Switch
              value={pref.value}
              onValueChange={pref.onToggle}
              trackColor={{ true: colors.primary }}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "500" },
  rowDesc: { fontSize: 13, marginTop: 2 },
  saveButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
