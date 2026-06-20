/**
 * Index an organization's guide repo into Supabase pgvector.
 *
 * Usage:
 *   npx tsx scripts/index-org-guide.ts acme-corp
 *   npx tsx scripts/index-org-guide.ts --org-id <uuid>
 *
 * Requires env:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   GITHUB_PAT (or GITHUB_APP_TOKEN), OPENAI_API_KEY
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { indexOrgGuide } from "../lib/assistant/index-repo";
import type { Organization } from "../lib/supabase/database.types";

async function main() {
  const arg = process.argv[2];
  const orgIdFlag = process.argv.indexOf("--org-id");
  const orgId = orgIdFlag >= 0 ? process.argv[orgIdFlag + 1] : undefined;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing Supabase env vars.");
    process.exit(1);
  }

  if (!arg && !orgId) {
    console.error("Usage: npx tsx scripts/index-org-guide.ts <org-slug>");
    console.error("   or: npx tsx scripts/index-org-guide.ts --org-id <uuid>");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as SupabaseClient;

  let org: Organization | null = null;

  if (orgId) {
    const { data } = await supabase.from("organizations").select("*").eq("id", orgId).maybeSingle();
    org = data as Organization | null;
  } else {
    const { data } = await supabase.from("organizations").select("*").eq("slug", arg!).maybeSingle();
    org = data as Organization | null;
  }

  if (!org) {
    console.error("Organization not found.");
    process.exit(1);
  }

  if (!org.github_repo_url) {
    console.error("Organization has no github_repo_url. Set it in Supabase first.");
    process.exit(1);
  }

  console.log(`Indexing guide for ${org.name} (${org.slug})…`);
  console.log(`  repo: ${org.github_repo_url}`);

  const result = await indexOrgGuide(supabase, org);

  console.log("Done.");
  console.log(`  files processed: ${result.filesProcessed}`);
  console.log(`  chunks indexed: ${result.chunksIndexed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
