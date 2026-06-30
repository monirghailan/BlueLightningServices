import { site } from "@/lib/content";
import { ICP_PAGE_PATHS, OUTREACH_MESSAGING_RULES } from "@/lib/outreach/icp";
import { REDACTION_SYSTEM_HINT } from "@/lib/linkedin-pipeline/redact";

export type OutreachDraftInput = {
  contactFirstName: string;
  company: string;
  title?: string;
  painHypothesis: string;
  pagePath?: string;
  senderName?: string;
  signal?: string;
};

export type OutreachDrafts = {
  email_subject: string;
  email_body: string;
  linkedin_connection_note: string;
  linkedin_dm: string;
};

const DEFAULT_SENDER = "Blue Lightning Services";

function firstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? "there";
}

function ctaUrl(pagePath: string = ICP_PAGE_PATHS.general): string {
  const path = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  return `${site.url}${path === "/" ? "" : path}`;
}

/**
 * Scaffold drafts — the agent should personalize `painHypothesis` and `signal`
 * before returning final copy. These are starting points, not mail-merge spam.
 */
export function buildOutreachDrafts(input: OutreachDraftInput): OutreachDrafts {
  const fn = firstName(input.contactFirstName);
  const company = input.company.trim();
  const sender = input.senderName?.trim() || DEFAULT_SENDER;
  const pagePath = input.pagePath ?? ICP_PAGE_PATHS.general;
  const url = ctaUrl(pagePath);
  const pain = input.painHypothesis.trim();
  const signal = input.signal?.trim();

  const signalLine = signal
    ? `I noticed ${signal} — `
    : "";

  const email_subject = `${company} + Salesforce backlog`;

  const email_body = `Hi ${fn},

${signalLine}teams your size often hit a wall when Salesforce backlog outpaces a small admin team — ${pain}

We help mid-market companies ship on a fixed cadence without adding headcount. Worth a 15-minute chat?

${url}

Best,
${sender}
Blue Lightning Services`;

  const linkedin_connection_note = truncateLinkedInNote(
    `Hi ${fn} — ${pain.split(".")[0]}. We help mid-market teams clear Salesforce backlog without extra headcount. Would love to connect.`
  );

  const linkedin_dm = `Thanks for connecting, ${fn}.

${pain}

We run managed Salesforce engineering for mid-market teams — weekly releases, zero drama handoffs. Happy to share how we've helped similar orgs if useful.

${url}`;

  return {
    email_subject,
    email_body,
    linkedin_connection_note,
    linkedin_dm,
  };
}

/** LinkedIn connection notes must be ≤300 characters. */
export function truncateLinkedInNote(note: string, max = 300): string {
  const trimmed = note.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function buildFollowUpDraft(input: OutreachDraftInput): Pick<OutreachDrafts, "email_subject" | "email_body"> {
  const fn = firstName(input.contactFirstName);
  const company = input.company.trim();
  const sender = input.senderName?.trim() || DEFAULT_SENDER;
  const url = ctaUrl(input.pagePath);

  return {
    email_subject: `Re: ${company} + Salesforce backlog`,
    email_body: `Hi ${fn},

Quick follow-up — still seeing ${input.painHypothesis.toLowerCase()} come up for teams like ${company}.

If timing's better now, happy to walk through how we operate: fixed cadence, managed pod, no hiring overhead.

${url}

Best,
${sender}
Blue Lightning Services`,
  };
}

/** Instructions for the Cursor agent when writing or redrafting outreach copy. */
export const OUTREACH_COPY_INSTRUCTIONS = `${OUTREACH_MESSAGING_RULES}

${REDACTION_SYSTEM_HINT}

Email:
- Plain text only, 80–120 words for initial outreach
- One pain point, one CTA link
- Subject line: specific to company or pain, not generic "Quick question"

LinkedIn connection note:
- Max 300 characters (use truncateLinkedInNote)
- No hard sell — reason to connect only

LinkedIn DM (after connect):
- 60–100 words, reference the same single pain point
- Offer value, not a calendar link unless user requests it`;

export function validateLinkedInConnectionNote(note: string): {
  valid: boolean;
  length: number;
  message?: string;
} {
  const length = note.trim().length;
  if (length === 0) {
    return { valid: false, length, message: "Connection note is empty" };
  }
  if (length > 300) {
    return {
      valid: false,
      length,
      message: `Connection note is ${length} chars (max 300)`,
    };
  }
  return { valid: true, length };
}
