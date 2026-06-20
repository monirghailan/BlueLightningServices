/**
 * Export index chunks as JSON for MCP/SQL insertion when service role key
 * is unavailable locally. Usage:
 *   npx tsx scripts/export-index-chunks.ts genie-shopping > /tmp/chunks.json
 */

import { readFileSync } from "fs";
import { chunkMarkdown } from "../lib/assistant/chunking";
import { generateEmbeddings } from "../lib/assistant/embeddings";
import { buildChunkContent, parseGuideMarkdown } from "../lib/assistant/frontmatter";
import {
  fetchRepoFile,
  getGitHubClient,
  listMarkdownFiles,
  parseGitHubRepoUrl,
} from "../lib/assistant/github";
import { isIndexableGuidePath } from "../lib/assistant/paths";

function loadEnvLocal() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

async function main() {
  loadEnvLocal();

  const slug = process.argv[2];
  const orgId = process.argv[3];
  const repoUrl = process.argv[4] ?? "https://github.com/bls-org-docs/genie-shopping";
  const branch = process.argv[5] ?? "main";

  if (!slug || !orgId) {
    console.error(
      "Usage: npx tsx scripts/export-index-chunks.ts <slug> <org-id> [repo-url] [branch]"
    );
    process.exit(1);
  }

  const ref = parseGitHubRepoUrl(repoUrl, branch);
  const octokit = getGitHubClient();
  const paths = (await listMarkdownFiles(octokit, ref)).filter(isIndexableGuidePath);
  const rows: Array<{
    organization_id: string;
    path: string;
    content_hash: string;
    title: string;
    chunk_index: number;
    content: string;
    personas: string[];
    embedding: number[];
  }> = [];

  for (const path of paths) {
    const raw = await fetchRepoFile(octokit, ref, path);
    const fallbackTitle = path.split("/").pop()?.replace(/\.md$/i, "") ?? path;
    const parsed = parseGuideMarkdown(raw, fallbackTitle);
    const chunks = chunkMarkdown(parsed.body);
    if (chunks.length === 0) continue;

    const embedInputs = chunks.map((chunk) =>
      buildChunkContent(parsed.title, parsed.summary, chunk)
    );
    const embeddings = await generateEmbeddings(embedInputs);

    chunks.forEach((chunk, index) => {
      rows.push({
        organization_id: orgId,
        path,
        content_hash: parsed.contentHash,
        title: parsed.title,
        chunk_index: index,
        content: embedInputs[index] ?? chunk,
        personas: parsed.personas,
        embedding: embeddings[index] ?? [],
      });
    });
  }

  console.log(JSON.stringify({ filesProcessed: paths.length, chunksIndexed: rows.length, rows }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
