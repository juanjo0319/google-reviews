import { Stack } from "expo-router";
import { ErrorScreen } from "@/components/ui/ErrorScreen";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} />;
}

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="brand-voice" options={{ title: "Brand Voice" }} />
      <Stack.Screen name="notification-prefs" options={{ title: "Notifications" }} />
      <Stack.Screen name="usage" options={{ title: "AI Usage" }} />
      <Stack.Screen name="team" options={{ title: "Team" }} />
      <Stack.Screen name="help" options={{ title: "Help & Support" }} />
    </Stack>
  );
}
