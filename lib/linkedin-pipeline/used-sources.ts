import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

export type UsedSource = {
  sourceType: string;
  sourceRef: string;
  usedAt: string;
};

const DEFAULT_PATH = join(
  process.cwd(),
  "scripts/linkedin-pipeline/.used-sources.json"
);

function readUsedSources(path = DEFAULT_PATH): UsedSource[] {
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as UsedSource[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function wasSourceUsedRecently(
  sourceType: string,
  sourceRef: string,
  dedupDays: number,
  path = DEFAULT_PATH
): boolean {
  const cutoff = Date.now() - dedupDays * 24 * 60 * 60 * 1000;
  return readUsedSources(path).some(
    (entry) =>
      entry.sourceType === sourceType &&
      entry.sourceRef === sourceRef &&
      Date.parse(entry.usedAt) >= cutoff
  );
}

export function recordUsedSource(
  sourceType: string,
  sourceRef: string,
  path = DEFAULT_PATH
): void {
  const entries = readUsedSources(path).filter(
    (entry) => !(entry.sourceType === sourceType && entry.sourceRef === sourceRef)
  );
  entries.unshift({
    sourceType,
    sourceRef,
    usedAt: new Date().toISOString(),
  });

  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(path, JSON.stringify(entries.slice(0, 200), null, 2), "utf8");
}
