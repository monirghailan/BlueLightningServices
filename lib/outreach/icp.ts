import { site } from "@/lib/content";

/** Ideal titles for cold outreach (Salesforce / RevOps buyers). */
export const ICP_TARGET_TITLES = [
  "Salesforce Administrator",
  "Salesforce Admin",
  "Senior Salesforce Administrator",
  "RevOps Manager",
  "Revenue Operations Manager",
  "Director of Revenue Operations",
  "VP Revenue Operations",
  "VP Sales Operations",
  "Director of Sales Operations",
  "Head of Business Systems",
  "CRM Manager",
  "IT Director",
  "Director of IT",
  "CTO",
  "VP Engineering",
  "COO",
] as const;

export type IcpTargetTitle = (typeof ICP_TARGET_TITLES)[number];

/** Company size sweet spot for BLS managed Salesforce services. */
export const ICP_COMPANY_SIZE = {
  minEmployees: 50,
  maxEmployees: 2000,
  description: "Mid-market (~50–2,000 employees)",
} as const;

/** Primary geographies unless the user specifies a vertical/niche run. */
export const ICP_GEOGRAPHIES = ["United States", "United Kingdom", "Canada"] as const;

/**
 * Signals that a company is a good outreach target.
 * Use at least one when scoring `icp_score`.
 */
export const ICP_POSITIVE_SIGNALS = [
  "Active Salesforce job posting (admin, developer, or RevOps)",
  "Small or no dedicated Salesforce team (1–2 admins for whole org)",
  "Signs of org debt (legacy Apex, heavy Flow sprawl, integration issues)",
  "Recent CRM migration or Salesforce implementation",
  "Growing revenue team without matching CRM ops capacity",
  "Public mention of Salesforce challenges or backlog",
] as const;

export type IcpPositiveSignal = (typeof ICP_POSITIVE_SIGNALS)[number];

/** Hard exclusions — never add these prospects. */
export const ICP_EXCLUSION_RULES = [
  "Existing BLS clients (Jira labels client-* or bls-org-docs slugs)",
  "Inbound website leads already in Supabase leads table",
  "Direct Salesforce consulting competitors",
  "Contacts on the do-not-contact list (data/outreach/do-not-contact.json)",
  "Free-email-only contacts with no verifiable company domain",
  "Companies clearly below 50 employees with no Salesforce investment",
] as const;

/** BLS site pages to link in outreach copy by pain theme. */
export const ICP_PAGE_PATHS = {
  general: "/",
  portal: "/portal",
  pricing: "/pricing",
  services: "/#services",
} as const;

export const OUTREACH_MESSAGING_RULES = `Write for Blue Lightning Services (${site.url}) — a managed Salesforce engineering partner.

Tone: direct, expert, confident but not salesy. One pain point per message — never stack problems.

Structure: one sharp pain → one consequence → one way BLS helps → single CTA (${site.url} or a relevant page path).

Lead with function ownership and backlog/release outcomes; avoid "replace your team" language.

Never name existing clients, client industries tied to one customer, internal ticket keys, sandbox URLs, or Salesforce record IDs.

Sign off with a real sender name only when the user provides one; otherwise use "Blue Lightning Services team".`;

/** Agent-readable ICP summary for skills and automations. */
export function buildIcpAgentContext(): string {
  return `## BLS outreach ICP

**Target titles:** ${ICP_TARGET_TITLES.slice(0, 8).join(", ")}, and similar RevOps / CRM / IT leadership roles.

**Company size:** ${ICP_COMPANY_SIZE.description}

**Geographies:** ${ICP_GEOGRAPHIES.join(", ")}

**Positive signals:**
${ICP_POSITIVE_SIGNALS.map((s) => `- ${s}`).join("\n")}

**Exclusions:**
${ICP_EXCLUSION_RULES.map((r) => `- ${r}`).join("\n")}

**Messaging:**
${OUTREACH_MESSAGING_RULES}`;
}
