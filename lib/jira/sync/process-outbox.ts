import {
  addComment,
  createIssue,
  moveIssuesToBacklog,
  moveIssuesToBoard,
  rankIssue,
} from "@/lib/jira/client";
import { resolvePortalBoardId } from "@/lib/jira/board";
import { linkPendingIssueToJiraKey } from "@/lib/jira/sync/upsert-issue";
import { syncIssueByKey } from "@/lib/jira/sync/upsert-comment";
import { syncBacklogForOrg } from "@/lib/jira/sync/sync-backlog";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  JiraSyncOutboxRow,
  Organization,
} from "@/lib/supabase/database.types";

const MAX_ATTEMPTS = 5;

export async function processJiraOutbox(limit = 20): Promise<{
  processed: number;
  results: { id: string; status: "done" | "failed" }[];
}> {
  const supabase = createServiceClient();

  const { data: jobs, error } = await supabase
    .from("jira_sync_outbox")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  const results: { id: string; status: "done" | "failed" }[] = [];

  for (const job of (jobs ?? []) as JiraSyncOutboxRow[]) {
    const outcome = await processOutboxJob(supabase, job);
    results.push({ id: job.id, status: outcome });
  }

  return { processed: results.length, results };
}

async function processOutboxJob(
  supabase: ReturnType<typeof createServiceClient>,
  job: JiraSyncOutboxRow
): Promise<"done" | "failed"> {
  await supabase
    .from("jira_sync_outbox")
    .update({ status: "processing", attempts: job.attempts + 1 })
    .eq("id", job.id);

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", job.organization_id)
    .maybeSingle();

  if (!org) {
    await markFailed(supabase, job.id, "Organization not found.");
    return "failed";
  }

  const organization = org as Organization;

  try {
    switch (job.operation) {
      case "create_issue":
        await handleCreateIssue(supabase, organization, job);
        break;
      case "add_comment":
        await handleAddComment(supabase, organization, job);
        break;
      case "rank_backlog":
        await handleRankBacklog(organization, job);
        break;
      case "move_to_board":
        await handleMoveToBoard(organization, job);
        break;
      case "move_to_backlog":
        await handleMoveToBacklog(organization, job);
        break;
      default:
        throw new Error(`Unknown operation: ${job.operation}`);
    }

    await supabase
      .from("jira_sync_outbox")
      .update({ status: "done", processed_at: new Date().toISOString(), last_error: null })
      .eq("id", job.id);

    return "done";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Outbox processing failed.";
    await markFailed(supabase, job.id, message);
    return "failed";
  }
}

async function handleCreateIssue(
  supabase: ReturnType<typeof createServiceClient>,
  org: Organization,
  job: JiraSyncOutboxRow
) {
  const payload = job.payload as {
    issueId: string;
    summary: string;
    description?: string;
    issueType: string;
    priority?: string;
  };

  const clientLabel = org.jira_component_name;
  if (!clientLabel) throw new Error("Organization is not linked to Jira.");

  const created = await createIssue({
    summary: payload.summary,
    description: payload.description,
    issueTypeName: payload.issueType,
    clientLabel,
    priority: payload.priority,
  });

  await linkPendingIssueToJiraKey(payload.issueId, created.key);
  await syncIssueByKey(created.key, org.id);

  const { data: pendingComments } = await supabase
    .from("jira_comments")
    .select("id, body_markdown")
    .eq("issue_id", payload.issueId)
    .eq("sync_status", "pending");

  for (const comment of pendingComments ?? []) {
    await enqueueOutbox(org.id, "add_comment", {
      commentId: comment.id,
      issueId: payload.issueId,
      jiraKey: created.key,
      body: comment.body_markdown,
    });
  }
}

async function handleAddComment(
  supabase: ReturnType<typeof createServiceClient>,
  org: Organization,
  job: JiraSyncOutboxRow
) {
  const payload = job.payload as {
    commentId: string;
    issueId: string;
    jiraKey: string;
    body: string;
  };

  await addComment(payload.jiraKey, payload.body);

  await supabase
    .from("jira_comments")
    .update({ sync_status: "synced" })
    .eq("id", payload.commentId);

  await syncIssueByKey(payload.jiraKey, org.id);
}

async function handleRankBacklog(org: Organization, job: JiraSyncOutboxRow) {
  const payload = job.payload as {
    issueKey: string;
    rankBeforeIssue?: string;
    rankAfterIssue?: string;
  };

  await rankIssue(
    [payload.issueKey],
    payload.rankBeforeIssue,
    payload.rankAfterIssue
  );
  await syncBacklogForOrg(org);
}

async function handleMoveToBoard(org: Organization, job: JiraSyncOutboxRow) {
  const payload = job.payload as { issueKeys: string[] };
  const boardId = resolvePortalBoardId(org);
  await moveIssuesToBoard(boardId, payload.issueKeys);
  await syncBacklogForOrg(org);
  for (const key of payload.issueKeys) {
    await syncIssueByKey(key, org.id);
  }
}

async function handleMoveToBacklog(org: Organization, job: JiraSyncOutboxRow) {
  const payload = job.payload as { issueKeys: string[] };
  const boardId = resolvePortalBoardId(org);
  await moveIssuesToBacklog(boardId, payload.issueKeys);
  await syncBacklogForOrg(org);
  for (const key of payload.issueKeys) {
    await syncIssueByKey(key, org.id);
  }
}

async function markFailed(
  supabase: ReturnType<typeof createServiceClient>,
  jobId: string,
  message: string
) {
  await supabase
    .from("jira_sync_outbox")
    .update({ status: "failed", last_error: message })
    .eq("id", jobId);
}

export async function enqueueOutbox(
  organizationId: string,
  operation: JiraSyncOutboxRow["operation"],
  payload: Record<string, unknown>
): Promise<string> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("jira_sync_outbox")
    .insert({
      organization_id: organizationId,
      operation,
      payload,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
