import {
  createComponent,
  createFilter,
  createKanbanBoard,
  JiraApiError,
} from "@/lib/jira/client";

export interface ProvisionOrgResult {
  componentId: string;
  componentName: string;
  boardId: string;
  filterId: string;
}

export async function provisionJiraForOrg(
  orgName: string,
  slug: string
): Promise<ProvisionOrgResult> {
  const componentName = `client-${slug}`;
  const component = await createComponent(componentName);

  const jql = `project = KAN AND component = "${component.name}" ORDER BY rank ASC`;
  const filter = await createFilter(`Portal — ${orgName}`, jql);
  const board = await createKanbanBoard(`Portal — ${orgName}`, Number(filter.id));

  return {
    componentId: component.id,
    componentName: component.name,
    boardId: String(board.id),
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
