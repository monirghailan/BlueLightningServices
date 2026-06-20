import { NextRequest, NextResponse } from "next/server";
import { JiraConfigError } from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { getPaginatedBacklog } from "@/lib/portal/metrics";

const PAGE_SIZES = [5, 10, 25, 50] as const;

function parsePageSize(value: string | null): number {
  const parsed = parseInt(value ?? "5", 10);
  return (PAGE_SIZES as readonly number[]).includes(parsed) ? parsed : 5;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession();
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = parsePageSize(searchParams.get("pageSize"));

    const result = await getPaginatedBacklog(session.organization, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
