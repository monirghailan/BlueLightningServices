import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalAdmin,
} from "@/lib/portal/auth";
import { persistOrgMetrics } from "@/lib/jira/sync/compute-metrics-db";
import { getOrgMetrics } from "@/lib/portal/jira-db";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalAdmin();
    const fresh = request.nextUrl.searchParams.get("fresh") === "1";

    if (fresh) {
      await persistOrgMetrics(session.organization);
    }

    const metrics = await getOrgMetrics(session.organization);
    return NextResponse.json(metrics);
  } catch (error) {
    return portalErrorResponse(error);
  }
}
