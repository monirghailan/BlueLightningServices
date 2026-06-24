import { adfToMarkdown } from "@/lib/jira/adf";
import { getIssue, type JiraComment } from "@/lib/jira/client";
import { upsertIssueFromJira } from "@/lib/jira/sync/upsert-issue";

export async function syncIssueByKey(
  issueKey: string,
  organizationId?: string | null
): Promise<{ issueId: string; organizationId: string } | null> {
  const issue = await getIssue(issueKey);
  return upsertIssueFromJira(issue, organizationId);
}

export function commentBodyToMarkdown(
  body: string | { type: string; version: number; content: unknown[] }
): string {
  if (typeof body === "string") return body;
  return adfToMarkdown(body as JiraComment["body"]);
}
