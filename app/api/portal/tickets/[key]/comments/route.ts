import { NextRequest, NextResponse } from "next/server";
import { addComment, JiraConfigError } from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalAdmin,
} from "@/lib/portal/auth";
import { validateOrgIssue } from "@/lib/portal/metrics";
import { commentSchema } from "@/lib/validations/portal";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await requirePortalAdmin();
    const { key } = await params;

    const allowed = await validateOrgIssue(session.organization, key);
    if (!allowed) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid comment." },
        { status: 400 }
      );
    }

    const prefixed = `[Portal — ${session.email}]\n${parsed.data.body}`;
    await addComment(key, prefixed);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
