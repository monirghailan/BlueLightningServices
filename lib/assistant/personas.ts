import type { AssistantPersona } from "@/lib/supabase/database.types";

export const ASSISTANT_PERSONAS: AssistantPersona[] = [
  "sales_rep",
  "sales_manager",
  "service_agent",
  "service_manager",
  "general",
];

export const ASSISTANT_PERSONA_LABELS: Record<AssistantPersona, string> = {
  sales_rep: "Sales rep",
  sales_manager: "Sales manager",
  service_agent: "Service agent",
  service_manager: "Service manager",
  general: "General / Product owner / Other",
};

export function expandPersonasForSearch(persona: AssistantPersona): string[] {
  switch (persona) {
    case "sales_rep":
      return ["sales_rep", "all"];
    case "sales_manager":
      return ["sales_manager", "sales_rep", "all"];
    case "service_agent":
      return ["service_agent", "all"];
    case "service_manager":
      return ["service_manager", "service_agent", "all"];
    case "general":
      return [
        "general",
        "sales_rep",
        "sales_manager",
        "service_agent",
        "service_manager",
        "all",
      ];
    default:
      return ["general", "all"];
  }
}

export function personaSystemContext(persona: AssistantPersona): string {
  switch (persona) {
    case "sales_rep":
      return "You are helping a sales rep who needs practical day-to-day selling steps.";
    case "sales_manager":
      return "You are helping a sales manager who needs pipeline, team, and approval guidance.";
    case "service_agent":
      return "You are helping a service agent who handles customer cases and needs clear case steps.";
    case "service_manager":
      return "You are helping a service manager who oversees queues, escalations, and team SLAs.";
    case "general":
      return "You are helping a non-technical user who may be a product owner or mixed-role employee.";
    default:
      return "You are helping a non-technical Salesforce user.";
  }
}
