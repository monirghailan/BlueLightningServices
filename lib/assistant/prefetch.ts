import { fetchCachedGuideFile } from "@/lib/assistant/guide-file-cache";
import { fetchRepoFile, getGitHubClient, type GitHubRepoRef } from "@/lib/assistant/github";
import type { GuideSearchResult } from "@/lib/assistant/search";

const GUIDE_FILE_MAX_CHARS = 12_000;

export interface PrefetchedGuideFile {
  path: string;
  content: string;
}

export function findHowToPath(results: GuideSearchResult[]): string | undefined {
  return results.find((result) => result.path.startsWith("how-to/"))?.path;
}

export async function prefetchGuideFile(params: {
  orgId: string;
  repoRef: GitHubRepoRef;
  path: string;
}): Promise<PrefetchedGuideFile> {
  const content = await fetchCachedGuideFile(
    params.orgId,
    params.repoRef,
    params.path,
    () => fetchRepoFile(getGitHubClient(), params.repoRef, params.path)
  );

  return {
    path: params.path,
    content: content.slice(0, GUIDE_FILE_MAX_CHARS),
  };
}

export function collectSourcesFromResults(
  results: GuideSearchResult[],
  prefetchedFile?: PrefetchedGuideFile | null
): Array<{ path: string; title: string }> {
  const sources: Array<{ path: string; title: string }> = [];

  for (const item of results) {
    if (!sources.some((source) => source.path === item.path)) {
      sources.push({ path: item.path, title: item.title });
    }
  }

  if (prefetchedFile && !sources.some((source) => source.path === prefetchedFile.path)) {
    sources.push({
      path: prefetchedFile.path,
      title: prefetchedFile.path.split("/").pop() ?? prefetchedFile.path,
    });
  }

  return sources;
}
