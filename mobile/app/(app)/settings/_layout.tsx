import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="brand-voice" options={{ title: "Brand Voice" }} />
      <Stack.Screen name="notification-prefs" options={{ title: "Notifications" }} />
      <Stack.Screen name="usage" options={{ title: "AI Usage" }} />
      <Stack.Screen name="team" options={{ title: "Team" }} />
    </Stack>
  );
}
