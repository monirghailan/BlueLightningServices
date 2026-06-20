import { NextRequest, NextResponse } from "next/server";
import {
  countIssues,
  createIssue,
  searchIssues,
  serializeIssue,
  JiraConfigError,
} from "@/lib/jira/client";
import { clientScopeJql } from "@/lib/jira/client-field";
import {
  portalErrorResponse,
  requirePortalAdmin,
} from "@/lib/portal/auth";
import { getClientBacklogKeys } from "@/lib/portal/metrics";
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

    let jql = clientScopeJql(
      session.organization.jira_component_name,
      session.organization.jira_project_key
    );
    if (status === "open") {
      jql += ` AND statusCategory != Done`;
    } else if (status) {
      jql += ` AND status = "${status}"`;
    }
    if (type) jql += ` AND issuetype = "${type}"`;
    if (q) jql += ` AND summary ~ "${q.replace(/"/g, '\\"')}"`;

    const backlogKeys = await getClientBacklogKeys(session.organization);
    if (backlogKeys.length > 0) {
      jql += ` AND key not in (${backlogKeys.join(", ")})`;
    }

    jql += " ORDER BY updated DESC";

    const startAt = (page - 1) * pageSize;
    const [result, total] = await Promise.all([
      searchIssues(jql, pageSize, startAt),
      countIssues(jql),
    ]);
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

    return NextResponse.json({
      issues: (result.issues ?? []).map(serializeIssue),
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
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

    const issue = await createIssue({
      summary: parsed.data.summary,
      description: parsed.data.description,
      issueTypeName: parsed.data.issueType,
      clientLabel,
      priority: parsed.data.priority,
    });

    return NextResponse.json({ key: issue.key }, { status: 201 });
  } catch (error) {
    if (error instanceof JiraConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return portalErrorResponse(error);
  }
}
