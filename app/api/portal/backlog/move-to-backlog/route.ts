import { NextRequest, NextResponse } from "next/server";
import { moveIssuesToBacklog, JiraConfigError } from "@/lib/jira/client";
import { resolvePortalBoardId } from "@/lib/jira/board";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { validateOrgIssue } from "@/lib/portal/metrics";
import { moveIssuesSchema } from "@/lib/validations/portal";

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalSession();
    const boardId = resolvePortalBoardId(session.organization);

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

    await moveIssuesToBacklog(boardId, parsed.data.issueKeys);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
