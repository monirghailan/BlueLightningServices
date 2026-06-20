import type { SupabaseClient } from "@supabase/supabase-js";
import type { Organization } from "@/lib/supabase/database.types";
import { chunkMarkdown } from "@/lib/assistant/chunking";
import { generateEmbeddings } from "@/lib/assistant/embeddings";
import { buildChunkContent, parseGuideMarkdown } from "@/lib/assistant/frontmatter";
import {
  fetchRepoFile,
  getGitHubClient,
  listMarkdownFiles,
  parseGitHubRepoUrl,
} from "@/lib/assistant/github";
import { isIndexableGuidePath } from "@/lib/assistant/paths";

export interface IndexOrgGuideResult {
  organizationId: string;
  filesProcessed: number;
  chunksIndexed: number;
}

interface ChunkRow {
  organization_id: string;
  path: string;
  content_hash: string;
  title: string;
  chunk_index: number;
  content: string;
  personas: string[];
  embedding: number[];
}

export async function indexOrgGuide(
  supabase: SupabaseClient,
  org: Organization
): Promise<IndexOrgGuideResult> {
  if (!org.github_repo_url) {
    throw new Error("Organization has no github_repo_url configured.");
  }

  const ref = parseGitHubRepoUrl(org.github_repo_url, org.github_default_branch ?? "main");
  const octokit = getGitHubClient();
  const paths = (await listMarkdownFiles(octokit, ref)).filter(isIndexableGuidePath);

  const rows: ChunkRow[] = [];

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
        organization_id: org.id,
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

  const { error: deleteError } = await supabase
    .from("assistant_documents")
    .delete()
    .eq("organization_id", org.id);

  if (deleteError) {
    throw new Error(`Failed to clear existing index: ${deleteError.message}`);
  }

  if (rows.length > 0) {
    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from("assistant_documents").insert(
        batch.map((row) => ({
          organization_id: row.organization_id,
          path: row.path,
          content_hash: row.content_hash,
          title: row.title,
          chunk_index: row.chunk_index,
          content: row.content,
          personas: row.personas,
          embedding: row.embedding,
        }))
      );

      if (insertError) {
        throw new Error(`Failed to insert index batch: ${insertError.message}`);
      }
    }
  }

  const indexedAt = new Date().toISOString();
  await supabase
    .from("organizations")
    .update({
      assistant_last_indexed_at: indexedAt,
      assistant_enabled: true,
    })
    .eq("id", org.id);

  return {
    organizationId: org.id,
    filesProcessed: paths.length,
    chunksIndexed: rows.length,
  };
}
