/**
 * Apply pre-generated SQL batch files via Supabase MCP-compatible execution.
 * Requires DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage: npx tsx scripts/run-index-sql-batches.ts .index-batches
 */

import { readdirSync, readFileSync } from "fs";
import { join } from "path";
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
  const dir = process.argv[2] ?? ".index-batches";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const files = readdirSync(dir)
    .filter((f) => f.startsWith("genie-small-") && f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.error(`No genie-small-*.sql files in ${dir}`);
    process.exit(1);
  }

  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    const { error } = await supabase.rpc("exec_sql", { query: sql });
    if (error) {
      // Fallback: parse INSERT rows and use client insert for single-row batches
      console.error(`Batch ${file} failed via rpc: ${error.message}`);
      process.exit(1);
    }
    console.log(`Applied ${file}`);
  }

  console.log("All batches applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
