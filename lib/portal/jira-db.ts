import type { PortalMetrics } from "@/lib/portal/metrics";
import { metricsRowToPortalMetrics } from "@/lib/jira/sync/compute-metrics-db";
import { enqueueOutbox } from "@/lib/jira/sync/process-outbox";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  JiraCommentRow,
  JiraIssueRow,
  Organization,
} from "@/lib/supabase/database.types";

export interface SerializedTicket {
  id: string;
  key: string | null;
  summary: string;
  status: string;
  statusCategory: string;
  type: string;
  priority: string | null;
  created: string | null;
  updated: string | null;
  resolved: string | null;
  syncStatus: string;
}

export interface SerializedTicketDetail extends SerializedTicket {
  description: string;
  comments: {
    id: string;
    author: string;
    body: string;
    created: string;
    syncStatus: string;
  }[];
}

function serializeIssueRow(row: JiraIssueRow): SerializedTicket {
  return {
    id: row.id,
    key: row.jira_key,
    summary: row.summary,
    status: row.status,
    statusCategory: row.status_category,
    type: row.issue_type,
    priority: row.priority,
    created: row.created_at,
    updated: row.updated_at,
    resolved: row.resolved_at,
    syncStatus: row.sync_status,
  };
}

export async function getOrgMetrics(org: Organization): Promise<PortalMetrics & { computedAt?: string }> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("organization_metrics")
    .select("*")
    .eq("organization_id", org.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return {
      openTickets: 0,
      closedThisMonth: 0,
      avgTimeToCloseDays: 0,
      oldestOpen: null,
      byType: {},
      byStatus: {},
      throughput: [],
    };
  }

  return {
    ...metricsRowToPortalMetrics(data),
    computedAt: data.computed_at,
  };
}

export async function listTickets(
  org: Organization,
  options: {
    status?: string | null;
    type?: string | null;
    q?: string | null;
    page: number;
    pageSize: number;
  }
) {
  const supabase = createServiceClient();
  let query = supabase
    .from("jira_issues")
    .select("*", { count: "exact" })
    .eq("organization_id", org.id)
    .is("parent_jira_key", null)
    .eq("is_in_backlog", false)
    .order("updated_at", { ascending: false });

  if (options.status === "open") {
    query = query.neq("status_category", "done");
  } else if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.type) {
    query = query.eq("issue_type", options.type);
  }

  if (options.q) {
    query = query.ilike("summary", `%${options.q}%`);
  }

  const start = (options.page - 1) * options.pageSize;
  query = query.range(start, start + options.pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / options.pageSize) : 0;

  return {
    issues: ((data ?? []) as JiraIssueRow[]).map(serializeIssueRow),
    total,
    page: options.page,
    pageSize: options.pageSize,
    totalPages,
  };
}

