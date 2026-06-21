import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedSupabase,
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { updatePersonaSchema } from "@/lib/validations/portal";

export async function GET() {
  try {
    const session = await requirePortalSession();
    return NextResponse.json({
      assistantPersona: session.assistantPersona,
      assistantEnabled: session.organization.assistant_enabled,
      assistantLastIndexedAt: session.organization.assistant_last_indexed_at,
    });
  } catch (error) {
    return portalErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requirePortalSession();

    if (session.role === "standard") {
      return NextResponse.json(
        { error: "Your assistant persona is set by your organization administrator." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updatePersonaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid persona." },
        { status: 400 }
      );
    }

    const supabase = await getAuthenticatedSupabase();
    const { error } = await supabase
      .from("organization_members")
      .update({ assistant_persona: parsed.data.assistantPersona })
      .eq("user_id", session.userId)
      .eq("organization_id", session.organization.id);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to update persona." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, assistantPersona: parsed.data.assistantPersona });
  } catch (error) {
    return portalErrorResponse(error);
  }
}
