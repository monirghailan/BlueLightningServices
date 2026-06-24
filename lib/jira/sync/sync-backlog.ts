import { getBacklogIssues, parentIssuesOnly, searchIssues } from "@/lib/jira/client";
import { resolvePortalBoardId } from "@/lib/jira/board";
import { clientScopeJql } from "@/lib/jira/client-field";
import { createServiceClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/supabase/database.types";

export async function syncBacklogForOrg(org: Organization): Promise<void> {
  if (!org.jira_component_name) return;

  const boardId = resolvePortalBoardId(org);
  const supabase = createServiceClient();

  const clientJql = clientScopeJql(org.jira_component_name, org.jira_project_key);
  const [backlogResult, clientScope] = await Promise.all([
    getBacklogIssues(boardId, 0, 100),
    searchIssues(`${clientJql} ORDER BY updated DESC`, 100),
  ]);

  const clientKeys = new Set(
    parentIssuesOnly(clientScope.issues ?? []).map((issue) => issue.key)
  );

  const backlogIssues = parentIssuesOnly(backlogResult.issues ?? []).filter((issue) =>
    clientKeys.has(issue.key)
  );

  await supabase
    .from("jira_issues")
    .update({ is_in_backlog: false, backlog_rank: null })
    .eq("organization_id", org.id);

  for (let index = 0; index < backlogIssues.length; index++) {
    const issue = backlogIssues[index];
    await supabase
      .from("jira_issues")
      .update({ is_in_backlog: true, backlog_rank: index })
      .eq("organization_id", org.id)
      .eq("jira_key", issue.key);
  }
}
