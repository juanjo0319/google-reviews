import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const TONES = ["professional", "friendly", "casual", "enthusiastic", "empathetic"];

export default function BrandVoiceScreen() {
  const colors = useColors();
  const activeOrg = useAuthStore((s) => s.activeOrg);

  const [tone, setTone] = useState("professional");
  const [formality, setFormality] = useState(5);
  const [humorLevel, setHumorLevel] = useState(3);
  const [useEmoji, setUseEmoji] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [responseLength, setResponseLength] = useState("medium");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const result = await api<{ config: Record<string, unknown> | null }>(
        `/api/mobile/settings/brand-voice?orgId=${activeOrg.id}`
      );
      if (result.config) {
        setTone((result.config.tone as string) ?? "professional");
        setFormality((result.config.formality as number) ?? 5);
        setHumorLevel((result.config.humor_level as number) ?? 3);
        setUseEmoji((result.config.use_emoji as boolean) ?? false);
        setSignatureName((result.config.signature_name as string) ?? "");
        setResponseLength((result.config.response_length as string) ?? "medium");
      }
    } catch (err) {
      console.error("Brand voice fetch error:", err);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchConfig().finally(() => setLoading(false));
  }, [fetchConfig]);

  async function handleSave() {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await api("/api/mobile/settings/brand-voice", {
        method: "PUT",
        body: {
          orgId: activeOrg.id,
          tone,
          formality,
          humor_level: humorLevel,
          use_emoji: useEmoji,
          signature_name: signatureName || null,
          response_length: responseLength,
        },
      });
      Alert.alert("Saved", "Brand voice settings updated.");
    } catch {
      Alert.alert("Error", "Failed to save settings");
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tone */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Tone</Text>
        <View style={styles.chipsRow}>
          {TONES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.chip,
                {
                  backgroundColor: tone === t ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setTone(t)}
            >
              <Text
                style={{
                  color: tone === t ? "#fff" : colors.text,
                  fontSize: 14,
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Formality slider */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          Formality: {formality}/10
        </Text>
        <View style={styles.sliderRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.sliderDot,
                {
                  backgroundColor: n <= formality ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormality(n)}
            />
          ))}
        </View>
        <View style={styles.sliderLabels}>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            Casual
          </Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            Formal
          </Text>
        </View>
      </View>

      {/* Humor slider */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          Humor Level: {humorLevel}/10
        </Text>
        <View style={styles.sliderRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.sliderDot,
                {
                  backgroundColor: n <= humorLevel ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setHumorLevel(n)}
            />
          ))}
        </View>
      </View>

      {/* Use Emoji */}
      <View style={[styles.switchRow, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Use Emoji</Text>
        <Switch
          value={useEmoji}
          onValueChange={setUseEmoji}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {/* Response Length */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          Response Length
        </Text>
        <View style={styles.chipsRow}>
          {["short", "medium", "long"].map((len) => (
            <TouchableOpacity
              key={len}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    responseLength === len ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setResponseLength(len)}
            >
              <Text
                style={{
                  color: responseLength === len ? "#fff" : colors.text,
                  fontSize: 14,
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {len}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Signature */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          Sign responses as
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g. The Management Team"
          placeholderTextColor={colors.textSecondary}
          value={signatureName}
          onChangeText={setSignatureName}
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  field: { paddingHorizontal: 20, marginTop: 24 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sliderRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderDot: { width: 24, height: 24, borderRadius: 12 },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 32,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
