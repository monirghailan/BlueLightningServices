import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { parseGuideMarkdown } from "@/lib/assistant/frontmatter";
import {
  fetchRepoFile,
  getGitHubClient,
  parseGitHubRepoUrl,
} from "@/lib/assistant/github";
import type { Organization } from "@/lib/supabase/database.types";

export const FAQ_GUIDE_PATH = "faq.md";
export const MAX_FAQ_SUGGESTIONS = 5;

export function parseFaqQuestions(body: string, limit = MAX_FAQ_SUGGESTIONS): string[] {
  const questions: string[] = [];

  for (const match of body.matchAll(/^##\s+(.+)$/gm)) {
    const question = cleanFaqQuestion(match[1] ?? "");
    if (!isValidFaqQuestion(question)) continue;
    questions.push(question);
    if (questions.length >= limit) break;
  }

  return questions;
}

function cleanFaqQuestion(value: string): string {
  return value.replace(/<!--.*?-->/g, "").trim();
}

function isValidFaqQuestion(question: string): boolean {
  if (!question) return false;
  if (/TODO/i.test(question)) return false;
  return true;
}

async function fetchFaqMarkdownFromGitHub(org: Organization): Promise<string | null> {
  if (!org.github_repo_url) return null;

  try {
    const ref = parseGitHubRepoUrl(org.github_repo_url, org.github_default_branch ?? "main");
    const octokit = getGitHubClient();
    return await fetchRepoFile(octokit, ref, FAQ_GUIDE_PATH);
  } catch (error) {
    console.error("Failed to fetch org FAQ from GitHub:", error);
    return null;
  }
}

async function fetchFaqMarkdownFromIndex(
  supabase: SupabaseClient,
  organizationId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("assistant_documents")
    .select("content")
    .eq("organization_id", organizationId)
    .eq("path", FAQ_GUIDE_PATH)
    .order("chunk_index");

  if (error) {
    console.error("Failed to fetch org FAQ from index:", error);
    return null;
  }

  if (!data?.length) return null;

  return data.map((row) => row.content).join("\n\n");
}

export async function getOrgFaqQuestions(
  org: Organization,
  supabase: SupabaseClient
): Promise<string[]> {
  const raw =
    (await fetchFaqMarkdownFromGitHub(org)) ??
    (await fetchFaqMarkdownFromIndex(supabase, org.id));

  if (!raw) return [];

  const parsed = parseGuideMarkdown(raw, "FAQ");
  return parseFaqQuestions(parsed.body);
}

export const getCachedOrgFaqQuestions = cache(getOrgFaqQuestions);
