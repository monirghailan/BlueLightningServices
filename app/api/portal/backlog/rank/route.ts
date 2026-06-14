import { NextRequest, NextResponse } from "next/server";
import { rankIssue, JiraConfigError } from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { validateOrgIssue } from "@/lib/portal/metrics";
import { rankSchema } from "@/lib/validations/portal";

export async function PUT(request: NextRequest) {
  try {
    const session = await requirePortalSession();
    const body = await request.json();
    const parsed = rankSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid rank request." },
        { status: 400 }
      );
    }

    const { issueKey, rankBeforeIssue, rankAfterIssue } = parsed.data;

    if (!rankBeforeIssue && !rankAfterIssue) {
      return NextResponse.json(
        { error: "rankBeforeIssue or rankAfterIssue is required." },
        { status: 400 }
      );
    }

    const allowed = await validateOrgIssue(session.organization, issueKey);
    if (!allowed) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    if (rankBeforeIssue) {
      const ok = await validateOrgIssue(session.organization, rankBeforeIssue);
      if (!ok) {
        return NextResponse.json({ error: "Invalid rank target." }, { status: 400 });
      }
    }

    if (rankAfterIssue) {
      const ok = await validateOrgIssue(session.organization, rankAfterIssue);
      if (!ok) {
        return NextResponse.json({ error: "Invalid rank target." }, { status: 400 });
      }
    }

    await rankIssue([issueKey], rankBeforeIssue, rankAfterIssue);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
