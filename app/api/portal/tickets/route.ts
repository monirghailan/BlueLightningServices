import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalAdmin,
} from "@/lib/portal/auth";
import { createPendingTicket, listTickets } from "@/lib/portal/jira-db";
import { ticketCreateSchema } from "@/lib/validations/portal";
import { isRateLimited } from "@/lib/rate-limit";

const PAGE_SIZES = [5, 10, 25, 50] as const;

function parsePageSize(value: string | null): number {
  const parsed = parseInt(value ?? "5", 10);
  return (PAGE_SIZES as readonly number[]).includes(parsed) ? parsed : 5;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalAdmin();
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const q = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = parsePageSize(searchParams.get("pageSize"));

    if (!session.organization.jira_component_name) {
      return NextResponse.json({ issues: [], total: 0, page: 1, pageSize, totalPages: 0 });
    }

    const result = await listTickets(session.organization, {
      status,
      type,
      q,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    return portalErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePortalAdmin();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? session.userId;

    if (isRateLimited(`ticket:${ip}`)) {
      return NextResponse.json(
        { error: "Too many tickets submitted. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ticketCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data." },
        { status: 400 }
      );
    }

    const clientLabel = session.organization.jira_component_name;
    if (!clientLabel) {
      return NextResponse.json(
        { error: "Organization is not linked to Jira." },
        { status: 503 }
      );
    }

    const issue = await createPendingTicket(session.organization, {
      summary: parsed.data.summary,
      description: parsed.data.description,
      issueType: parsed.data.issueType,
      priority: parsed.data.priority,
    });

    return NextResponse.json(
      {
        id: issue.id,
        key: issue.jira_key,
        syncStatus: issue.sync_status,
      },
      { status: 201 }
    );
  } catch (error) {
    return portalErrorResponse(error);
  }
}
