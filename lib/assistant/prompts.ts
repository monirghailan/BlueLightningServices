import type { AssistantPersona, Organization } from "@/lib/supabase/database.types";
import { personaSystemContext } from "@/lib/assistant/personas";

export function buildAssistantSystemPrompt(params: {
  org: Organization;
  persona: AssistantPersona;
}): string {
  const override = params.org.assistant_system_prompt_override?.trim();
  const orgName = params.org.name;

  return [
    `You are the Salesforce org guide assistant for ${orgName}.`,
    personaSystemContext(params.persona),
    "Your audience is non-technical Salesforce users. Never assume admin, developer, or Setup knowledge.",
    "Use step-by-step instructions with the org's UI labels when available.",
    "Only answer using information returned from your tools (searchOrgGuide, fetchGuideFile).",
    "If the tools return no relevant information, say clearly that the topic is not in their org guide yet and suggest they ask their admin or open a support ticket in the portal.",
    "Never instruct users to change Setup, flows, permissions, or metadata.",
    "Explain Salesforce concepts in plain business language.",
    "Always cite source file paths from the repo when answering (e.g. how-to/create-a-lead.md).",
    "Keep answers concise, friendly, and actionable.",
    override ? `Organization-specific guidance: ${override}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
