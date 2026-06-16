const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY ?? "KAN";

export const JIRA_CLIENT_FIELD_ID =
  process.env.JIRA_CLIENT_FIELD_ID ?? "customfield_10073";

export const JIRA_CLIENT_FIELD_NAME = process.env.JIRA_CLIENT_FIELD_NAME ?? "Client";

export function clientLabelForSlug(slug: string): string {
  return `client-${slug}`;
}

export function clientScopeJql(
  clientLabel: string,
  projectKey = JIRA_PROJECT_KEY
): string {
  return `project = ${projectKey} AND "${JIRA_CLIENT_FIELD_NAME}" = "${clientLabel}"`;
}
