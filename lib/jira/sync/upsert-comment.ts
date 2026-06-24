import { adfToMarkdown } from "@/lib/jira/adf";
import { getIssue, type JiraComment } from "@/lib/jira/client";
import { upsertIssueFromJira } from "@/lib/jira/sync/upsert-issue";
import { createServiceClient } from "@/lib/supabase/server";

export async function syncIssueByKey(
  issueKey: string,
  organizationId?: string | null
): Promise<{ issueId: string; organizationId: string } | null> {
  const issue = await getIssue(issueKey);
  return upsertIssueFromJira(issue, organizationId);
}

export async function deleteCommentByJiraId(jiraCommentId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("jira_comments")
    .delete()
    .eq("jira_comment_id", jiraCommentId)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export function commentBodyToMarkdown(
  body: string | { type: string; version: number; content: unknown[] }
): string {
  if (typeof body === "string") return body;
  return adfToMarkdown(body as JiraComment["body"]);
}
