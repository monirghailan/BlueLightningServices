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
import { formatJiraError } from "../lib/jira/provisioning";
import { provisionClientOrganization } from "../lib/portal/provision-client";
import type { Database } from "../lib/supabase/database.types";

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

  const supabase = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Provisioning ${name}...`);

  try {
    const result = await provisionClientOrganization(supabase, {
      name,
      slug,
      adminEmail,
    });

    console.log("\nOrganization provisioned:");
    console.log("  ID:", result.organizationId);
    console.log("  Slug:", slug);
    console.log("\nAdmin invite URL:");
    console.log(" ", result.inviteUrl);
  } catch (error) {
    console.error("Provisioning failed:", formatJiraError(error));
    process.exit(1);
  }
}

main().catch(console.error);
