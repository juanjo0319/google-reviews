import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { useColors } from "@/hooks/useColors";
import { api, ApiError } from "@/lib/api";
import { setLanguage } from "@/i18n";
import {
  User,
  Building2,
  MessageSquare,
  Bell,
  BarChart3,
  Users,
  CreditCard,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
} from "lucide-react-native";

export default function SettingsScreen() {
  const colors = useColors();
  const { user, activeOrg, logout } = useAuthStore();
  const router = useRouter();
  const { t, i18n } = useTranslation();

  function handleLanguageSwitch() {
    const options = [
      { label: "English", value: "en" },
      { label: "Español", value: "es" },
    ];
    Alert.alert(
      "Language / Idioma",
      undefined,
      options.map((opt) => ({
        text: opt.label + (i18n.language === opt.value ? " ✓" : ""),
        onPress: () => setLanguage(opt.value),
      }))
    );
  }

  async function handleBilling(action: "checkout" | "portal") {
    if (!activeOrg) return;
    try {
      const result = await api<{ url: string }>(
        `/api/mobile/billing/${action}`,
        {
          method: "POST",
          body: {
            orgId: activeOrg.id,
            ...(action === "checkout"
              ? { priceId: "price_starter" } // Default to starter
              : {}),
          },
        }
      );
      await WebBrowser.openBrowserAsync(result.url);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to open billing";
      Alert.alert("Error", message);
    }
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  const sections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: user?.name ?? "Profile",
          subtitle: user?.email,
          onPress: () => {},
        },
        {
          icon: Building2,
          label: activeOrg?.name ?? "Organization",
          subtitle: `${activeOrg?.planTier ?? "free"} plan`,
          onPress: () => {},
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          icon: MessageSquare,
          label: "Brand Voice",
          subtitle: "AI response tone & style",
          onPress: () => router.push("/(app)/settings/brand-voice" as never),
        },
        {
          icon: Bell,
          label: "Notifications",
          subtitle: "Email & push preferences",
          onPress: () =>
            router.push("/(app)/settings/notification-prefs" as never),
        },
        {
          icon: Users,
          label: "Team",
          subtitle: "Manage members & roles",
          onPress: () => router.push("/(app)/settings/team" as never),
        },
        {
          icon: BarChart3,
          label: "AI Usage",
          subtitle: "Token usage & budget",
          onPress: () => router.push("/(app)/settings/usage" as never),
        },
      ],
    },
    {
      title: "Billing",
      items: [
        {
          icon: CreditCard,
          label: "Manage Subscription",
          subtitle: "View plan, invoices, payment method",
          onPress: () => handleBilling("portal"),
          external: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Globe,
          label: "Language",
          subtitle: i18n.language === "es" ? "Español" : "English",
          onPress: handleLanguageSwitch,
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          subtitle: "FAQs, getting started, contact",
          onPress: () => router.push("/(app)/settings/help" as never),
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {section.title}
          </Text>
          <View
            style={[
              styles.sectionContent,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.row,
                  i < section.items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={item.onPress}
              >
                <item.icon size={20} color={colors.primary} />
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text
                      style={[
                        styles.rowSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                {"external" in item && item.external ? (
                  <ExternalLink size={16} color={colors.textSecondary} />
                ) : (
                  <ChevronRight size={16} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>
          Sign Out
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: { borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: "500" },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
