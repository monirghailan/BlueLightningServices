import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/portal/auth";
import { hashInviteToken } from "@/lib/portal/invite";
import { acceptInviteSchema } from "@/lib/validations/portal";

import type { Invitation } from "@/lib/supabase/database.types";

type InvitePreview = Pick<
  Invitation,
  "id" | "email" | "role" | "expires_at" | "accepted_at"
> & {
  organizations: { name: string } | null;
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required." }, { status: 400 });
  }

  const supabase = await getServiceSupabase();
  const tokenHash = hashInviteToken(token);

  const { data } = await supabase
    .from("invitations")
    .select("id, email, role, expires_at, accepted_at, organizations (name)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const invitation = data as InvitePreview | null;

  if (!invitation || invitation.accepted_at) {
    return NextResponse.json({ error: "Invalid or used invitation." }, { status: 404 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expired." }, { status: 410 });
  }

  const org = invitation.organizations;

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    orgName: org?.name ?? "Organization",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = acceptInviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const supabase = await getServiceSupabase();
  const tokenHash = hashInviteToken(parsed.data.token);

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  const invitation = data as Invitation | null;

  if (!invitation || invitation.accepted_at) {
    return NextResponse.json({ error: "Invalid or used invitation." }, { status: 404 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invitation expired." }, { status: 410 });
  }

  const fullName =
    invitation.full_name?.trim() ||
    parsed.data.fullName?.trim() ||
    invitation.email.split("@")[0];

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: invitation.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (createError || !created.user) {
    if (createError?.message?.includes("already been registered")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }
    console.error(createError);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: invitation.organization_id,
    user_id: created.user.id,
    role: invitation.role,
  });

  if (memberError) {
    console.error(memberError);
    return NextResponse.json({ error: "Failed to add organization membership." }, { status: 500 });
  }

  await supabase
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  return NextResponse.json({ ok: true, email: invitation.email });
}
