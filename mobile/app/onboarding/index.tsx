import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";

const TONES = ["professional", "friendly", "casual", "enthusiastic", "empathetic"];

export default function OnboardingScreen() {
  const colors = useColors();
  const { activeOrg, setUser, user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState(activeOrg?.name ?? "");
  const [tone, setTone] = useState("professional");
  const [formality, setFormality] = useState(5);
  const [useEmoji, setUseEmoji] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStep1() {
    if (!activeOrg || !orgName.trim()) {
      Alert.alert("Error", "Please enter your organization name");
      return;
    }
    setLoading(true);
    try {
      await api("/api/mobile/onboarding/org-name", {
        method: "PUT",
        body: { orgId: activeOrg.id, name: orgName.trim() },
      });
      setStep(2);
    } catch {
      Alert.alert("Error", "Failed to save organization name");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    if (!activeOrg) return;
    setLoading(true);
    try {
      await api("/api/mobile/onboarding/brand-voice", {
        method: "PUT",
        body: {
          orgId: activeOrg.id,
          tone,
          formality,
          useEmoji,
          signatureName: signatureName || "",
        },
      });
      setStep(3);
    } catch {
      Alert.alert("Error", "Failed to save brand voice");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      await api("/api/mobile/onboarding/complete", { method: "POST" });
      if (user) {
        setUser({ ...user, onboardingCompleted: true });
      }
      router.replace("/(app)/(dashboard)");
    } catch {
      Alert.alert("Error", "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor: s <= step ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Name your organization
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            This is how your team will see your business in ReviewAI.
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
            placeholder="e.g. My Restaurant"
            placeholderTextColor={colors.textSecondary}
            value={orgName}
            onChangeText={setOrgName}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleStep1}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Set your brand voice
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            This controls how AI-generated responses sound.
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>Tone</Text>
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
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Use emoji in responses
            </Text>
            <Switch
              value={useEmoji}
              onValueChange={setUseEmoji}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>
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

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleStep2}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            You're all set!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Connect your Google Business Profile from the Locations tab to start
            syncing reviews. You can also do this later.
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Go to Dashboard</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  stepContent: { gap: 16 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  fieldLabel: { fontSize: 15, fontWeight: "600", marginTop: 8 },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
