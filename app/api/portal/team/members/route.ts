import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalAdmin,
  getServiceSupabase,
} from "@/lib/portal/auth";
import { updateMemberSchema } from "@/lib/validations/portal";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requirePortalAdmin();
    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    if (parsed.data.userId === session.userId && parsed.data.role !== "administrator") {
      return NextResponse.json(
        { error: "You cannot demote yourself." },
        { status: 400 }
      );
    }

    const supabase = await getServiceSupabase();
    const { error } = await supabase
      .from("organization_members")
      .update({ role: parsed.data.role })
      .eq("organization_id", session.organization.id)
      .eq("user_id", parsed.data.userId);

    if (error) {
      return NextResponse.json({ error: "Failed to update member." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return portalErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requirePortalAdmin();
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    if (userId === session.userId) {
      return NextResponse.json(
        { error: "You cannot remove yourself." },
        { status: 400 }
      );
    }

    const supabase = await getServiceSupabase();
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("organization_id", session.organization.id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: "Failed to remove member." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return portalErrorResponse(error);
  }
}
