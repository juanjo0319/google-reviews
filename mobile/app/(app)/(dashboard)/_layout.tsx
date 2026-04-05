import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="analytics" options={{ title: "Analytics" }} />
      <Stack.Screen name="responses" options={{ title: "Responses" }} />
    </Stack>
  );
}
