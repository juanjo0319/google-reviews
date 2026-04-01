import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
  let healthy = true;

  // Check database connectivity
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .limit(1);

    checks.database = error ? "error" : "ok";
    if (error) healthy = false;
  } catch {
    checks.database = "error";
    healthy = false;
  }

  const body = {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
