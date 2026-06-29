import { activeBusinessDaysToCloseFromTransitions } from "@/lib/portal/close-time";
import type { PortalMetrics } from "@/lib/portal/metrics";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  JiraIssueRow,
  JiraStatusTransitionRow,
  Organization,
} from "@/lib/supabase/database.types";

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function weekLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
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

export async function computeMetricsFromDb(org: Organization): Promise<PortalMetrics> {
  if (!org.jira_component_name) return emptyMetrics();

  const supabase = createServiceClient();
  const { data: issues, error } = await supabase
    .from("jira_issues")
    .select("*")
    .eq("organization_id", org.id)
    .is("parent_jira_key", null)
    .neq("sync_status", "pending_create")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const rows = (issues ?? []) as JiraIssueRow[];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const open = rows.filter((issue) => issue.status_category !== "done");
  const closedThisMonth = rows.filter((issue) => {
    if (!issue.resolved_at) return false;
    return new Date(issue.resolved_at) >= monthStart;
  });

  const closeMetricIssues = closedThisMonth.filter(
    (issue) => !issue.exclude_from_close_metric && issue.created_at && issue.resolved_at
  );

  const closeTimes: number[] = [];
  for (const issue of closeMetricIssues) {
    const { data: transitions } = await supabase
      .from("jira_status_transitions")
      .select("*")
      .eq("issue_id", issue.id)
      .order("transitioned_at", { ascending: true });

    const days = activeBusinessDaysToCloseFromTransitions(
      issue.created_at,
      issue.resolved_at!,
      (transitions ?? []) as JiraStatusTransitionRow[]
    );
    if (days >= 0) closeTimes.push(days);
  }

  const avgTimeToCloseDays =
    closeTimes.length > 0
      ? Math.round((closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) * 10) / 10
      : 0;

  let oldestOpen: PortalMetrics["oldestOpen"] = null;
  for (const issue of open) {
    const ageDays = daysSince(issue.created_at);
    if (!oldestOpen || ageDays > oldestOpen.ageDays) {
      oldestOpen = {
        key: issue.jira_key ?? issue.id,
        summary: issue.summary,
        ageDays,
      };
    }
  }

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const issue of rows) {
    byType[issue.issue_type] = (byType[issue.issue_type] ?? 0) + 1;
    byStatus[issue.status] = (byStatus[issue.status] ?? 0) + 1;
  }

  const throughput: PortalMetrics["throughput"] = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const label = weekLabel(weekStart);

    const created = rows.filter((issue) => {
      const d = new Date(issue.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;

    const resolved = rows.filter((issue) => {
      if (!issue.resolved_at) return false;
      const d = new Date(issue.resolved_at);
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

export async function persistMetricsForOrganizationId(
  organizationId: string
): Promise<PortalMetrics | null> {
  const supabase = createServiceClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!org) return null;

  return persistOrgMetrics(org as Organization);
}

export async function persistOrgMetrics(org: Organization): Promise<PortalMetrics> {
  const metrics = await computeMetricsFromDb(org);
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  await supabase.from("organization_metrics").upsert({
    organization_id: org.id,
    computed_at: now,
    open_tickets: metrics.openTickets,
    closed_this_month: metrics.closedThisMonth,
    avg_time_to_close_days: metrics.avgTimeToCloseDays,
    oldest_open: metrics.oldestOpen,
    by_type: metrics.byType,
    by_status: metrics.byStatus,
    throughput: metrics.throughput,
  });

  await supabase
    .from("organizations")
    .update({ metrics_computed_at: now })
    .eq("id", org.id);

  return metrics;
}

export async function computeAllOrgMetrics(): Promise<number> {
  const supabase = createServiceClient();
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "active")
    .not("jira_component_name", "is", null);

  if (error) throw error;

  for (const org of (orgs ?? []) as Organization[]) {
    await persistOrgMetrics(org);
  }

  return (orgs ?? []).length;
}

export function metricsRowToPortalMetrics(
  row: import("@/lib/supabase/database.types").OrganizationMetricsRow
): PortalMetrics {
  return {
    openTickets: row.open_tickets,
    closedThisMonth: row.closed_this_month,
    avgTimeToCloseDays: Number(row.avg_time_to_close_days),
    oldestOpen: row.oldest_open,
    byType: row.by_type,
    byStatus: row.by_status,
    throughput: row.throughput,
  };
}
