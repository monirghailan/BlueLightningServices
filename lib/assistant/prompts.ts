import type { AssistantPersona, Organization } from "@/lib/supabase/database.types";
import { personaSystemContext } from "@/lib/assistant/personas";
import type { PrefetchedGuideFile } from "@/lib/assistant/prefetch";
import type { GuideSearchResult } from "@/lib/assistant/search";

function buildRetrievedContextSection(
  searchResults: GuideSearchResult[],
  prefetchedFile?: PrefetchedGuideFile | null
): string {
  if (searchResults.length === 0 && !prefetchedFile) {
    return "Pre-search found no matching guide excerpts for this question.";
  }

  const sections: string[] = ["## Pre-search results (use as your primary source)"];

  if (searchResults.length > 0) {
    sections.push("### Matching excerpts");
    for (const item of searchResults) {
      sections.push(
        `#### ${item.title} (similarity ${item.similarity.toFixed(2)})\n${item.content}`
      );
    }
  }

  if (prefetchedFile) {
    sections.push(`### Full guide file\n${prefetchedFile.content}`);
  }

  return sections.join("\n\n");
}

export function buildAssistantSystemPrompt(params: {
  org: Organization;
  persona: AssistantPersona;
  searchResults?: GuideSearchResult[];
  prefetchedFile?: PrefetchedGuideFile | null;
}): string {
  const override = params.org.assistant_system_prompt_override?.trim();
  const orgName = params.org.name;
  const hasPreSearch = params.searchResults !== undefined;

  const lines = [
    `You are the Salesforce org guide assistant for ${orgName}.`,
    personaSystemContext(params.persona),
    "Your audience is non-technical Salesforce users. Never assume admin, developer, or Setup knowledge.",
    "Use step-by-step instructions with the org's UI labels when available.",
    hasPreSearch
      ? "Relevant guide excerpts are included below from a pre-search. Answer using that material first."
      : "Only answer using information returned from your tools (searchOrgGuide, fetchGuideFile).",
    hasPreSearch
      ? "Call searchOrgGuide only if the pre-search results are clearly insufficient for the user's question."
      : "For every question, call searchOrgGuide first to find relevant guide content.",
    hasPreSearch
      ? "Call fetchGuideFile only if you need a different guide file than the pre-loaded content."
      : "For procedural questions: if results reference a how-to or steps look incomplete, call fetchGuideFile for the full file before answering.",
    "If no relevant information is available, say clearly that the topic is not in their org guide yet and suggest they ask their admin or open a support ticket in the portal.",
    "Never instruct users to change Setup, flows, permissions, or metadata.",
    "Explain Salesforce concepts in plain business language.",
    "Never include URLs, markdown links, or repo file paths in your responses.",
    "Never say 'see the guide', 'open how-to/…', or reference documentation locations — users cannot access those files.",
    "Give complete, actionable answers in the message body. Do not defer to other documents.",
    "For FAQ-style questions: answer fully with all steps needed; do not point users elsewhere.",
    "Keep answers concise, friendly, and actionable.",
    override ? `Organization-specific guidance: ${override}` : null,
  ].filter(Boolean);

  if (hasPreSearch) {
    lines.push(buildRetrievedContextSection(params.searchResults ?? [], params.prefetchedFile));
  }

  return lines.join("\n");
}
