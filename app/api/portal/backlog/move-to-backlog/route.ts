import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { enqueueMoveToBacklog, validateOrgIssue } from "@/lib/portal/jira-db";
import { moveIssuesSchema } from "@/lib/validations/portal";

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession();

    const body = await request.json();
    const parsed = moveIssuesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    for (const key of parsed.data.issueKeys) {
      const allowed = await validateOrgIssue(session.organization, key);
      if (!allowed) {
        return NextResponse.json({ error: `Issue ${key} not found.` }, { status: 404 });
      }
    }

    await enqueueMoveToBacklog(session.organization, parsed.data.issueKeys);
    return NextResponse.json({ ok: true, queued: true });
  } catch (error) {
    return portalErrorResponse(error);
  }
}
