/**
 * Compare DB metrics vs live Jira metrics for shadow verification.
 *
 * Usage: npx tsx scripts/verify-jira-metrics.ts [org-slug]
 */

import { readFileSync } from "fs";
import type { Organization } from "../lib/supabase/database.types";

function loadEnvLocal() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local optional when env is already set
  }
}

async function computeLiveMetrics(org: Organization) {
  const { searchIssues, getIssueChangelog, parentIssuesOnly } =
    await import("../lib/jira/client");
  const { clientScopeJql } = await import("../lib/jira/client-field");
  const { activeBusinessDaysToClose } = await import("../lib/portal/close-time");
  const { PORTAL_EXCLUDE_CLOSE_METRIC_LABEL } = await import("../lib/portal/metrics");

  if (!org.jira_component_name) return null;

  const jql = `${clientScopeJql(org.jira_component_name, org.jira_project_key)} ORDER BY updated DESC`;
  const result = await searchIssues(jql, 100);
  const issues = parentIssuesOnly(result.issues ?? []);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const open = issues.filter((i) => i.fields.status?.statusCategory?.key !== "done");
  const closedThisMonth = issues.filter((i) => {
    const resolved = i.fields.resolutiondate;
    return resolved && new Date(resolved) >= monthStart;
  });

  const closeMetricIssues = closedThisMonth
    .filter(
      (i) =>
        !(i.fields.labels ?? []).some(
          (l) => l.toLowerCase() === PORTAL_EXCLUDE_CLOSE_METRIC_LABEL.toLowerCase()
        )
    )
    .filter((i) => i.fields.created && i.fields.resolutiondate);

  const closeTimes = (
    await Promise.all(
      closeMetricIssues.map(async (issue) => {
        const changelog = await getIssueChangelog(issue.key);
        return activeBusinessDaysToClose(
          issue.fields.created!,
          issue.fields.resolutiondate!,
          changelog
        );
      })
    )
  ).filter((d) => d >= 0);

  const avgTimeToCloseDays =
    closeTimes.length > 0
      ? Math.round((closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) * 10) / 10
      : 0;

  return {
    openTickets: open.length,
    closedThisMonth: closedThisMonth.length,
    avgTimeToCloseDays,
    source: "jira-live",
  };
}

async function main() {
  loadEnvLocal();
  const slug = process.argv[2];
  const { createServiceClient } = await import("../lib/supabase/server");
  const { computeMetricsFromDb } = await import("../lib/jira/sync/compute-metrics-db");

  const supabase = createServiceClient();
  let query = supabase.from("organizations").select("*").not("jira_component_name", "is", null);
  if (slug) query = query.eq("slug", slug);

  const { data: orgs, error } = await query;
  if (error || !orgs?.length) {
    console.error("No organizations found.");
    process.exit(1);
  }

  for (const org of orgs as Organization[]) {
    console.log(`\n${org.name} (${org.slug})`);
    const dbMetrics = await computeMetricsFromDb(org);
    const liveMetrics = await computeLiveMetrics(org);

    console.log("  DB:  ", {
      open: dbMetrics.openTickets,
      closedThisMonth: dbMetrics.closedThisMonth,
      avgClose: dbMetrics.avgTimeToCloseDays,
    });
    console.log("  Live:", liveMetrics);

    if (liveMetrics) {
      const match =
        dbMetrics.openTickets === liveMetrics.openTickets &&
        dbMetrics.closedThisMonth === liveMetrics.closedThisMonth;
      console.log(match ? "  ✓ Counts match" : "  ✗ Count mismatch — run backfill or wait for reconcile");
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
