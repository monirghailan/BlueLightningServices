import { DASHBOARD_DEFAULT_PAGE_SIZE } from "@/lib/portal/dashboard-constants";
import {
  getOrgMetrics,
  getPaginatedBacklog,
  listTickets,
} from "@/lib/portal/jira-db";
import type { Organization } from "@/lib/supabase/database.types";

export async function getDashboardInitialData(org: Organization) {
  const [metrics, backlog, tickets] = await Promise.all([
    getOrgMetrics(org),
    getPaginatedBacklog(org, 1, DASHBOARD_DEFAULT_PAGE_SIZE),
    listTickets(org, {
      status: "open",
      page: 1,
      pageSize: DASHBOARD_DEFAULT_PAGE_SIZE,
    }),
  ]);

  return { metrics, backlog, tickets };
}
