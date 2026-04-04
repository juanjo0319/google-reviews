import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, getMobileOrg } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

const BASE_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

/**
 * POST /api/mobile/billing/portal — get Stripe customer portal URL
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const orgId: string | undefined = body.orgId;

  const orgData = orgId
    ? await getMobileOrg(session.userId, orgId)
    : await getMobileOrg(session.userId);

  if (!orgData) {
    return NextResponse.json(
      { error: "No organization found" },
      { status: 404 }
    );
  }

  const supabase = createAdminClient();
  const stripe = getStripe();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgData.orgId)
    .single();

  if (!org?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found. Subscribe to a plan first." },
      { status: 404 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: BASE_URL + "/dashboard/settings/billing",
  });

  return NextResponse.json({ url: portalSession.url });
}
