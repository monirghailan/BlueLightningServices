import matter from "gray-matter";

export interface ParsedGuideFile {
  title: string;
  summary: string | null;
  personas: string[];
  body: string;
  contentHash: string;
}

export function parseGuideMarkdown(raw: string, fallbackTitle: string): ParsedGuideFile {
  const { data, content } = matter(raw);
  const title =
    typeof data.title === "string" && data.title.trim()
      ? data.title.trim()
      : fallbackTitle;

  const summary =
    typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : null;

  let personas: string[] = ["all"];

  if (data.personas === "all") {
    personas = ["all"];
  } else if (Array.isArray(data.personas)) {
    personas = data.personas
      .filter((p): p is string => typeof p === "string")
      .map((p) => p.trim())
      .filter(Boolean);
  } else if (typeof data.personas === "string") {
    personas = [data.personas.trim()].filter(Boolean);
  }

  if (personas.length === 0) personas = ["all"];

  const body = content.trim();
  const contentHash = hashContent(raw);

  return { title, summary, personas, body, contentHash };
}

function hashContent(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `${value.length}-${hash}`;
}

export function buildChunkContent(title: string, summary: string | null, chunk: string): string {
  const header = summary ? `${title}\n${summary}` : title;
  return `${header}\n\n${chunk}`;
}
