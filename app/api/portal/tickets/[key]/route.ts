import { NextRequest, NextResponse } from "next/server";
import {
  getIssue,
  serializeIssueDetail,
  JiraConfigError,
} from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { validateOrgIssue } from "@/lib/portal/metrics";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await requirePortalSession();
    const { key } = await params;

    const allowed = await validateOrgIssue(session.organization, key);
    if (!allowed) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const issue = await getIssue(key);
    return NextResponse.json(serializeIssueDetail(issue));
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
