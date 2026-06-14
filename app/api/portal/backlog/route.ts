import { NextResponse } from "next/server";
import { JiraConfigError } from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { getBacklogSections } from "@/lib/portal/metrics";

export async function GET() {
  try {
    const session = await requirePortalSession();
    const sections = await getBacklogSections(session.organization);
    return NextResponse.json(sections);
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
