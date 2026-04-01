import { createGBPClient } from "./client";

/**
 * Configure Google My Business Notifications API to send Pub/Sub messages
 * for NEW_REVIEW and UPDATED_REVIEW events.
 *
 * This should be called once when an account is first connected.
 */
export async function configurePubSubNotifications(
  organizationId: string,
  accountId: string
): Promise<void> {
  const gbp = await createGBPClient(organizationId);
  const topicName = process.env.GOOGLE_PUBSUB_TOPIC;

  if (!topicName) {
    console.warn(
      "GOOGLE_PUBSUB_TOPIC not configured — skipping Pub/Sub setup"
    );
    return;
  }

  // PATCH the notification settings for the account
  // Uses the My Business Notifications API
  const url = `https://mybusinessnotifications.googleapis.com/v1/${accountId}/notificationSetting`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${await getAccessToken(organizationId)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `${accountId}/notificationSetting`,
      pubsubTopic: topicName,
      notificationTypes: ["NEW_REVIEW", "UPDATED_REVIEW"],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(
      `Failed to configure Pub/Sub for ${accountId}: ${response.status} ${body}`
    );
    throw new Error(`Pub/Sub configuration failed: ${response.status}`);
  }
}

/**
 * Helper to get a valid access token for raw fetch calls.
 */
async function getAccessToken(organizationId: string): Promise<string> {
  const gbp = await createGBPClient(organizationId);
  // The client ensures a valid token on initialize, and we expose it via
  // a request. Instead, we re-initialize and read the token from DB.
  // This is a workaround since the client doesn't expose the raw token.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("google_oauth_tokens")
    .select("access_token, expires_at, refresh_token")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) throw new Error("No tokens found");

  // Check if token is still valid
  if (data.expires_at && new Date(data.expires_at) > new Date()) {
    return data.access_token;
  }

  // Refresh
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: data.refresh_token,
    }),
  });

  const refreshed = await response.json();
  if (!response.ok) throw new Error(`Token refresh failed: ${refreshed.error}`);

  // We don't need to call gbp at all, just initialize the client to trigger refresh
  // Actually, let's just use the client:
  void gbp; // suppress unused warning
  return refreshed.access_token;
}
