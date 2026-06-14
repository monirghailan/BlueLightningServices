import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalAdmin,
  getServiceSupabase,
} from "@/lib/portal/auth";
import {
  generateInviteToken,
  hashInviteToken,
  inviteExpiryDate,
} from "@/lib/portal/invite";
import { sendInviteEmail } from "@/lib/portal/email";
import { portalInviteUrl } from "@/lib/portal/url";
import { inviteSchema } from "@/lib/validations/portal";

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalAdmin();
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid invite." },
        { status: 400 }
      );
    }

    const token = generateInviteToken();
    const tokenHash = hashInviteToken(token);
    const expiresAt = inviteExpiryDate().toISOString();

    const supabase = await getServiceSupabase();
    const { error } = await supabase.from("invitations").insert({
      organization_id: session.organization.id,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      token_hash: tokenHash,
      expires_at: expiresAt,
      invited_by: session.userId,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to create invitation." }, { status: 500 });
    }

    const inviteUrl = portalInviteUrl(token);

    await sendInviteEmail({
      to: parsed.data.email,
      orgName: session.organization.name,
      inviteUrl,
      inviterEmail: session.email,
    });

    return NextResponse.json({ ok: true, inviteUrl }, { status: 201 });
  } catch (error) {
    return portalErrorResponse(error);
  }
}

export async function GET() {
  try {
    const session = await requirePortalAdmin();
    const supabase = await getServiceSupabase();

    const { data: invitations } = await supabase
      .from("invitations")
      .select("id, email, role, expires_at, accepted_at, created_at")
      .eq("organization_id", session.organization.id)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });

    const { data: members } = await supabase
      .from("organization_members")
      .select("id, role, joined_at, profiles (id, email, full_name)")
      .eq("organization_id", session.organization.id);

    return NextResponse.json({
      members: members ?? [],
      invitations: invitations ?? [],
    });
  } catch (error) {
    return portalErrorResponse(error);
  }
}
