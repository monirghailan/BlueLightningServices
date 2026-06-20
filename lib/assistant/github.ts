import { Octokit } from "@octokit/rest";

export interface GitHubRepoRef {
  owner: string;
  repo: string;
  branch: string;
}

export function parseGitHubRepoUrl(url: string, defaultBranch = "main"): GitHubRepoRef {
  const trimmed = url.trim().replace(/\.git$/, "");
  const match = trimmed.match(/github\.com[/:]([^/]+)\/([^/]+)$/i);

  if (!match) {
    throw new Error(`Invalid GitHub repo URL: ${url}`);
  }

  return {
    owner: match[1],
    repo: match[2],
    branch: defaultBranch,
  };
}

export function getGitHubClient(): Octokit {
  const token = process.env.GITHUB_PAT ?? process.env.GITHUB_APP_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_PAT or GITHUB_APP_TOKEN.");
  }
  return new Octokit({ auth: token });
}

export interface RepoBlob {
  path: string;
  sha: string;
}

export async function getBranchCommitSha(
  octokit: Octokit,
  ref: GitHubRepoRef
): Promise<string> {
  const branchRef = await octokit.git.getRef({
    owner: ref.owner,
    repo: ref.repo,
    ref: `heads/${ref.branch}`,
  });
  return branchRef.data.object.sha;
}

export async function listRepoBlobs(
  octokit: Octokit,
  ref: GitHubRepoRef
): Promise<RepoBlob[]> {
  const commitSha = await getBranchCommitSha(octokit, ref);

  const tree = await octokit.git.getTree({
    owner: ref.owner,
    repo: ref.repo,
    tree_sha: commitSha,
    recursive: "true",
  });

  return (tree.data.tree ?? [])
    .filter((item) => item.type === "blob" && typeof item.path === "string")
    .map((item) => ({
      path: item.path as string,
      sha: item.sha as string,
    }));
}

export async function listMarkdownFiles(
  octokit: Octokit,
  ref: GitHubRepoRef
): Promise<string[]> {
  const blobs = await listRepoBlobs(octokit, ref);
  return blobs.map((blob) => blob.path);
}

export async function getRepoFileSha(
  octokit: Octokit,
  ref: GitHubRepoRef,
  path: string
): Promise<string | null> {
  try {
    const response = await octokit.repos.getContent({
      owner: ref.owner,
      repo: ref.repo,
      path,
      ref: ref.branch,
    });

    if (Array.isArray(response.data) || response.data.type !== "file") {
      return null;
    }

    return response.data.sha;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

export async function upsertRepoFile(
  octokit: Octokit,
  ref: GitHubRepoRef,
  path: string,
  content: string,
  message: string
): Promise<void> {
  const existingSha = await getRepoFileSha(octokit, ref, path);

  await octokit.repos.createOrUpdateFileContents({
    owner: ref.owner,
    repo: ref.repo,
    path,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: ref.branch,
    ...(existingSha ? { sha: existingSha } : {}),
  });
}

export async function fetchRepoFile(
  octokit: Octokit,
  ref: GitHubRepoRef,
  path: string
): Promise<string> {
  const response = await octokit.repos.getContent({
    owner: ref.owner,
    repo: ref.repo,
    path,
    ref: ref.branch,
  });

  if (Array.isArray(response.data) || response.data.type !== "file") {
    throw new Error(`Path is not a file: ${path}`);
  }

  if (response.data.encoding !== "base64" || !response.data.content) {
    throw new Error(`Unable to read file: ${path}`);
  }

  return Buffer.from(response.data.content, "base64").toString("utf8");
}
