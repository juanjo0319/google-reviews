import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Star, MapPin, Bell, Settings } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useBadgeStore } from "@/lib/notification-badge";

export default function AppLayout() {
  const colors = useColors();
  const { t } = useTranslation();
  const unreadCount = useBadgeStore((s) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          title: t("dashboard.nav.dashboard"),
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: t("dashboard.nav.reviews"),
          tabBarIcon: ({ color, size }) => <Star size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: t("dashboard.nav.locations"),
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t("dashboard.notifications.title"),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Bell size={size} color={color} />
              {unreadCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.danger }]}
                  accessibilityLabel={`${unreadCount} unread notifications`}
                >
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("dashboard.nav.settings"),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
