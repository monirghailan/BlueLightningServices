import { getIssueChangelog, parentIssuesOnly, searchIssues } from "@/lib/jira/client";
import { clientScopeJql } from "@/lib/jira/client-field";
import { upsertIssueFromJira } from "@/lib/jira/sync/upsert-issue";
import { syncBacklogForOrg } from "@/lib/jira/sync/sync-backlog";
import { createServiceClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/supabase/database.types";

export async function reconcileOrg(org: Organization, full = false): Promise<number> {
  if (!org.jira_component_name) return 0;

  const supabase = createServiceClient();
  let jql = clientScopeJql(org.jira_component_name, org.jira_project_key);

  if (!full && org.jira_last_synced_at) {
    const watermark = org.jira_last_synced_at.slice(0, 10);
    jql += ` AND updated >= "${watermark}"`;
  }

  jql += " ORDER BY updated DESC";

  const result = await searchIssues(jql, 100);
  const issues = parentIssuesOnly(result.issues ?? []);

  let synced = 0;
  for (const issue of issues) {
    const outcome = await upsertIssueFromJira(issue, org.id);
    if (outcome) synced++;
  }

  await syncBacklogForOrg(org);

  await supabase
    .from("organizations")
    .update({ jira_last_synced_at: new Date().toISOString() })
    .eq("id", org.id);

  return synced;
}

export async function backfillOrg(org: Organization): Promise<number> {
  if (!org.jira_component_name) return 0;

  const supabase = createServiceClient();
  const jql = `${clientScopeJql(org.jira_component_name, org.jira_project_key)} ORDER BY updated DESC`;

  let startAt = 0;
  const pageSize = 100;
  let totalSynced = 0;

  while (true) {
    const result = await searchIssues(jql, pageSize, startAt);
    const issues = parentIssuesOnly(result.issues ?? []);
    if (issues.length === 0) break;

    for (const issue of issues) {
      const outcome = await upsertIssueFromJira(issue, org.id);
      if (!outcome) continue;

      const changelog = await getIssueChangelog(issue.key);
      for (const history of changelog.histories) {
        for (const item of history.items) {
          if (item.field !== "status") continue;
          await supabase.from("jira_status_transitions").upsert(
            {
              issue_id: outcome.issueId,
              from_status: item.fromString ?? "",
              to_status: item.toString ?? "",
              transitioned_at: history.created,
            },
            { onConflict: "issue_id,transitioned_at,to_status", ignoreDuplicates: true }
          );
        }
      }
      totalSynced++;
    }

    if (issues.length < pageSize) break;
    startAt += pageSize;
  }

  await syncBacklogForOrg(org);

  await supabase
    .from("organizations")
    .update({ jira_last_synced_at: new Date().toISOString() })
    .eq("id", org.id);

  return totalSynced;
}

export async function reconcileAllOrgs(full = false): Promise<{ orgId: string; synced: number }[]> {
  const supabase = createServiceClient();
  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("status", "active")
    .not("jira_component_name", "is", null);

  if (error) throw error;

  const results: { orgId: string; synced: number }[] = [];
  for (const org of (orgs ?? []) as Organization[]) {
    const synced = await reconcileOrg(org, full);
    results.push({ orgId: org.id, synced });
  }

  return results;
}
