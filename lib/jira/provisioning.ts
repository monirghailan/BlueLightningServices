import { getOrCreateFilter, JiraApiError } from "@/lib/jira/client";
import { sharedJiraBoardId } from "@/lib/jira/board";
import {
  clientLabelForSlug,
  clientScopeJql,
  JIRA_PROJECT_KEY,
} from "@/lib/jira/client-field";

export interface ProvisionOrgResult {
  clientLabel: string;
  boardId: string;
  filterId: string;
}

export async function provisionJiraForOrg(
  orgName: string,
  slug: string
): Promise<ProvisionOrgResult> {
  const clientLabel = clientLabelForSlug(slug);
  const jql = `${clientScopeJql(clientLabel)} ORDER BY rank ASC`;
  const filter = await getOrCreateFilter(`Portal — ${orgName} (${slug})`, jql, {
    shareWithProjectKey: JIRA_PROJECT_KEY,
  });

  return {
    clientLabel,
    boardId: sharedJiraBoardId(),
    filterId: filter.id,
  };
}

export function isJiraConfigured(): boolean {
  return Boolean(
    process.env.JIRA_EMAIL &&
      process.env.JIRA_API_TOKEN &&
      process.env.JIRA_BASE_URL
  );
}

export function formatJiraError(error: unknown): string {
  if (error instanceof JiraApiError) {
    return `${error.message}${error.body ? `: ${error.body.slice(0, 200)}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  return "Unknown Jira error";
}
