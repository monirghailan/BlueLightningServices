/** Legacy tickets without reliable In Review history — omit from close-time KPI. */
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
