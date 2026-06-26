import { searchIssues, type JiraIssue } from "@/lib/jira/client";
import { adfToMarkdown } from "@/lib/jira/adf";

export type JiraTopic = {
  key: string;
  title: string;
  body: string;
  issueType: string;
  resolvedAt: string | null;
  clientSlugs: string[];
};

const CLIENT_LABEL_PREFIX = "client-";

export function extractClientSlugs(labels: string[] = []): string[] {
  return labels
    .filter((label) => label.toLowerCase().startsWith(CLIENT_LABEL_PREFIX))
    .map((label) => label.slice(CLIENT_LABEL_PREFIX.length).toLowerCase());
}

function issueDescriptionMarkdown(issue: JiraIssue): string {
  const description = issue.fields.description;
  if (!description) return "";
  if (typeof description === "string") return description;
  return adfToMarkdown(description as Parameters<typeof adfToMarkdown>[0]);
}

export async function fetchRecentDoneJiraTopics(
  limit = 20
): Promise<JiraTopic[]> {
  const projectKey = process.env.JIRA_PROJECT_KEY ?? "KAN";
  const jql = `project = ${projectKey} AND status = Done AND resolved >= -30d ORDER BY resolved DESC`;
  const { issues } = await searchIssues(jql, limit);

  return issues.map((issue) => ({
    key: issue.key,
    title: issue.fields.summary,
    body: issueDescriptionMarkdown(issue),
    issueType: issue.fields.issuetype?.name ?? "Task",
    resolvedAt: issue.fields.resolutiondate ?? null,
    clientSlugs: extractClientSlugs(issue.fields.labels),
  }));
}

export function formatJiraTopicForPrompt(topic: JiraTopic): string {
  return `Issue type: ${topic.issueType}\nSummary: ${topic.title}\nDescription: ${topic.body || "(no description)"}`;
}
