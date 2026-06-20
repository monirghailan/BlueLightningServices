import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssistantPersona } from "@/lib/supabase/database.types";
import { expandPersonasForSearch } from "@/lib/assistant/personas";
import { generateEmbedding } from "@/lib/assistant/embeddings";

export interface GuideSearchResult {
  id: string;
  path: string;
  title: string;
  content: string;
  personas: string[];
  similarity: number;
}

export async function searchOrgGuide(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    question: string;
    persona: AssistantPersona;
    matchCount?: number;
  }
): Promise<GuideSearchResult[]> {
  const embedding = await generateEmbedding(params.question);
  const personas = expandPersonasForSearch(params.persona);

  const { data, error } = await supabase.rpc("match_assistant_documents", {
    p_org_id: params.organizationId,
    p_query_embedding: embedding,
    p_personas: personas,
    p_match_count: params.matchCount ?? 8,
    p_match_threshold: 0.35,
  });

  if (error) {
    console.error("searchOrgGuide error:", error);
    throw new Error("Failed to search org guide.");
  }

  return (data ?? []) as GuideSearchResult[];
}
