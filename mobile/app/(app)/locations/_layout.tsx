import { Stack } from "expo-router";

export default function LocationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Locations" }} />
    </Stack>
  );
}
