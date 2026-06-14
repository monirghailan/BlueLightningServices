/**
 * BLS-internal script to provision a client organization.
 *
 * Usage:
 *   npx tsx scripts/provision-org.ts "Acme Corp" acme-corp admin@acme.com
 *
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * JIRA_EMAIL, JIRA_API_TOKEN, JIRA_BASE_URL
 */

import { createClient } from "@supabase/supabase-js";
import { provisionJiraForOrg, formatJiraError } from "../lib/jira/provisioning";
import {
  generateInviteToken,
  hashInviteToken,
  inviteExpiryDate,
} from "../lib/portal/invite";
import { portalInviteUrl } from "../lib/portal/url";

async function main() {
  const [name, slug, adminEmail] = process.argv.slice(2);

  if (!name || !slug || !adminEmail) {
    console.error('Usage: npx tsx scripts/provision-org.ts "Org Name" org-slug admin@example.com');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing Supabase env vars.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Provisioning Jira for ${name}...`);
  let jira;
  try {
    jira = await provisionJiraForOrg(name, slug);
    console.log("Jira:", jira);
  } catch (error) {
    console.error("Jira provisioning failed:", formatJiraError(error));
    process.exit(1);
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      jira_project_key: "KAN",
      jira_component_id: jira.componentId,
      jira_component_name: jira.componentName,
      jira_board_id: jira.boardId,
      status: "active",
    })
    .select()
    .single();

  if (orgError || !org) {
    console.error("Failed to create organization:", orgError);
    process.exit(1);
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);

  const { error: inviteError } = await supabase.from("invitations").insert({
    organization_id: org.id,
    email: adminEmail.toLowerCase(),
    role: "administrator",
    token_hash: tokenHash,
    expires_at: inviteExpiryDate().toISOString(),
    invited_by: null,
  });

  if (inviteError) {
    console.warn("Could not create invitation row:", inviteError.message);
  }

  const inviteUrl = portalInviteUrl(token);

  console.log("\nOrganization provisioned:");
  console.log("  ID:", org.id);
  console.log("  Slug:", org.slug);
  console.log("  Component:", jira.componentName);
  console.log("  Board ID:", jira.boardId);
  console.log("\nAdmin invite URL:");
  console.log(" ", inviteUrl);
}

main().catch(console.error);
