/**
 * Import Apollo.io or Clay CSV exports into outreach sheet-ready rows.
 *
 * Usage:
 *   npm run outreach:import-csv -- path/to/export.csv
 *   npm run outreach:import-csv -- path/to/export.csv --stdout
 *
 * Map common export column names automatically. Output is CSV with OUTREACH_COLUMNS headers
 * for paste into Google Sheets or Google MCP appendRows.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import {
  OUTREACH_COLUMNS,
  emptyProspectRow,
  prospectRowsToSheetValues,
  headerRow,
  type ProspectRow,
} from "@/lib/outreach/sheet-schema";
import { filterBlockedProspects } from "@/lib/outreach/do-not-contact";
import { buildOutreachDrafts } from "@/lib/outreach/email-templates";

const COLUMN_ALIASES: Record<string, keyof ProspectRow | "first_name" | "last_name"> = {
  company: "company",
  company_name: "company",
  organization: "company",
  account_name: "company",
  domain: "domain",
  website: "domain",
  company_domain: "domain",
  first_name: "first_name",
  last_name: "last_name",
  name: "contact_name",
  full_name: "contact_name",
  contact_name: "contact_name",
  title: "title",
  job_title: "title",
  email: "email",
  work_email: "email",
  linkedin_url: "linkedin_url",
  person_linkedin_url: "linkedin_url",
  linkedin: "linkedin_url",
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((c) => c.trim())) rows.push(row);
  }

  return rows;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function domainFromWebsite(website: string): string {
  return website
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0] ?? "";
}

function mapCsvRow(
  headers: string[],
  values: string[],
  rowIndex: number
): ProspectRow | null {
  const raw: Record<string, string> = {};
  headers.forEach((h, i) => {
    raw[h] = values[i]?.trim() ?? "";
  });

  const mapped: Record<string, string> = {};
  let firstName = "";
  let lastName = "";

  for (const [header, value] of Object.entries(raw)) {
    const key = COLUMN_ALIASES[normalizeHeader(header)];
    if (!key || !value) continue;
    if (key === "first_name") firstName = value;
    else if (key === "last_name") lastName = value;
    else mapped[key] = value;
  }

  if (!mapped.contact_name && (firstName || lastName)) {
    mapped.contact_name = [firstName, lastName].filter(Boolean).join(" ");
  }

  if (!mapped.company && !mapped.email) return null;

  if (mapped.domain && mapped.domain.includes(".")) {
    mapped.domain = domainFromWebsite(mapped.domain);
  }

  const pain =
    mapped.pain_hypothesis ||
    "Salesforce backlog outpaces a small admin team";

  const drafts = buildOutreachDrafts({
    contactFirstName: mapped.contact_name?.split(/\s+/)[0] ?? "there",
    company: mapped.company || mapped.domain || "your company",
    title: mapped.title,
    painHypothesis: pain,
  });

  const row = emptyProspectRow({
    id: `import-${rowIndex}-${Date.now()}`,
    company: mapped.company ?? "",
    domain: mapped.domain ?? "",
    contact_name: mapped.contact_name ?? "",
    title: mapped.title ?? "",
    email: mapped.email ?? "",
    linkedin_url: mapped.linkedin_url ?? "",
    source: "apollo-csv",
    icp_score: "7",
    pain_hypothesis: pain,
    email_subject: drafts.email_subject,
    email_body: drafts.email_body,
    linkedin_connection_note: drafts.linkedin_connection_note,
    linkedin_dm: drafts.linkedin_dm,
    notes: mapped.email ? "" : "email missing — enrich before outreach",
  });

  return row;
}

function rowsToCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell ?? "";
          if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(",")
    )
    .join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith("--"));
  const stdout = args.includes("--stdout");

  if (!csvPath) {
    console.error("Usage: npm run outreach:import-csv -- <path/to/export.csv> [--stdout]");
    process.exit(1);
  }

  const text = readFileSync(csvPath, "utf8");
  const parsed = parseCsv(text);
  if (parsed.length < 2) {
    console.error("CSV must have a header row and at least one data row.");
    process.exit(1);
  }

  const headers = parsed[0]!.map(normalizeHeader);
  const prospects: ProspectRow[] = [];

  for (let i = 1; i < parsed.length; i++) {
    const row = mapCsvRow(headers, parsed[i]!, i);
    if (row) prospects.push(row);
  }

  const allowedRows: ProspectRow[] = [];
  const blocked: Array<ProspectRow & { blockReason: string }> = [];

  for (const prospect of prospects) {
    const result = filterBlockedProspects([prospect]);
    if (result.blocked.length > 0) {
      blocked.push({ ...prospect, blockReason: result.blocked[0]!.blockReason });
    } else {
      allowedRows.push(prospect);
    }
  }

  const sheetRows = [headerRow(), ...prospectRowsToSheetValues(allowedRows)];
  const output = rowsToCsv(sheetRows);

  if (stdout) {
    process.stdout.write(output);
  } else {
    const outPath = csvPath.replace(/\.csv$/i, "") + "-outreach-ready.csv";
    writeFileSync(outPath, output, "utf8");
    console.log(`Wrote ${allowedRows.length} rows to ${outPath}`);
  }

  if (blocked.length) {
    console.warn(`Skipped ${blocked.length} blocked row(s) (do-not-contact list).`);
  }

  console.log(`Source: ${basename(csvPath)} | Imported: ${allowedRows.length} | Blocked: ${blocked.length}`);
}

main();
