import { adfToMarkdown } from "@/lib/jira/adf";
import {
  getIssueChangelog,
  isSubtaskIssue,
  type JiraComment,
  type JiraIssue,
} from "@/lib/jira/client";
import { PORTAL_EXCLUDE_CLOSE_METRIC_LABEL } from "@/lib/portal/metrics";
import { createServiceClient } from "@/lib/supabase/server";
import type { JiraCommentSource } from "@/lib/supabase/database.types";
import { resolveOrganizationIdFromLabels } from "@/lib/jira/sync/org-resolve";

function descriptionToMarkdown(
  description: JiraIssue["fields"]["description"]
): string {
  if (!description) return "";
  if (typeof description === "string") return description;
  return adfToMarkdown(description as JiraComment["body"]);
}

function hasLabel(issue: JiraIssue, label: string): boolean {
  const needle = label.toLowerCase();
  return (issue.fields.labels ?? []).some((value) => value.toLowerCase() === needle);
}

export async function upsertIssueFromJira(
  issue: JiraIssue,
  organizationId?: string | null
): Promise<{ issueId: string; organizationId: string } | null> {
  if (isSubtaskIssue(issue)) return null;

  const orgId =
    organizationId ?? (await resolveOrganizationIdFromLabels(issue.fields.labels));
  if (!orgId) return null;

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const row = {
    organization_id: orgId,
    jira_key: issue.key,
    summary: issue.fields.summary,
    ...(issue.fields.description !== undefined
      ? { description: descriptionToMarkdown(issue.fields.description) }
      : {}),
    issue_type: issue.fields.issuetype?.name ?? "Task",
    priority: issue.fields.priority?.name ?? null,
    status: issue.fields.status?.name ?? "Unknown",
    status_category: issue.fields.status?.statusCategory?.key ?? "new",
    labels: issue.fields.labels ?? [],
    parent_jira_key: issue.fields.parent?.key ?? null,
    created_at: issue.fields.created ?? now,
    updated_at: issue.fields.updated ?? now,
    resolved_at: issue.fields.resolutiondate ?? null,
    exclude_from_close_metric: hasLabel(issue, PORTAL_EXCLUDE_CLOSE_METRIC_LABEL),
    sync_status: "synced" as const,
    sync_error: null,
    jira_updated_at: issue.fields.updated ?? now,
  };

  const { data: existing } = await supabase
    .from("jira_issues")
    .select("id")
    .eq("jira_key", issue.key)
    .maybeSingle();

  let issueId: string;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("jira_issues")
      .update(row)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    issueId = data.id;
  } else {
    const { data, error } = await supabase
      .from("jira_issues")
      .insert(row)
      .select("id")
      .single();
    if (error) throw error;
    issueId = data.id;
  }

  await syncIssueComments(issueId, issue);
  await syncIssueTransitions(issueId, issue.key);

  return { issueId, organizationId: orgId };
}

async function syncIssueComments(issueId: string, issue: JiraIssue) {
  const comments = issue.fields.comment?.comments ?? [];
  const supabase = createServiceClient();
  const jiraIds = new Set<string>();

  for (const comment of comments) {
    jiraIds.add(comment.id);
    const body = adfToMarkdown(comment.body);
    const row = {
      issue_id: issueId,
      jira_comment_id: comment.id,
      author_display_name: comment.author.displayName,
      author_email: comment.author.emailAddress ?? null,
      body_markdown: body,
      source: "jira" as JiraCommentSource,
      sync_status: "synced" as const,
      created_at: comment.created,
    };

    const { data: existing } = await supabase
      .from("jira_comments")
      .select("id, source")
      .eq("jira_comment_id", comment.id)
      .maybeSingle();

    if (existing?.id) {
      const updateRow =
        existing.source === "portal" ? { ...row, source: "portal" as const } : row;
      await supabase.from("jira_comments").update(updateRow).eq("id", existing.id);
      continue;
    }

    const portalMatchId = await findUnlinkedPortalComment(supabase, issueId, body);
    if (portalMatchId) {
      await supabase
        .from("jira_comments")
        .update({ ...row, source: "portal" as const })
        .eq("id", portalMatchId);
      continue;
    }

    await supabase.from("jira_comments").insert(row);
  }

  const { data: mirrored } = await supabase
    .from("jira_comments")
    .select("id, jira_comment_id")
    .eq("issue_id", issueId)
    .not("jira_comment_id", "is", null);

  for (const row of mirrored ?? []) {
    if (row.jira_comment_id && !jiraIds.has(row.jira_comment_id)) {
      await supabase.from("jira_comments").delete().eq("id", row.id);
    }
  }
}

function normalizeCommentBody(body: string): string {
  return body.replace(/\r\n/g, "\n").trim();
}

async function findUnlinkedPortalComment(
  supabase: ReturnType<typeof createServiceClient>,
  issueId: string,
  body: string
): Promise<string | null> {
  const normalizedBody = normalizeCommentBody(body);
  const { data: candidates } = await supabase
    .from("jira_comments")
    .select("id, body_markdown")
    .eq("issue_id", issueId)
    .eq("source", "portal")
    .is("jira_comment_id", null)
    .order("created_at", { ascending: false });

  for (const candidate of candidates ?? []) {
    if (normalizeCommentBody(candidate.body_markdown) === normalizedBody) {
      return candidate.id;
    }
  }

  return null;
}

async function syncIssueTransitions(issueId: string, issueKey: string) {
  const changelog = await getIssueChangelog(issueKey);
  const supabase = createServiceClient();

  for (const history of changelog.histories) {
    for (const item of history.items) {
      if (item.field !== "status") continue;

      await supabase.from("jira_status_transitions").upsert(
        {
          issue_id: issueId,
          from_status: item.fromString ?? "",
          to_status: item.toString ?? "",
          transitioned_at: history.created,
        },
        { onConflict: "issue_id,transitioned_at,to_status", ignoreDuplicates: true }
      );
    }
  }
}

export async function deleteIssueByKey(jiraKey: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("jira_issues").delete().eq("jira_key", jiraKey);
}

export async function linkPendingIssueToJiraKey(
  issueId: string,
  jiraKey: string
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("jira_issues")
    .update({
      jira_key: jiraKey,
      sync_status: "synced",
      sync_error: null,
    })
    .eq("id", issueId);

  if (error) throw error;
}
