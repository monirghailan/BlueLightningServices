import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPortalSession, getPortalHomePath } from "@/lib/portal/auth";
import { loginSchema } from "@/lib/validations/portal";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid credentials." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = await getPortalSession();
  const home = session ? getPortalHomePath(session.role) : "/portal/assistant";

  return NextResponse.json({ ok: true, home });
}

export async function DELETE() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
