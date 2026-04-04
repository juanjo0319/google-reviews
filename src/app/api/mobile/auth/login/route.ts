import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { issueMobileTokens } from "@/lib/mobile/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naSchema = supabase.schema("next_auth") as any;

  // Check next_auth.users for emailVerified
  const { data: authUser } = await naSchema
    .from("users")
    .select("id, email, name, image, emailVerified")
    .eq("email", email)
    .single();

  if (!authUser) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!authUser.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before logging in" },
      { status: 403 }
    );
  }

  // Check password from public.users
  const { data: publicUser } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", authUser.id)
    .single();

  if (!publicUser?.password_hash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, publicUser.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const tokens = issueMobileTokens(authUser.id, authUser.email);

  return NextResponse.json({
    ...tokens,
    user: {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      image: authUser.image,
    },
  });
}
