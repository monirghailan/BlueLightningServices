/**
 * Backfill Jira mirror tables for all organizations with a client label.
 *
 * Usage: npx tsx scripts/backfill-jira-mirror.ts
 * Requires: JIRA_* env vars, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
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

async function main() {
  loadEnvLocal();
  const { createServiceClient } = await import("../lib/supabase/server");
  const { backfillOrg } = await import("../lib/jira/sync/reconcile-org");
  const { persistOrgMetrics } = await import("../lib/jira/sync/compute-metrics-db");

  const supabase = createServiceClient();
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("*")
    .not("jira_component_name", "is", null);

  if (error) {
    console.error("Failed to load organizations:", error.message);
    process.exit(1);
  }

  if (!orgs?.length) {
    console.log("No organizations with Jira labels found.");
    return;
  }

  for (const org of orgs as Organization[]) {
    console.log(`Backfilling ${org.name} (${org.jira_component_name})…`);
    try {
      const synced = await backfillOrg(org);
      console.log(`  Synced ${synced} issues`);
      await persistOrgMetrics(org);
      console.log(`  Metrics computed`);
    } catch (err) {
      console.error(`  Failed:`, err);
    }
  }

  console.log("Backfill complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
