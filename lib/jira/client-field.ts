export const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY ?? "KAN";

export function clientLabelForSlug(slug: string): string {
  return `client-${slug}`;
}

function escapeJqlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function clientScopeJql(
  clientLabel: string,
  projectKey = JIRA_PROJECT_KEY
): string {
  const label = escapeJqlString(clientLabel);
  return `project = ${projectKey} AND labels = "${label}" AND parent IS EMPTY`;
}
