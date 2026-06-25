import type { GitHubRepoRef } from "@/lib/assistant/github";

const cache = new Map<string, string>();

function cacheKey(orgId: string, branch: string, path: string): string {
  return `${orgId}:${branch}:${path}`;
}

export async function fetchCachedGuideFile(
  orgId: string,
  repoRef: GitHubRepoRef,
  path: string,
  fetcher: () => Promise<string>
): Promise<string> {
  const key = cacheKey(orgId, repoRef.branch, path);
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const content = await fetcher();
  cache.set(key, content);
  return content;
}

export function invalidateOrgGuideFileCache(orgId: string): void {
  const prefix = `${orgId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
