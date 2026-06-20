/**
 * Scaffold a chatbot-ready org guide GitHub repo for a BLS client.
 *
 * Usage:
 *   npx tsx scripts/scaffold-org-guide.ts "Acme Corp" acme-corp
 *   npx tsx scripts/scaffold-org-guide.ts "Acme Corp" acme-corp ./acme-corp
 *   npx tsx scripts/scaffold-org-guide.ts "Acme Corp" acme-corp --teams sales,service --git-init
 *
 * Options:
 *   --teams sales,service   Include team-specific files (default: sales,service)
 *   --git-init              Run git init -b main in the output directory
 *   --force                 Overwrite existing files
 *
 * See docs/assistant-repo-setup.md for writing rules and pre-index checklist.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";

type Team = "sales" | "service";

interface Options {
  clientName: string;
  slug: string;
  outputDir: string;
  teams: Set<Team>;
  gitInit: boolean;
  force: boolean;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatPersonas(personas: "all" | string[]): string {
  if (personas === "all") return "all";
  return `[${personas.join(", ")}]`;
}

function frontmatter(opts: {
  title: string;
  personas: "all" | string[];
  summary: string;
}): string {
  return `---
title: ${opts.title}
personas: ${formatPersonas(opts.personas)}
summary: ${opts.summary}
last_reviewed: ${todayIso()}
---

`;
}

const HOW_TO_README = `# How-to guides

Do **not** add step-by-step guides until you have verified them in the client's live Salesforce org.

The scaffold intentionally does **not** create how-to files with placeholder steps — invented UI labels and flows will be indexed by the Portal Assistant and produce wrong answers.

## When you add a guide

1. Shadow a user or walk through the task in the org yourself
2. Create one file per task, e.g. \`how-to/create-a-lead.md\`
3. Use real app names, tab names, button labels, and field labels from screen
4. Add YAML frontmatter (\`title\`, \`personas\`, \`summary\`, \`last_reviewed\`)
5. Re-index the org guide repo

See \`docs/assistant-repo-setup.md\` in the BLS site repo for structure examples.
`;

function parseArgs(argv: string[]): Options {
  const positional: string[] = [];
  let teams = new Set<Team>(["sales", "service"]);
  let gitInit = false;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--git-init") {
      gitInit = true;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--teams") {
      const value = argv[++i];
      if (!value) {
        console.error("--teams requires a value, e.g. --teams sales,service");
        process.exit(1);
      }
      teams = new Set(value.split(",").map((t) => t.trim()) as Team[]);
      for (const t of teams) {
        if (t !== "sales" && t !== "service") {
          console.error(`Unknown team: ${t}. Use sales and/or service.`);
          process.exit(1);
        }
      }
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  const [clientName, slug, outputDirArg] = positional;

  if (!clientName || !slug) {
    console.error(
      'Usage: npx tsx scripts/scaffold-org-guide.ts "Client Name" client-slug [outputDir] [--teams sales,service] [--git-init] [--force]'
    );
    process.exit(1);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    console.error("Slug must be lowercase alphanumeric with hyphens (e.g. acme-corp).");
    process.exit(1);
  }

  const outputDir = resolve(outputDirArg ?? join(process.cwd(), "org-guides", slug));

  return { clientName, slug, outputDir, teams, gitInit, force };
}

function writeFile(options: Options, relativePath: string, content: string): void {
  const fullPath = join(options.outputDir, relativePath);
  if (existsSync(fullPath) && !options.force) {
    console.log(`  skip (exists): ${relativePath}`);
    return;
  }
  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, content, "utf8");
  console.log(`  wrote: ${relativePath}`);
}

function buildFiles(options: Options): Record<string, string> {
  const { clientName, slug } = options;
  const hasSales = options.teams.has("sales");
  const hasService = options.teams.has("service");
  const files: Record<string, string> = {};

  const quickLinks = [
    "- [Glossary](glossary.md) — terms and labels users see in this org",
    "- [FAQ](faq.md) — common questions",
    ...(hasSales
      ? ["- [Lead to opportunity](processes/lead-to-opportunity.md) — sales process overview"]
      : []),
    ...(hasService
      ? ["- [Case handling](processes/case-handling.md) — support process overview"]
      : []),
    ...(hasSales || hasService
      ? ["- [How-to guides](how-to/README.md) — add verified step-by-step tasks here"]
      : []),
  ].join("\n");

  files["README.md"] = `# ${clientName} — Salesforce org guide

> BLS Portal Assistant knowledge base. Write for non-technical Salesforce users.

## About this org

<!-- TODO: 2–3 paragraphs: what ${clientName} uses Salesforce for, which apps (Sales / Service), and who uses it day to day. Use verified facts only. -->

## Quick links

${quickLinks}

## Maintained by

Blue Lightning Services · Portal slug: \`${slug}\`

Last updated: ${todayIso()}
`;

  files["CONTRIBUTING.md"] = `# Contributing to this org guide

This repo powers the BLS Portal Assistant. Write for non-technical Salesforce users.

## Rules

1. Every guide needs YAML frontmatter with \`title\` and \`personas\`.
2. Use UI labels from the live org, not API names in headings.
3. One task per how-to file.
4. No Setup/admin instructions — end-user steps only.
5. Update \`last_reviewed\` when you change a file.

## Personas

- \`sales_rep\`, \`sales_manager\`, \`service_agent\`, \`service_manager\`, \`general\`
- Use \`all\` only for org-wide content

## Folders

- \`personas/\` — role-specific “day in the life” overviews
- \`processes/\` — end-to-end business flows
- \`objects/\` — what each record type means in this org
- \`how-to/\` — step-by-step tasks
- \`knowledge/\` — optional pasted Knowledge articles
- \`faq.md\`, \`glossary.md\` — shared reference

See the BLS internal runbook: \`docs/assistant-repo-setup.md\` in the main BLS site repo.
`;

  files["glossary.md"] = `${frontmatter({
    title: "Glossary",
    personas: "all",
    summary: "Client-specific Salesforce terms, tab names, and picklist meanings.",
  })}# Glossary

Add terms users hear in ${clientName}'s org. Use their **on-screen labels**.

| Term | Meaning in this org |
|---|---|
| <!-- TODO: e.g. Opportunity --> | <!-- TODO: A deal you are trying to close --> |
| <!-- TODO: Stage = Proposal --> | <!-- TODO: Pricing has been sent to the customer --> |

## Record types

<!-- TODO: Brief plain-English description of Account, Contact, Lead, etc. as used here. Link to objects/ for detail. -->
`;

  files["faq.md"] = `${frontmatter({
    title: "Frequently asked questions",
    personas: "all",
    summary: "Common questions about using Salesforce in this org.",
  })}# FAQ

Use real questions users ask. Link to full how-to guides where possible.

## <!-- TODO: Replace with a real question, e.g. How do I create a lead? -->

<!-- TODO: Short answer + link, e.g. See [How to create a lead](how-to/create-a-lead.md). -->

## <!-- TODO: Second question -->

<!-- TODO: Answer -->

## <!-- TODO: Third question -->

<!-- TODO: Add at least 10 FAQ entries before first index. -->
`;

  files["knowledge/.gitkeep"] = "";
  files["objects/custom/.gitkeep"] = "";

  const objectFiles: Array<{ path: string; title: string; summary: string }> = [
    {
      path: "objects/account.md",
      title: "Account",
      summary: "What an Account means in this org and when users work with it.",
    },
    {
      path: "objects/contact.md",
      title: "Contact",
      summary: "What a Contact is and how it relates to Accounts.",
    },
    {
      path: "objects/lead.md",
      title: "Lead",
      summary: "What a Lead is before it becomes an opportunity or account.",
    },
    {
      path: "objects/opportunity.md",
      title: "Opportunity",
      summary: "What an Opportunity (deal) is and key stages in this org.",
    },
    {
      path: "objects/case.md",
      title: "Case",
      summary: "What a Case is and when users create or update cases.",
    },
  ];

  for (const obj of objectFiles) {
    files[obj.path] = `${frontmatter({
      title: obj.title,
      personas: "all",
      summary: obj.summary,
    })}# ${obj.title}

<!-- TODO: Explain ${obj.title} in business language for ${clientName}. What is it for? Who creates or updates it? -->

## Where to find it

<!-- TODO: App name, tab name, list views users actually use. -->

## Related

<!-- TODO: Link to processes/ and how-to/ files. -->
`;
  }

  files["objects/custom/README.md"] = `# Custom objects

Add one markdown file per custom object **only after** verifying it exists in the client's org (e.g. \`objects/custom/manual_actions__c.md\`).

Do not scaffold fictional example objects — they get indexed and produce wrong answers.
`;

  if (hasSales) {
    files["personas/sales-rep.md"] = `${frontmatter({
      title: "Sales rep — day in the life",
      personas: ["sales_rep", "general"],
      summary: `Overview for account executives and BDRs using Salesforce at ${clientName}.`,
    })}# Sales rep overview

<!-- TODO: Apps they open, tabs they use daily, top 5 tasks, who to escalate to. -->
`;

    files["personas/sales-manager.md"] = `${frontmatter({
      title: "Sales manager — day in the life",
      personas: ["sales_manager", "general"],
      summary: "Overview for sales team leads: pipeline, forecasts, and approvals.",
    })}# Sales manager overview

<!-- TODO: Dashboards, reports, approval thresholds, team pipeline reviews. -->
`;

    files["processes/lead-to-opportunity.md"] = `${frontmatter({
      title: "Lead to opportunity process",
      personas: ["sales_rep", "sales_manager", "general"],
      summary: "End-to-end flow from new lead to qualified opportunity in this org.",
    })}# Lead to opportunity

<!-- TODO: Describe the business process in 5–8 steps. Add how-to/ files only after verifying steps in the live org. -->

## Stages at a glance

<!-- TODO: What each stage/status means in plain English. -->

## Related

<!-- TODO: Link to verified how-to/ files when you create them. Do not link to guides that do not exist yet. -->
`;

    files["processes/quoting.md"] = `${frontmatter({
      title: "Quoting process",
      personas: ["sales_rep", "sales_manager", "general"],
      summary: "How quotes are created and approved in this org.",
    })}# Quoting

<!-- TODO: Document quote creation, approval rules, and what reps vs managers do. -->
`;

  }

  if (hasService) {
    files["personas/service-agent.md"] = `${frontmatter({
      title: "Service agent — day in the life",
      personas: ["service_agent", "general"],
      summary: `Overview for support agents handling cases in ${clientName}.`,
    })}# Service agent overview

<!-- TODO: Console or app, queues, SLAs, common case types. -->
`;

    files["personas/service-manager.md"] = `${frontmatter({
      title: "Service manager — day in the life",
      personas: ["service_manager", "general"],
      summary: "Overview for support supervisors: queues, escalations, and team metrics.",
    })}# Service manager overview

<!-- TODO: Dashboards, escalation paths, SLA monitoring. -->
`;

    files["processes/case-handling.md"] = `${frontmatter({
      title: "Case handling process",
      personas: ["service_agent", "service_manager", "general"],
      summary: "How cases are logged, worked, escalated, and closed in this org.",
    })}# Case handling

<!-- TODO: End-to-end case lifecycle. Include SLA tiers if applicable. -->

## SLA tiers

<!-- TODO: Optional section — response/resolution targets in plain language. -->

## Related

<!-- TODO: Link to verified how-to/ files when you create them. Do not link to guides that do not exist yet. -->
`;

  }

  if (hasSales || hasService) {
    files["how-to/README.md"] = HOW_TO_README;
  }

  return files;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));

  if (existsSync(options.outputDir) && !options.force) {
    const hasContent =
      existsSync(join(options.outputDir, "README.md")) ||
      existsSync(join(options.outputDir, "glossary.md"));
    if (hasContent) {
      console.error(
        `Output directory already exists and contains guide files: ${options.outputDir}\nUse --force to overwrite individual files, or choose a different path.`
      );
      process.exit(1);
    }
  }

  mkdirSync(options.outputDir, { recursive: true });

  console.log(`Scaffolding org guide for ${options.clientName} (${options.slug})`);
  console.log(`  output: ${options.outputDir}`);
  console.log(`  teams: ${[...options.teams].join(", ") || "(none — general only)"}`);

  const files = buildFiles(options);
  for (const [relativePath, content] of Object.entries(files)) {
    writeFile(options, relativePath, content);
  }

  if (options.gitInit) {
    if (!existsSync(join(options.outputDir, ".git"))) {
      execSync("git init -b main", { cwd: options.outputDir, stdio: "inherit" });
      console.log("  git: initialized main branch");
    } else {
      console.log("  git: already initialized, skipped");
    }
  }

  console.log("");
  console.log("Next steps:");
  console.log("  1. Fill in TODO sections from the live org — never invent steps or labels");
  console.log("  2. Add how-to/ files only after verifying tasks in Salesforce");
  console.log("  3. Remove unused persona/process files if a team does not apply");
  console.log("  4. Run the pre-index checklist in the runbook");
  console.log("  5. Do not index until content is verified (wrong guides harm users)");
  console.log(`  6. Create GitHub repo bls-org-docs/${options.slug} and push`);
  console.log("");
  console.log("Suggested commands:");
  if (!options.gitInit) {
    console.log(`  cd ${options.outputDir} && git init -b main`);
  } else {
    console.log(`  cd ${options.outputDir}`);
  }
  console.log(`  git add . && git commit -m "Initial org guide scaffold for ${options.clientName}"`);
  console.log(`  git remote add origin git@github.com:bls-org-docs/${options.slug}.git`);
  console.log("  git push -u origin main");
}

main();
