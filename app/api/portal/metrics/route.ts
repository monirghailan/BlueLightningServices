import { NextResponse } from "next/server";
import { JiraConfigError } from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { computeMetrics } from "@/lib/portal/metrics";

export async function GET() {
  try {
    const session = await requirePortalSession();
    const metrics = await computeMetrics(session.organization);
    return NextResponse.json(metrics);
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
