import { OUTREACH_SHEET_NAME } from "@/lib/outreach/sheet-schema";
import {
  OUTREACH_SPREADSHEET_ID,
  OUTREACH_SPREADSHEET_URL,
} from "@/lib/outreach/sheet-config";

export type OutreachRunOptions = {
  count?: number;
  niche?: string;
  mode?: "research" | "summary";
};

export const OUTREACH_SKILL_INVOCATION = "/cold-outreach";

export function buildOutreachChatPrompt(options: OutreachRunOptions = {}): string {
  const count = options.count ?? 10;
  const niche = options.niche?.trim();
  const mode = options.mode ?? "research";

  if (mode === "summary") {
    return `${OUTREACH_SKILL_INVOCATION} Summarize all draft_ready rows in the BLS outreach sheet (${OUTREACH_SHEET_NAME}). Include company, contact, title, icp_score, pain_hypothesis, and email subject preview. Remind me to send manually.`;
  }

  const nicheClause = niche
    ? ` Focus on: ${niche}.`
    : " Default ICP: US/UK/Canada mid-market, Salesforce or RevOps buyers.";

  return `${OUTREACH_SKILL_INVOCATION} Run a full prospecting batch: research ${count} NEW BLS ICP prospects.${nicheClause} Dedup against the outreach sheet and data/outreach/do-not-contact.json. Append rows to tab "${OUTREACH_SHEET_NAME}" (spreadsheet ${OUTREACH_SPREADSHEET_ID}) with email_subject, email_body, linkedin_connection_note, and linkedin_dm. Set email_status and linkedin_status to draft_ready only. Summarize new rows in a table. NEVER send email or LinkedIn messages.`;
}

export function buildOutreachRunBundle(options: OutreachRunOptions = {}) {
  const chatPrompt = buildOutreachChatPrompt(options);

  return {
    generatedAt: new Date().toISOString(),
    skill: "cold-outreach",
    skillPath: ".cursor/skills/cold-outreach/SKILL.md",
    spreadsheetId: OUTREACH_SPREADSHEET_ID,
    spreadsheetUrl: OUTREACH_SPREADSHEET_URL,
    sheetTab: OUTREACH_SHEET_NAME,
    options: {
      count: options.count ?? 10,
      niche: options.niche ?? null,
      mode: options.mode ?? "research",
    },
    chatPrompt,
    instructions: [
      "Paste chatPrompt into a new Cursor chat (Agents window).",
      "Ensure mcp-google is connected for Sheet read/append.",
      "Review drafts in the Sheet; send all outreach manually.",
    ],
  };
}
