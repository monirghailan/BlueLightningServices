import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type DoNotContactEntry = {
  domain?: string;
  email?: string;
  company?: string;
  reason?: string;
  added_at?: string;
};

export type DoNotContactList = {
  entries: DoNotContactEntry[];
};

const DEFAULT_PATH = join(process.cwd(), "data/outreach/do-not-contact.json");

export function loadDoNotContactList(
  filePath: string = DEFAULT_PATH
): DoNotContactList {
  if (!existsSync(filePath)) {
    return { entries: [] };
  }

  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as DoNotContactList;

  if (!Array.isArray(parsed.entries)) {
    throw new Error(`Invalid do-not-contact file: ${filePath}`);
  }

  return parsed;
}

export function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0] ?? "";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isBlockedProspect(
  input: { domain?: string; email?: string; company?: string },
  list: DoNotContactList = loadDoNotContactList()
): { blocked: boolean; reason?: string } {
  const domain = input.domain ? normalizeDomain(input.domain) : "";
  const email = input.email ? normalizeEmail(input.email) : "";
  const company = input.company?.trim().toLowerCase() ?? "";

  for (const entry of list.entries) {
    if (entry.domain && domain && normalizeDomain(entry.domain) === domain) {
      return { blocked: true, reason: entry.reason ?? `Blocked domain: ${entry.domain}` };
    }
    if (entry.email && email && normalizeEmail(entry.email) === email) {
      return { blocked: true, reason: entry.reason ?? `Blocked email: ${entry.email}` };
    }
    if (
      entry.company &&
      company &&
      entry.company.trim().toLowerCase() === company
    ) {
      return { blocked: true, reason: entry.reason ?? `Blocked company: ${entry.company}` };
    }
  }

  return { blocked: false };
}

export function filterBlockedProspects<T extends { domain?: string; email?: string; company?: string }>(
  prospects: T[],
  list?: DoNotContactList
): { allowed: T[]; blocked: Array<T & { blockReason: string }> } {
  const dnc = list ?? loadDoNotContactList();
  const allowed: T[] = [];
  const blocked: Array<T & { blockReason: string }> = [];

  for (const prospect of prospects) {
    const result = isBlockedProspect(prospect, dnc);
    if (result.blocked) {
      blocked.push({ ...prospect, blockReason: result.reason ?? "On do-not-contact list" });
    } else {
      allowed.push(prospect);
    }
  }

  return { allowed, blocked };
}
