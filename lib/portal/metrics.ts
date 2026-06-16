import {
  getBacklogIssues,
  getBoardIssues,
  searchIssues,
  serializeIssue,
  type JiraIssue,
} from "@/lib/jira/client";
import { resolvePortalBoardId } from "@/lib/jira/board";
import { clientScopeJql } from "@/lib/jira/client-field";
import type { Organization } from "@/lib/supabase/database.types";

export interface PortalMetrics {
  openTickets: number;
  closedThisMonth: number;
  avgAgeDays: number;
  oldestOpen: { key: string; summary: string; ageDays: number } | null;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  throughput: { week: string; created: number; resolved: number }[];
  recentActivity: ReturnType<typeof serializeIssue>[];
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function weekLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function computeMetrics(org: Organization): Promise<PortalMetrics> {
  const clientLabel = org.jira_component_name;
  if (!clientLabel) {
    return emptyMetrics();
  }

  const jql = `${clientScopeJql(clientLabel, org.jira_project_key)} ORDER BY updated DESC`;
  const result = await searchIssues(jql, 100);
  const issues = result.issues ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const open = issues.filter((i) => i.fields.status?.statusCategory?.key !== "done");
  const closedThisMonth = issues.filter((i) => {
    const resolved = i.fields.resolutiondate;
    return resolved && new Date(resolved) >= monthStart;
  });

  const ages = open
    .map((i) => (i.fields.created ? daysSince(i.fields.created) : 0))
    .filter((d) => d >= 0);
  const avgAgeDays =
    ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  let oldestOpen: PortalMetrics["oldestOpen"] = null;
  for (const issue of open) {
    if (!issue.fields.created) continue;
    const ageDays = daysSince(issue.fields.created);
    if (!oldestOpen || ageDays > oldestOpen.ageDays) {
      oldestOpen = { key: issue.key, summary: issue.fields.summary, ageDays };
    }
  }

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const issue of issues) {
    const type = issue.fields.issuetype?.name ?? "Other";
    const status = issue.fields.status?.name ?? "Unknown";
    byType[type] = (byType[type] ?? 0) + 1;
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  const throughput: PortalMetrics["throughput"] = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const label = weekLabel(weekStart);

    const created = issues.filter((i) => {
      const c = i.fields.created;
      if (!c) return false;
      const d = new Date(c);
      return d >= weekStart && d < weekEnd;
    }).length;

    const resolved = issues.filter((i) => {
      const r = i.fields.resolutiondate;
      if (!r) return false;
      const d = new Date(r);
      return d >= weekStart && d < weekEnd;
    }).length;

    throughput.push({ week: label, created, resolved });
  }

  const recentActivity = issues.slice(0, 10).map(serializeIssue);

  return {
    openTickets: open.length,
    closedThisMonth: closedThisMonth.length,
    avgAgeDays,
    oldestOpen,
    byType,
    byStatus,
    throughput,
    recentActivity,
  };
}

function emptyMetrics(): PortalMetrics {
  return {
    openTickets: 0,
    closedThisMonth: 0,
    avgAgeDays: 0,
    oldestOpen: null,
    byType: {},
    byStatus: {},
    throughput: [],
    recentActivity: [],
  };
}

export async function getBacklogSections(org: Organization) {
  if (!org.jira_component_name) {
    return { backlog: [], readyForBls: [] };
  }

  const boardId = resolvePortalBoardId(org);
  const clientJql = clientScopeJql(org.jira_component_name);
  const [backlogResult, boardResult, clientScope] = await Promise.all([
    getBacklogIssues(boardId, 0, 100),
    getBoardIssues(boardId, 0, 100),
    searchIssues(`${clientJql} ORDER BY updated DESC`, 100),
  ]);

  const clientKeys = new Set((clientScope.issues ?? []).map((i) => i.key));
  const isClientIssue = (issue: JiraIssue) => clientKeys.has(issue.key);

  const clientBacklog = (backlogResult.issues ?? []).filter(isClientIssue);
  const backlogKeys = new Set(clientBacklog.map((i) => i.key));

  const readyForBls = (boardResult.issues ?? []).filter(
    (i: JiraIssue) =>
      isClientIssue(i) &&
      !backlogKeys.has(i.key) &&
      (i.fields.status?.name === "To Do" ||
        i.fields.status?.statusCategory?.key === "new")
  );

  return {
    backlog: clientBacklog.map(serializeIssue),
    readyForBls: readyForBls.map(serializeIssue),
  };
}

export async function validateOrgIssue(org: Organization, issueKey: string) {
  const { issueBelongsToClient } = await import("@/lib/jira/client");
  if (!org.jira_component_name) return false;
  return issueBelongsToClient(issueKey, org.jira_component_name);
}
