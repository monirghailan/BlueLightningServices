/**
 * Google Sheet CRM schema for cold outreach prospects.
 * Sheet name: "BLS Outreach Prospects" (see docs/outreach-setup.md).
 */

export const OUTREACH_SHEET_NAME = "BLS Outreach Prospects";
export const DNC_SHEET_NAME = "Do Not Contact";

/** Header row — order matters for CSV import and MCP appendRows. */
export const OUTREACH_COLUMNS = [
  "id",
  "discovered_at",
  "company",
  "domain",
  "contact_name",
  "title",
  "email",
  "linkedin_url",
  "source",
  "icp_score",
  "pain_hypothesis",
  "email_subject",
  "email_body",
  "linkedin_connection_note",
  "linkedin_dm",
  "email_status",
  "linkedin_status",
  "last_touch",
  "notes",
] as const;

export type OutreachColumn = (typeof OUTREACH_COLUMNS)[number];

export type OutreachEmailStatus =
  | "draft_ready"
  | "sent"
  | "replied"
  | "no_response"
  | "opted_out";

export type OutreachLinkedInStatus =
  | "draft_ready"
  | "connected"
  | "messaged"
  | "replied";

export const OUTREACH_EMAIL_STATUSES: OutreachEmailStatus[] = [
  "draft_ready",
  "sent",
  "replied",
  "no_response",
  "opted_out",
];

export const OUTREACH_LINKEDIN_STATUSES: OutreachLinkedInStatus[] = [
  "draft_ready",
  "connected",
  "messaged",
  "replied",
];

/** Columns the agent may set on new rows. Never set sent/messaged statuses. */
export const AGENT_WRITABLE_STATUSES = {
  email_status: "draft_ready" as const,
  linkedin_status: "draft_ready" as const,
};

/** Statuses only the user sets after manual outreach. */
export const USER_ONLY_EMAIL_STATUSES: OutreachEmailStatus[] = [
  "sent",
  "replied",
  "no_response",
  "opted_out",
];

export const USER_ONLY_LINKEDIN_STATUSES: OutreachLinkedInStatus[] = [
  "connected",
  "messaged",
  "replied",
];

export const DNC_COLUMNS = ["domain", "email", "company", "reason", "added_at"] as const;

export type ProspectRow = Record<OutreachColumn, string>;

export function emptyProspectRow(partial: Partial<ProspectRow> = {}): ProspectRow {
  const row = Object.fromEntries(
    OUTREACH_COLUMNS.map((col) => [col, ""])
  ) as ProspectRow;

  return {
    ...row,
    discovered_at: new Date().toISOString(),
    email_status: AGENT_WRITABLE_STATUSES.email_status,
    linkedin_status: AGENT_WRITABLE_STATUSES.linkedin_status,
    ...partial,
  };
}

export function prospectRowsToSheetValues(rows: ProspectRow[]): string[][] {
  return rows.map((row) => OUTREACH_COLUMNS.map((col) => row[col] ?? ""));
}

export function headerRow(): string[] {
  return [...OUTREACH_COLUMNS];
}