export async function findOrgIssue(
  org: Organization,
  keyOrId: string
): Promise<JiraIssueRow | null> {
  const supabase = createServiceClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    keyOrId
  );

  let query = supabase.from("jira_issues").select("*").eq("organization_id", org.id);

  if (isUuid) {
    query = query.eq("id", keyOrId);
  } else {
    query = query.eq("jira_key", keyOrId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as JiraIssueRow | null;
}

export async function validateOrgIssue(org: Organization, keyOrId: string): Promise<boolean> {
  const issue = await findOrgIssue(org, keyOrId);
  return issue != null;
}

export async function getTicketDetail(
  org: Organization,
  keyOrId: string
): Promise<SerializedTicketDetail | null> {
  const issue = await findOrgIssue(org, keyOrId);
  if (!issue) return null;

  const supabase = createServiceClient();
  const { data: comments, error } = await supabase
    .from("jira_comments")
    .select("*")
    .eq("issue_id", issue.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return {
    ...serializeIssueRow(issue),
    description: issue.description,
    comments: ((comments ?? []) as JiraCommentRow[]).map((comment) => ({
      id: comment.id,
      author: comment.author_display_name,
      body: comment.body_markdown,
      created: comment.created_at,
      syncStatus: comment.sync_status,
    })),
  };
}

export async function getPaginatedBacklog(
  org: Organization,
  page: number,
  pageSize: number
) {
  const supabase = createServiceClient();
  const start = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("jira_issues")
    .select("*", { count: "exact" })
    .eq("organization_id", org.id)
    .eq("is_in_backlog", true)
    .is("parent_jira_key", null)
    .order("backlog_rank", { ascending: true, nullsFirst: false })
    .range(start, start + pageSize - 1);

  if (error) throw error;

  const backlogRows = (data ?? []) as JiraIssueRow[];
  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  let leadingKey: string | null = null;
  let trailingKey: string | null = null;

  if (start > 0) {
    const { data: prev } = await supabase
      .from("jira_issues")
      .select("jira_key")
      .eq("organization_id", org.id)
      .eq("is_in_backlog", true)
      .order("backlog_rank", { ascending: true, nullsFirst: false })
      .range(start - 1, start - 1)
      .maybeSingle();
    leadingKey = (prev as { jira_key: string | null } | null)?.jira_key ?? null;
  }

  if (start + backlogRows.length < total) {
    const { data: next } = await supabase
      .from("jira_issues")
      .select("jira_key")
      .eq("organization_id", org.id)
      .eq("is_in_backlog", true)
      .order("backlog_rank", { ascending: true, nullsFirst: false })
      .range(start + backlogRows.length, start + backlogRows.length)
      .maybeSingle();
    trailingKey = (next as { jira_key: string | null } | null)?.jira_key ?? null;
  }

  return {
    backlog: backlogRows.map(serializeIssueRow),
    total,
    page,
    pageSize,
    totalPages,
    leadingKey,
    trailingKey,
  };
}

export async function createPendingTicket(
  org: Organization,
  input: {
    summary: string;
    description?: string;
    issueType: string;
    priority?: string;
  }
) {
  const supabase = createServiceClient();
  const clientLabel = org.jira_component_name;
  if (!clientLabel) throw new Error("Organization is not linked to Jira.");

  const { data: issue, error } = await supabase
    .from("jira_issues")
    .insert({
      organization_id: org.id,
      summary: input.summary,
      description: input.description ?? "",
      issue_type: input.issueType,
      priority: input.priority ?? null,
      labels: [clientLabel, "portal-submitted"],
      sync_status: "pending_create",
      is_in_backlog: true,
    })
    .select("*")
    .single();

  if (error) throw error;

  await enqueueOutbox(org.id, "create_issue", {
    issueId: issue.id,
    summary: input.summary,
    description: input.description,
    issueType: input.issueType,
    priority: input.priority,
  });

  return issue as JiraIssueRow;
}

export async function createPendingComment(
  org: Organization,
  keyOrId: string,
  body: string,
  authorEmail: string
) {
  const issue = await findOrgIssue(org, keyOrId);
  if (!issue) return null;

  const prefixed = `[Portal — ${authorEmail}]\n${body}`;
  const supabase = createServiceClient();

  const { data: comment, error } = await supabase
    .from("jira_comments")
    .insert({
      issue_id: issue.id,
      author_display_name: authorEmail,
      author_email: authorEmail,
      body_markdown: prefixed,
      source: "portal",
      sync_status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;

  if (issue.jira_key) {
    await enqueueOutbox(org.id, "add_comment", {
      commentId: comment.id,
      issueId: issue.id,
      jiraKey: issue.jira_key,
      body: prefixed,
    });
  }

  return comment as JiraCommentRow;
}

export async function enqueueRankBacklog(
  org: Organization,
  issueKey: string,
  rankBeforeIssue?: string,
  rankAfterIssue?: string
) {
  await enqueueOutbox(org.id, "rank_backlog", {
    issueKey,
    rankBeforeIssue,
    rankAfterIssue,
  });
}

export async function enqueueMoveToBoard(org: Organization, issueKeys: string[]) {
  await enqueueOutbox(org.id, "move_to_board", { issueKeys });
}

export async function enqueueMoveToBacklog(org: Organization, issueKeys: string[]) {
  await enqueueOutbox(org.id, "move_to_backlog", { issueKeys });
}
