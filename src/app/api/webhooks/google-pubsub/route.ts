import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncSingleReview } from "@/lib/google/sync";

export const dynamic = "force-dynamic";

/**
 * Receives Google Cloud Pub/Sub push messages for review events.
 *
 * The Pub/Sub message data (base64-decoded) contains:
 * {
 *   "name": "accounts/{account_id}/locations/{location_id}/reviews/{review_id}",
 *   "type": "NEW_REVIEW" | "UPDATED_REVIEW"
 * }
 */
export async function POST(request: NextRequest) {
  // Verify the shared secret token
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Pub/Sub wraps messages in a specific envelope
    const message = body.message;
    if (!message?.data) {
      return NextResponse.json(
        { error: "Invalid Pub/Sub message" },
        { status: 400 }
      );
    }

    // Decode base64 message data
    const decoded = Buffer.from(message.data, "base64").toString("utf-8");
    const data = JSON.parse(decoded);

    const reviewName: string = data.name;
    if (!reviewName) {
      return NextResponse.json(
        { error: "Missing review name" },
        { status: 400 }
      );
    }

    // Parse the review name: "accounts/{id}/locations/{id}/reviews/{id}"
    const parts = reviewName.split("/");
    if (parts.length < 6) {
      return NextResponse.json(
        { error: "Invalid review name format" },
        { status: 400 }
      );
    }

    const googleAccountId = `${parts[0]}/${parts[1]}`;
    const googleLocationId = `${parts[2]}/${parts[3]}`;

    // Find which organization owns this location
    const supabase = createAdminClient();
    const { data: location } = await supabase
      .from("locations")
      .select("organization_id")
      .eq("google_account_id", googleAccountId)
      .eq("google_location_id", googleLocationId)
      .single();

    if (!location) {
      // Location not managed by us — acknowledge and ignore
      return NextResponse.json({ status: "ignored" });
    }

    // Sync the specific review
    await syncSingleReview(
      location.organization_id,
      googleAccountId,
      googleLocationId,
      reviewName
    );

    // Create notification for new reviews
    if (data.type === "NEW_REVIEW") {
      // Find org members to notify
      const { data: members } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", location.organization_id);

      if (members?.length) {
        const notifications = members.map((m) => ({
          user_id: m.user_id,
          organization_id: location.organization_id,
          type: "new_review",
          title: "New Review",
          message: `A new review was posted on your business.`,
          data: { reviewName, eventType: data.type },
        }));

        await supabase.from("notifications").insert(notifications);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Pub/Sub webhook error:", error);
    // Return 200 to acknowledge — Pub/Sub retries on non-2xx
    // Only return error for truly malformed requests
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
