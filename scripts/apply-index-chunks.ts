/**
 * Insert exported index chunks into Supabase (requires SUPABASE_SERVICE_ROLE_KEY).
 * Usage: npx tsx scripts/apply-index-chunks.ts /tmp/genie-index.json
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      let val = trimmed.slice(eq + 1);
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

async function main() {
  loadEnvLocal();
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npx tsx scripts/apply-index-chunks.ts <chunks.json>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(file, "utf8")) as {
    filesProcessed: number;
    chunksIndexed: number;
    rows: Array<{
      organization_id: string;
      path: string;
      content_hash: string;
      title: string;
      chunk_index: number;
      content: string;
      personas: string[];
      embedding: number[];
    }>;
  };

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const orgId = data.rows[0]?.organization_id;
  if (!orgId) {
    console.error("No rows to insert.");
    process.exit(1);
  }

  const { error: deleteError } = await supabase
    .from("assistant_documents")
    .delete()
    .eq("organization_id", orgId);

  if (deleteError) {
    throw new Error(`Delete failed: ${deleteError.message}`);
  }

  const batchSize = 10;
  for (let i = 0; i < data.rows.length; i += batchSize) {
    const batch = data.rows.slice(i, i + batchSize);
    const { error: insertError } = await supabase.from("assistant_documents").insert(
      batch.map((row) => ({
        organization_id: row.organization_id,
        path: row.path,
        content_hash: row.content_hash,
        title: row.title,
        chunk_index: row.chunk_index,
        content: row.content,
        personas: row.personas,
        embedding: row.embedding,
      }))
    );
    if (insertError) {
      throw new Error(`Insert batch ${i / batchSize} failed: ${insertError.message}`);
    }
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
  }

  const indexedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("organizations")
    .update({ assistant_last_indexed_at: indexedAt, assistant_enabled: true })
    .eq("id", orgId);

  if (updateError) {
    throw new Error(`Org update failed: ${updateError.message}`);
  }

  console.log("Done.", {
    filesProcessed: data.filesProcessed,
    chunksIndexed: data.chunksIndexed,
    organizationId: orgId,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
