import { NextRequest, NextResponse } from "next/server";
import {
  createIssue,
  searchIssues,
  serializeIssue,
  JiraConfigError,
} from "@/lib/jira/client";
import {
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { ticketCreateSchema } from "@/lib/validations/portal";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePortalSession();
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    if (!session.organization.jira_component_name) {
      return NextResponse.json({ issues: [] });
    }

    let jql = `project = ${session.organization.jira_project_key} AND component = "${session.organization.jira_component_name}"`;
    if (status) jql += ` AND status = "${status}"`;
    if (type) jql += ` AND issuetype = "${type}"`;
    if (q) jql += ` AND summary ~ "${q.replace(/"/g, '\\"')}"`;
    jql += " ORDER BY updated DESC";

    const result = await searchIssues(jql, 100);
    return NextResponse.json({
      issues: (result.issues ?? []).map(serializeIssue),
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
    const session = await requirePortalSession();
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

    const componentId = session.organization.jira_component_id;
    if (!componentId) {
      return NextResponse.json(
        { error: "Organization is not linked to Jira." },
        { status: 503 }
      );
    }

    const issue = await createIssue({
      summary: parsed.data.summary,
      description: parsed.data.description,
      issueTypeName: parsed.data.issueType,
      componentId,
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
