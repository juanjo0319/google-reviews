import { Stack } from "expo-router";
import { ErrorScreen } from "@/components/ui/ErrorScreen";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} />;
}

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="analytics" options={{ title: "Analytics" }} />
      <Stack.Screen name="responses" options={{ title: "Responses" }} />
    </Stack>
  );
}
