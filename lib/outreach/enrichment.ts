/**
 * Browser-first contact enrichment — no paid API required.
 * The Cursor agent uses Browser MCP + public web sources; user verifies emails before sending.
 */

export const ENRICHMENT_TIER = "browser-only" as const;

export type EnrichmentTier = typeof ENRICHMENT_TIER | "apollo-csv" | "clay-csv";

export const ENRICHMENT_SOURCES = [
  {
    id: "company-about",
    label: "Company About / Team page",
    method: "Browser MCP — look for leadership and ops titles",
  },
  {
    id: "careers",
    label: "Careers / Jobs page",
    method: "Signals Salesforce hiring; may name hiring manager or team",
  },
  {
    id: "press-news",
    label: "Press / news",
    method: "Funding, CRM migration, leadership changes",
  },
  {
    id: "email-pattern",
    label: "Email pattern guess",
    method: "first.last@domain or first@domain — mark as unverified in notes",
  },
] as const;

/** Common B2B email patterns to try when no public email is found. */
export function guessEmailPatterns(
  firstName: string,
  lastName: string,
  domain: string
): string[] {
  const first = firstName.trim().toLowerCase().replace(/[^a-z]/g, "");
  const last = lastName.trim().toLowerCase().replace(/[^a-z]/g, "");
  const d = domain.trim().toLowerCase().replace(/^www\./, "");

  if (!first || !d) return [];

  const patterns: string[] = [`${first}@${d}`];

  if (last) {
    patterns.push(
      `${first}.${last}@${d}`,
      `${first}${last}@${d}`,
      `${first[0]}${last}@${d}`,
      `${first}_${last}@${d}`
    );
  }

  return [...new Set(patterns)];
}

export type EnrichmentResult = {
  contact_name: string;
  title: string;
  email: string;
  linkedin_url: string;
  source: string;
  notes: string;
};

/**
 * Guidance string for the cold-outreach skill / automation prompt.
 */
export function buildEnrichmentAgentContext(): string {
  return `## Enrichment tier: ${ENRICHMENT_TIER}

Use Browser MCP and public web sources only. Do not scrape LinkedIn at scale.

Sources (in priority order):
${ENRICHMENT_SOURCES.map((s) => `- **${s.label}:** ${s.method}`).join("\n")}

When email is not public:
1. Use guessEmailPatterns from lib/outreach/enrichment.ts
2. Put the best guess in \`email\` and add "email unverified" to \`notes\`
3. User verifies before sending manually

For Apollo.io or Clay exports, user runs:
  npm run outreach:import-csv -- path/to/export.csv

LinkedIn URL: only include if found on company site or user provided. Do not automate LinkedIn profile scraping.`;
}
