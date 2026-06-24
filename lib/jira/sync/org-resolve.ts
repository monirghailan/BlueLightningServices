import { createServiceClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/supabase/database.types";

const CLIENT_LABEL_PREFIX = "client-";

export function clientLabelFromSlug(slug: string): string {
  return `${CLIENT_LABEL_PREFIX}${slug}`;
}

export function extractClientLabel(labels: string[] | null | undefined): string | null {
  if (!labels?.length) return null;
  const match = labels.find((label) => label.toLowerCase().startsWith(CLIENT_LABEL_PREFIX));
  return match ?? null;
}

export async function resolveOrganizationByClientLabel(
  clientLabel: string
): Promise<Organization | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("jira_component_name", clientLabel)
    .maybeSingle();

  if (error) throw error;
  return data as Organization | null;
}

export async function resolveOrganizationIdFromLabels(
  labels: string[] | null | undefined
): Promise<string | null> {
  const clientLabel = extractClientLabel(labels);
  if (!clientLabel) return null;
  const org = await resolveOrganizationByClientLabel(clientLabel);
  return org?.id ?? null;
}
