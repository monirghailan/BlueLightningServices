import { JIRA_CLIENT_FIELD_ID } from "@/lib/jira/client-field";

const JIRA_BASE = process.env.JIRA_BASE_URL ?? "https://bluelightning.atlassian.net";
const JIRA_EMAIL = process.env.JIRA_EMAIL ?? "";
const JIRA_TOKEN = process.env.JIRA_API_TOKEN ?? "";
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY ?? "KAN";

function authHeader(): string {
  if (!JIRA_EMAIL || !JIRA_TOKEN) {
    throw new JiraConfigError("Jira credentials are not configured.");
  }
  return `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64")}`;
}

export class JiraConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JiraConfigError";
  }
}

export class JiraApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string
  ) {
    super(message);
    this.name = "JiraApiError";
  }
}

async function jiraFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${JIRA_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new JiraApiError(
      `Jira API error: ${response.status}`,
      response.status,
      body
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface JiraIssueFields {
  summary: string;
  description?: string | { type: string; version: number; content: unknown[] };
  status?: { name: string; statusCategory?: { key: string; name: string } };
  issuetype?: { name: string };
  priority?: { name: string };
  components?: { id: string; name: string }[];
  created?: string;
  updated?: string;
  resolutiondate?: string | null;
  comment?: {
    comments: JiraComment[];
    total: number;
  };
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: JiraIssueFields;
}

export interface JiraComment {
  id: string;
  author: { displayName: string; emailAddress?: string };
  body: string | { type: string; version: number; content: unknown[] };
  created: string;
}

export interface JiraSearchResult {
  issues: JiraIssue[];
  total: number;
}

function markdownToAdf(text: string) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

function adfToPlain(body: JiraComment["body"]): string {
  if (typeof body === "string") return body;
  try {
    const walk = (nodes: unknown[]): string =>
      nodes
        .map((node) => {
          if (!node || typeof node !== "object") return "";
          const n = node as { type?: string; text?: string; content?: unknown[] };
          if (n.type === "text" && n.text) return n.text;
          if (n.content) return walk(n.content);
          return "";
        })
        .join("");
    return walk(body.content ?? []).trim();
  } catch {
    return "";
  }
}

export { adfToPlain };

export async function searchIssues(jql: string, maxResults = 50, startAt = 0) {
  return jiraFetch<JiraSearchResult>("/rest/api/3/search", {
    method: "POST",
    body: JSON.stringify({
      jql,
      maxResults,
      startAt,
      fields: [
        "summary",
        "status",
        "issuetype",
        "priority",
        "components",
        "created",
        "updated",
        "resolutiondate",
        "comment",
      ],
    }),
  });
}

export async function getIssue(key: string) {
  return jiraFetch<JiraIssue>(
    `/rest/api/3/issue/${key}?fields=summary,description,status,issuetype,priority,${JIRA_CLIENT_FIELD_ID},created,updated,resolutiondate,comment`
  );
}

export async function createIssue(input: {
  summary: string;
  description?: string;
  issueTypeName: string;
  clientLabel: string;
  priority?: string;
}) {
  const fields: Record<string, unknown> = {
    project: { key: JIRA_PROJECT_KEY },
    issuetype: { name: input.issueTypeName },
    summary: input.summary,
    [JIRA_CLIENT_FIELD_ID]: [input.clientLabel],
    labels: ["portal-submitted"],
  };

  if (input.description) {
    fields.description = markdownToAdf(input.description);
  }

  if (input.priority) {
    fields.priority = { name: input.priority };
  }

  return jiraFetch<{ key: string; id: string }>("/rest/api/3/issue", {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

export async function addComment(issueKey: string, body: string) {
  return jiraFetch(`/rest/api/3/issue/${issueKey}/comment`, {
    method: "POST",
    body: JSON.stringify({ body: markdownToAdf(body) }),
  });
}

export async function getBacklogIssues(boardId: string, startAt = 0, maxResults = 50) {
  const params = new URLSearchParams({
    startAt: String(startAt),
    maxResults: String(maxResults),
    fields: "summary,status,issuetype,priority,created,updated",
  });
  return jiraFetch<{ issues: JiraIssue[]; total: number }>(
    `/rest/agile/1.0/board/${boardId}/backlog?${params}`
  );
}

export async function getBoardIssues(boardId: string, startAt = 0, maxResults = 50) {
  const params = new URLSearchParams({
    startAt: String(startAt),
    maxResults: String(maxResults),
    fields: "summary,status,issuetype,priority,created,updated",
  });
  return jiraFetch<{ issues: JiraIssue[]; total: number }>(
    `/rest/agile/1.0/board/${boardId}/issue?${params}`
  );
}

export async function rankIssue(issues: string[], rankBeforeIssue?: string, rankAfterIssue?: string) {
  const body: Record<string, unknown> = { issues };
  if (rankBeforeIssue) body.rankBeforeIssue = rankBeforeIssue;
  if (rankAfterIssue) body.rankAfterIssue = rankAfterIssue;

  return jiraFetch<void>("/rest/agile/1.0/issue/rank", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function moveIssuesToBoard(boardId: string, issues: string[]) {
  return jiraFetch<void>(`/rest/agile/1.0/board/${boardId}/issue`, {
    method: "POST",
    body: JSON.stringify({ issues }),
  });
}

export async function moveIssuesToBacklog(boardId: string, issues: string[]) {
  return jiraFetch<void>(`/rest/agile/1.0/backlog/${boardId}/issue`, {
    method: "POST",
    body: JSON.stringify({ issues }),
  });
}

export async function findFilterByName(name: string) {
  const params = new URLSearchParams({
    filterName: name,
    maxResults: "20",
    startAt: "0",
  });
  const result = await jiraFetch<{
    values: Array<{ id: string; name: string; jql: string }>;
  }>(`/rest/api/3/filter/search?${params}`);

  return result.values?.find((filter) => filter.name === name) ?? null;
}

export async function getOrCreateFilter(
  name: string,
  jql: string,
  options?: { shareWithProjectKey?: string }
) {
  const existing = await findFilterByName(name);
  if (existing) {
    return { id: existing.id, name: existing.name };
  }

  return createFilter(name, jql, options?.shareWithProjectKey);
}

export async function createFilter(
  name: string,
  jql: string,
  shareWithProjectKey?: string
) {
  const body: Record<string, unknown> = { name, jql };
  if (shareWithProjectKey) {
    body.sharePermissions = [
      { type: "project", project: { key: shareWithProjectKey } },
    ];
  }

  return jiraFetch<{ id: string; name: string }>("/rest/api/3/filter", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function findBoardByName(name: string) {
  const params = new URLSearchParams({
    projectKeyOrId: JIRA_PROJECT_KEY,
    name,
    maxResults: "20",
  });
  const result = await jiraFetch<{
    values: Array<{ id: number; name: string }>;
  }>(`/rest/agile/1.0/board?${params}`);

  return result.values?.find((board) => board.name === name) ?? null;
}

export async function getOrCreateKanbanBoard(name: string, filterId: number) {
  const existing = await findBoardByName(name);
  if (existing) {
    return { id: existing.id, name: existing.name };
  }

  return createKanbanBoard(name, filterId);
}

export async function createKanbanBoard(name: string, filterId: number) {
  return jiraFetch<{ id: number; name: string }>("/rest/agile/1.0/board", {
    method: "POST",
    body: JSON.stringify({
      name,
      type: "kanban",
      filterId,
      location: {
        type: "project",
        projectKeyOrId: JIRA_PROJECT_KEY,
      },
    }),
  });
}

export async function issueBelongsToClient(
  issueKey: string,
  clientLabel: string
): Promise<boolean> {
  const issue = await getIssue(issueKey);
  const fieldValues = (issue.fields as unknown as Record<string, unknown>)[
    JIRA_CLIENT_FIELD_ID
  ];
  if (!Array.isArray(fieldValues)) return false;

  return fieldValues.some(
    (value) =>
      typeof value === "string" &&
      value.toLowerCase() === clientLabel.toLowerCase()
  );
}

export function serializeIssue(issue: JiraIssue) {
  return {
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status?.name ?? "Unknown",
    statusCategory: issue.fields.status?.statusCategory?.key ?? "new",
    type: issue.fields.issuetype?.name ?? "Task",
    priority: issue.fields.priority?.name ?? null,
    created: issue.fields.created ?? null,
    updated: issue.fields.updated ?? null,
    resolved: issue.fields.resolutiondate ?? null,
  };
}

export function serializeIssueDetail(issue: JiraIssue) {
  const comments =
    issue.fields.comment?.comments.map((c) => ({
      id: c.id,
      author: c.author.displayName,
      body: adfToPlain(c.body),
      created: c.created,
    })) ?? [];

  return {
    ...serializeIssue(issue),
    description:
      issue.fields.description && typeof issue.fields.description !== "string"
        ? adfToPlain(issue.fields.description as JiraComment["body"])
        : (issue.fields.description as string | undefined) ?? "",
    comments,
  };
}
