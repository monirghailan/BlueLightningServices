import type { SupabaseClient } from "@supabase/supabase-js";
import { provisionJiraForOrg } from "@/lib/jira/provisioning";
import {
  generateInviteToken,
  hashInviteToken,
  inviteExpiryDate,
} from "@/lib/portal/invite";
import { site } from "@/lib/content";
import { sendInviteEmail } from "@/lib/portal/email";
import { portalInviteUrl } from "@/lib/portal/url";

export interface ProvisionClientInput {
  name: string;
  slug: string;
  adminEmail: string;
  invitedBy?: string | null;
}

export interface ProvisionClientResult {
  organizationId: string;
  inviteUrl: string;
}

export async function provisionClientOrganization(
  supabase: SupabaseClient,
  input: ProvisionClientInput
): Promise<ProvisionClientResult> {
  const jira = await provisionJiraForOrg(input.name, input.slug);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      slug: input.slug,
      jira_project_key: "KAN",
      jira_component_id: jira.componentId,
      jira_component_name: jira.componentName,
      jira_board_id: jira.boardId,
      status: "active",
    })
    .select()
    .single();

  if (orgError || !org) {
    throw new Error(orgError?.message ?? "Failed to create organization.");
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);

  const { error: inviteError } = await supabase.from("invitations").insert({
    organization_id: org.id,
    email: input.adminEmail.toLowerCase(),
    role: "administrator",
    token_hash: tokenHash,
    expires_at: inviteExpiryDate().toISOString(),
    invited_by: input.invitedBy ?? null,
  });

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  const inviteUrl = portalInviteUrl(token);

  await sendInviteEmail({
    to: input.adminEmail,
    orgName: input.name,
    inviteUrl,
    inviterEmail: site.email,
    context: "onboarding",
  });

  return {
    organizationId: org.id,
    inviteUrl,
  };
}
