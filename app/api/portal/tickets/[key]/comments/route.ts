import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalAdmin,
} from "@/lib/portal/auth";
import { createPendingComment } from "@/lib/portal/jira-db";
import { commentSchema } from "@/lib/validations/portal";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await requirePortalAdmin();
    const { key } = await params;

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid comment." },
        { status: 400 }
      );
    }

    const comment = await createPendingComment(
      session.organization,
      key,
      parsed.data.body,
      session.email
    );

    if (!comment) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json(
      { ok: true, id: comment.id, syncStatus: comment.sync_status },
      { status: 201 }
    );
  } catch (error) {
    return portalErrorResponse(error);
  }
}
