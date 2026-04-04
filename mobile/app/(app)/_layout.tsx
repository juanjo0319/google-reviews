import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Star, MapPin, Bell, Settings } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";

export default function AppLayout() {
  const colors = useColors();
  const { t } = useTranslation();

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
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
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
