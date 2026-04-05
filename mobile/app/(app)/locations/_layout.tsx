import { Stack } from "expo-router";
import { ErrorScreen } from "@/components/ui/ErrorScreen";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} />;
}

export default function LocationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Locations" }} />
    </Stack>
  );
}
