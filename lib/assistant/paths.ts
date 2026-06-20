const DENY_PREFIXES = ["_internal/", "_drafts/", "archive/"];

const DENY_EXTENSIONS = [".xml", ".cls", ".js-meta.xml", ".json"];

export function isIndexableGuidePath(path: string): boolean {
  const normalized = path.replace(/^\/+/, "").toLowerCase();

  if (!normalized.endsWith(".md")) return false;
  if (normalized === "contributing.md") return false;

  for (const prefix of DENY_PREFIXES) {
    if (normalized.startsWith(prefix)) return false;
  }

  for (const ext of DENY_EXTENSIONS) {
    if (normalized.endsWith(ext)) return false;
  }

  return true;
}
