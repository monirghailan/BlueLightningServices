/**
 * Print the canonical /cold-outreach chat prompt for an on-demand prospecting run.
 *
 * Usage:
 *   npm run outreach:run
 *   npm run outreach:run -- --count 5 --niche fintech
 *   npm run outreach:run -- --summary
 */

import { writeFileSync } from "node:fs";
import { buildOutreachRunBundle } from "@/lib/outreach/run-prompt";

function parseArgs(argv: string[]) {
  const options: {
    count?: number;
    niche?: string;
    mode?: "research" | "summary";
  } = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--summary") {
      options.mode = "summary";
    } else if (arg === "--count" && argv[i + 1]) {
      options.count = Number(argv[++i]);
    } else if (arg === "--niche" && argv[i + 1]) {
      options.niche = argv[++i];
    }
  }

  if (options.count !== undefined && (!Number.isFinite(options.count) || options.count < 1)) {
    throw new Error("--count must be a positive number");
  }

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const bundle = buildOutreachRunBundle(options);
  const outPath = "scripts/outreach/.run-prompt.json";

  writeFileSync(outPath, JSON.stringify(bundle, null, 2), "utf8");

  console.log("BLS cold outreach — on-demand run\n");
  console.log(`Sheet: ${bundle.spreadsheetUrl}`);
  console.log(`Tab:   ${bundle.sheetTab}\n`);
  console.log("Paste this into Cursor chat:\n");
  console.log(bundle.chatPrompt);
  console.log("\n---");
  console.log(`Wrote ${outPath}`);
  console.log("\nOr ask Cursor:");
  console.log('  "Run cold outreach from scripts/outreach/.run-prompt.json"');
}

main();
