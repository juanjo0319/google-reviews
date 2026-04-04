import { Stack } from "expo-router";

export default function ReviewsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Reviews" }} />
      <Stack.Screen name="[reviewId]" options={{ title: "Review" }} />
    </Stack>
  );
}
