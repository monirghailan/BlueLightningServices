import {
  getBacklogIssues,
  getBoardIssues,
  getIssue,
  isSubtaskIssue,
  parentIssuesOnly,
  searchIssues,
  serializeIssue,
  type JiraIssue,
} from "@/lib/jira/client";
import { resolvePortalBoardId } from "@/lib/jira/board";
import { clientScopeJql } from "@/lib/jira/client-field";
import type { Organization } from "@/lib/supabase/database.types";

/** Tickets blocked on client feedback before we had a waiting status — omit from close-time KPI. */
export const PORTAL_EXCLUDE_CLOSE_METRIC_LABEL = "portal-exclude-close-metric";

export interface PortalMetrics {
  openTickets: number;
  closedThisMonth: number;
  avgTimeToCloseDays: number;
  oldestOpen: { key: string; summary: string; ageDays: number } | null;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  throughput: { week: string; created: number; resolved: number }[];
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_BUSINESS_DAY = 8 * MS_PER_HOUR;
const MS_PER_CALENDAR_DAY = 24 * MS_PER_HOUR;

function utcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

/** Weekdays only: partial days as hours/8, full intermediate weekdays as 1.0 each. */
function fractionalBusinessDaysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (endMs <= startMs) return 0;

  const startDay = utcDayStart(start);
  const endDay = utcDayStart(end);

  if (startDay === endDay) {
    if (!isWeekday(start)) return 0;
    return Math.min(endMs - startMs, MS_PER_BUSINESS_DAY) / MS_PER_BUSINESS_DAY;
  }

  let total = 0;

  if (isWeekday(start)) {
    const firstDayEnd = startDay + MS_PER_CALENDAR_DAY;
    total += Math.min(firstDayEnd - startMs, MS_PER_BUSINESS_DAY) / MS_PER_BUSINESS_DAY;
  }

  if (isWeekday(end)) {
    total += Math.min(endMs - endDay, MS_PER_BUSINESS_DAY) / MS_PER_BUSINESS_DAY;
  }

  for (let cursor = startDay + MS_PER_CALENDAR_DAY; cursor < endDay; cursor += MS_PER_CALENDAR_DAY) {
    if (isWeekday(new Date(cursor))) total += 1;
  }

  return total;
}

function weekLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function hasLabel(issue: JiraIssue, label: string): boolean {
  const needle = label.toLowerCase();
  return (issue.fields.labels ?? []).some((value) => value.toLowerCase() === needle);
}

export async function computeMetrics(org: Organization): Promise<PortalMetrics> {
  const clientLabel = org.jira_component_name;
  if (!clientLabel) {
    return emptyMetrics();
  }

  const jql = `${clientScopeJql(clientLabel, org.jira_project_key)} ORDER BY updated DESC`;
  const result = await searchIssues(jql, 100);
  const issues = parentIssuesOnly(result.issues ?? []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const open = issues.filter((i) => i.fields.status?.statusCategory?.key !== "done");
  const closedThisMonth = issues.filter((i) => {
    const resolved = i.fields.resolutiondate;
    return resolved && new Date(resolved) >= monthStart;
  });

  const closeTimes = closedThisMonth
    .filter((i) => !hasLabel(i, PORTAL_EXCLUDE_CLOSE_METRIC_LABEL))
    .filter((i) => i.fields.created && i.fields.resolutiondate)
    .map((i) => fractionalBusinessDaysBetween(i.fields.created!, i.fields.resolutiondate!))
    .filter((d) => d >= 0);
  const avgTimeToCloseDays =
    closeTimes.length > 0
      ? Math.round((closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) * 10) / 10
      : 0;

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

  return {
    openTickets: open.length,
    closedThisMonth: closedThisMonth.length,
    avgTimeToCloseDays,
    oldestOpen,
    byType,
    byStatus,
    throughput,
  };
}

function emptyMetrics(): PortalMetrics {
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

async function getClientBacklogItems(org: Organization) {
  if (!org.jira_component_name) return [];

  const boardId = resolvePortalBoardId(org);
  const clientJql = clientScopeJql(org.jira_component_name, org.jira_project_key);
  const [backlogResult, clientScope] = await Promise.all([
    getBacklogIssues(boardId, 0, 100),
    searchIssues(`${clientJql} ORDER BY updated DESC`, 100),
  ]);

  const clientKeys = new Set(
    parentIssuesOnly(clientScope.issues ?? []).map((i) => i.key)
  );

  return parentIssuesOnly(backlogResult.issues ?? [])
    .filter((i) => clientKeys.has(i.key) && !isSubtaskIssue(i))
    .map(serializeIssue);
}

export async function getClientBacklogKeys(org: Organization): Promise<string[]> {
  const items = await getClientBacklogItems(org);
  return items.map((item) => item.key);
}

export async function getPaginatedBacklog(
  org: Organization,
  page: number,
  pageSize: number
) {
  const allBacklog = await getClientBacklogItems(org);
  const total = allBacklog.length;
  const start = (page - 1) * pageSize;
  const backlog = allBacklog.slice(start, start + pageSize);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return {
    backlog,
    total,
    page,
    pageSize,
    totalPages,
    leadingKey: start > 0 ? allBacklog[start - 1].key : null,
    trailingKey:
      start + backlog.length < total ? allBacklog[start + backlog.length].key : null,
  };
}

export async function getBacklogSections(org: Organization) {
  if (!org.jira_component_name) {
    return { backlog: [], readyForBls: [] };
  }

  const boardId = resolvePortalBoardId(org);
  const clientJql = clientScopeJql(org.jira_component_name);
  const [backlog, boardResult, clientScope] = await Promise.all([
    getClientBacklogItems(org),
    getBoardIssues(boardId, 0, 100),
    searchIssues(`${clientJql} ORDER BY updated DESC`, 100),
  ]);

  const clientKeys = new Set(
    parentIssuesOnly(clientScope.issues ?? []).map((i) => i.key)
  );
  const isClientIssue = (issue: JiraIssue) =>
    clientKeys.has(issue.key) && !isSubtaskIssue(issue);

  const backlogKeys = new Set(backlog.map((i) => i.key));

  const readyForBls = parentIssuesOnly(boardResult.issues ?? []).filter(
    (i: JiraIssue) =>
      isClientIssue(i) &&
      !backlogKeys.has(i.key) &&
      (i.fields.status?.name === "To Do" ||
        i.fields.status?.statusCategory?.key === "new")
  );

  return {
    backlog,
    readyForBls: readyForBls.map(serializeIssue),
  };
}

export async function validateOrgIssue(org: Organization, issueKey: string) {
  if (!org.jira_component_name) return false;

  const issue = await getIssue(issueKey);
  if (isSubtaskIssue(issue)) return false;

  const labels = issue.fields.labels ?? [];
  return labels.some(
    (value) => value.toLowerCase() === org.jira_component_name!.toLowerCase()
  );
}
