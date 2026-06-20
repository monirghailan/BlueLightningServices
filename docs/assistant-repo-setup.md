# Org Guide GitHub Repo — Setup & Chatbot Readiness

This document is for **Blue Lightning Services (BLS) admins** who create and maintain per-customer documentation repos. Each repo powers the **Portal Assistant**: a chatbot that answers non-technical Salesforce questions for logged-in client users.

Complete this checklist **before** linking a repo in Supabase and triggering indexing.

---

## What you are building

For each onboarded client you create a **private GitHub repo** containing plain-English guides about *their* Salesforce org — not generic Salesforce help. The assistant indexes this repo, retrieves relevant sections at question time, and answers with citations.

**Target users:** sales reps, sales managers, service agents, service managers, and general/product-owner roles — all non-technical.

**Not in scope for repo content:** metadata XML, Apex, admin Setup instructions, or “how to build flows.” Point those questions to BLS support / portal tickets.

---

## Personas the chatbot understands

Each portal user has an **`assistant_persona`**. Docs should be tagged so the right people see the right content.

| Persona | Who picks this | What to write for them |
|---|---|---|
| `sales_rep` | AEs, BDRs, SDRs | Day-to-day selling: leads, opportunities, activities, quotes |
| `sales_manager` | Sales team leads | Pipeline reviews, forecasts, approvals, team dashboards |
| `service_agent` | Support / case handlers | Cases, knowledge articles, customer comms, SLAs |
| `service_manager` | Support supervisors | Queues, escalations, team metrics, SLA oversight |
| `general` | Product owners, RevOps, mixed roles | End-to-end processes, business rules, glossary, “how our org works” |

**Manager inheritance:** `sales_manager` users also see `sales_rep` docs; `service_manager` also sees `service_agent` docs. Tag manager-only content explicitly (see frontmatter below).

---

## Step 1 — Create the GitHub repo

### Naming & location

- [ ] Create under the BLS GitHub org (recommended): `bls-org-docs/{client-slug}`
- [ ] Use the same **slug** as the Supabase organization (e.g. `acme-corp`)
- [ ] Set visibility to **Private**
- [ ] Default branch: **`main`**
- [ ] Add a short repo description: `Org guide for {Client Name} — BLS Portal Assistant`

### Access

- [ ] Ensure the BLS indexing service account / PAT can **read** this repo (read-only is enough)
- [ ] Do **not** grant client users direct GitHub access unless you want them editing docs (optional future workflow)

### Initialise

**Recommended — use the BLS scaffold script** (creates folders, frontmatter, and TODO placeholders):

```bash
# From the BLS site repo root — writes to ./org-guides/acme-corp by default
npx tsx scripts/scaffold-org-guide.ts "Acme Corp" acme-corp

# Custom output path + git init + sales-only client
npx tsx scripts/scaffold-org-guide.ts "Acme Corp" acme-corp ./acme-corp --teams sales --git-init
```

Options: `--teams sales,service` (default both), `--git-init`, `--force` (overwrite existing files).

Then push to GitHub:

```bash
cd org-guides/acme-corp   # or your --output path
git add .
git commit -m "Initial org guide scaffold for Acme Corp"
git remote add origin git@github.com:bls-org-docs/acme-corp.git
git push -u origin main
```

<details>
<summary>Manual setup (without script)</summary>

```bash
mkdir bls-org-docs-acme-corp && cd bls-org-docs-acme-corp
git init -b main
# Copy scaffold from Section 2, then:
git add .
git commit -m "Initial org guide scaffold for Acme Corp"
git remote add origin git@github.com:bls-org-docs/acme-corp.git
git push -u origin main
```

</details>

---

## Step 2 — Required repo structure

Use this layout for **every** client repo. Consistency makes indexing and retrieval reliable.

```
/
├── README.md                      # Org overview (required)
├── CONTRIBUTING.md                # BLS internal writing rules (copy from Section 6)
├── personas/
│   ├── sales-rep.md
│   ├── sales-manager.md
│   ├── service-agent.md
│   └── service-manager.md
├── processes/
│   ├── lead-to-opportunity.md
│   ├── case-handling.md
│   └── quoting.md                 # Add/remove per client
├── objects/
│   ├── account.md
│   ├── contact.md
│   ├── lead.md
│   ├── opportunity.md
│   ├── case.md
│   └── custom/                    # Verified custom objects only (see README there)
│       └── README.md
├── how-to/
│   └── README.md                  # Add verified task guides here — not scaffolded
├── knowledge/                     # Optional: pasted SF Knowledge exports
│   └── ...
├── faq.md
└── glossary.md
```

### Minimum viable repo (first index)

Before first hook-up, you need at least:

- [ ] `README.md` — org overview (verified facts only)
- [ ] `glossary.md` — client-specific terms and tab names from the live org
- [ ] `faq.md` — real questions users ask (no invented answers)
- [ ] **Verified how-to guides** — add under `how-to/` only after walking through tasks in the org (the scaffold does **not** create how-to files with steps)
- [ ] **Persona files** for teams they actually have (skip unused personas)

**Do not index** placeholder or AI-invented steps. Wrong guides are worse than empty guides.

---

## Step 3 — Frontmatter (required on every guide)

Every markdown file **except** `README.md` and `CONTRIBUTING.md` should start with YAML frontmatter. The indexer uses this for persona filtering and display titles.

### Template

```yaml
---
title: How to create a lead
personas: [sales_rep, general]
summary: Step-by-step for creating a new lead from the Leads tab.
last_reviewed: 2026-06-20
---
```

### Field rules

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Human-readable; shown in citations |
| `personas` | Yes | Array of persona keys or `all` for everyone |
| `summary` | Recommended | One sentence; helps retrieval match vague questions |
| `last_reviewed` | Recommended | ISO date; you maintain this manually |

### Persona tagging cheat sheet

```yaml
# Everyone
personas: all

# Sales IC only
personas: [sales_rep]

# Sales manager extras (IC content tagged sales_rep separately)
personas: [sales_manager]

# Shared sales content (rep + manager + general)
personas: [sales_rep, sales_manager, general]

# Service — same pattern
personas: [service_agent]
personas: [service_manager]
personas: [service_agent, service_manager, general]
```

- [ ] Never leave `personas` empty — defaults are unpredictable
- [ ] Prefer **specific tags** over `all` when content is role-specific
- [ ] Use `all` for glossary entries, org-wide process overviews, and FAQ items that apply to everyone

---

## Step 4 — Writing rules (chatbot-optimised)

These rules make answers accurate, grounded, and non-technical.

### Do

1. **Lead with what to click** — “Open the **Leads** tab → click **New**” not “Create a Lead record via the Lead object.”
2. **Use the client’s actual UI labels** — match what users see on screen (tab names, button labels, picklist values).
3. **One topic per file** — one how-to = one task (easier chunking and citation).
4. **Use numbered steps** for procedures (max ~8 steps per section; split long flows across linked files).
5. **Define jargon inline** — “Opportunity (a deal you’re trying to close)” on first mention.
6. **State prerequisites** — “You need access to the Sales app” or “Your manager must approve deals over £50k.”
7. **Include “What happens next”** — what the user should expect after completing steps.
8. **Cross-link related files** — `[Convert a lead](how-to/convert-a-lead.md)` using relative paths.
9. **Call out common mistakes** — short “If you don’t see X, check Y” blocks help the model handle follow-ups.
10. **Keep sentences short** — aim for plain language readable at ~Year 9 level.

### Don’t

1. **Don’t lead with API names** — put `(API: Lead.Status)` in a footnote or glossary, not the first sentence.
2. **Don’t document admin Setup** — no “create a validation rule in Setup”; say “ask your Salesforce admin” or open a BLS ticket.
3. **Don’t paste raw metadata XML or Apex** — the assistant targets end users, not developers.
4. **Don’t publish unverified how-to steps** — add `how-to/` files only after confirming UI labels in the live org. The scaffold does not create how-to files; invented steps get indexed and mislead users.
5. **Don’t combine unrelated topics** in one file — “Lead conversion AND quoting AND approvals” should be three files.
6. **Don’t use screenshots as the only instructions** — always include text steps; images are supplementary.
7. **Don’t reference “the old system”** without dates — confuses retrieval; archive outdated docs to an `archive/` folder (excluded from index if you add that later).
8. **Don’t duplicate the same content** in multiple files — link instead; duplicates cause conflicting citations.

### Ideal how-to structure

```markdown
---
title: How to escalate a case
personas: [service_agent, service_manager]
summary: When and how to escalate a case to Tier 2 or a manager.
last_reviewed: 2026-06-20
---

# How to escalate a case

Use this when the case needs specialist help or exceeds your authority (e.g. refund over £500).

## Before you escalate

- Confirm the customer’s account is verified
- Add notes summarising what you’ve already tried

## Steps

1. Open the **Case** record.
2. Click **Escalate** (top right).
3. Select **Reason for escalation** — pick the closest match.
4. Assign to **Tier 2 Queue**.
5. Click **Save**.
6. Tell the customer: “I’ve escalated this to our specialist team; you’ll hear back within 4 business hours.”

## If you don’t see Escalate

You may not have permission. Contact your team lead or log a ticket in the BLS portal.

## Related

- [Case handling process](../processes/case-handling.md)
- [SLA overview](../processes/case-handling.md#sla-tiers)
```

---

## Step 5 — Content to capture during client onboarding

When you onboard a client, gather this from discovery calls / shadowing sessions:

### Org context (→ `README.md`)

- [ ] Company name and what they use Salesforce for
- [ ] Which clouds / apps they use (Sales, Service, both)
- [ ] Named apps or console layouts users actually open
- [ ] Key custom objects and why they exist (business language)
- [ ] Integrations users care about (e.g. “quotes sync to ERP”) — high level only

### Per persona

- [ ] Top 5 tasks they perform daily
- [ ] Top 5 “how do I…?” questions they ask admins today
- [ ] Reports/dashboards managers use weekly
- [ ] Escalation paths and approval thresholds

### Glossary (→ `glossary.md`)

- [ ] Custom field labels that confuse people
- [ ] Internal project names mapped to Salesforce objects
- [ ] Picklist values that matter (“Stage = Proposal means pricing is sent”)

### FAQ (→ `faq.md`)

- [ ] Real questions from users — use their exact phrasing in `## Question` headings
- [ ] Short answers with links to full how-to guides

---

## Step 6 — Copy into each repo: `CONTRIBUTING.md`

Copy this file into every client repo so future editors (including you) stay consistent.

```markdown
# Contributing to this org guide

This repo powers the BLS Portal Assistant. Write for non-technical Salesforce users.

## Rules

1. Every guide needs YAML frontmatter with `title` and `personas`.
2. Use UI labels from the live org, not API names in headings.
3. One task per how-to file.
4. No Setup/admin instructions — end-user steps only.
5. Update `last_reviewed` when you change a file.

## Personas

- sales_rep, sales_manager, service_agent, service_manager, general
- Use `all` only for org-wide content

## Folders

- personas/ — role-specific “day in the life” overviews
- processes/ — end-to-end business flows
- objects/ — what each record type means *in this org*
- how-to/ — step-by-step tasks
- knowledge/ — optional pasted Knowledge articles
- faq.md, glossary.md — shared reference
```

---

## Step 7 — Pre-index quality checklist

Run through this **before** connecting the repo to Supabase / triggering index.

### Structure

- [ ] All required folders exist (or unused persona files removed intentionally)
- [ ] No empty markdown files (delete or fill stubs)
- [ ] `README.md` explains the org in under 500 words
- [ ] `glossary.md` has at least 10 client-specific terms

### Frontmatter

- [ ] Every guide file has valid YAML frontmatter
- [ ] Every `personas` value uses allowed keys: `sales_rep`, `sales_manager`, `service_agent`, `service_manager`, `general`, or `all`
- [ ] No typos in persona keys (indexer will not match `sales-rep` vs `sales_rep`)

### Content quality

- [ ] Each active persona has at least **2 dedicated how-to guides**
- [ ] Each how-to has numbered steps and a “If you don’t see…” fallback
- [ ] FAQ uses real user phrasing
- [ ] No duplicate procedures across files (merge or cross-link)
- [ ] No confidential data (passwords, API keys, personal customer data)

### Links & maintenance

- [ ] Relative links between files work on GitHub preview
- [ ] `last_reviewed` dates set on all guides
- [ ] Outdated pages moved to `archive/` or deleted

### Smoke test (manual)

Read five questions aloud as if you were a client user. Confirm an answer exists in the repo:

| Example question | Expected source file |
|---|---|
| How do I create a lead? | `how-to/create-a-lead.md` |
| What does Stage X mean? | `glossary.md` or `objects/opportunity.md` |
| How do I escalate a case? | `how-to/escalate-a-case.md` |
| How does our lead-to-close process work? | `processes/lead-to-opportunity.md` |
| Where is my team’s pipeline? | `personas/sales-manager.md` or how-to |

If any question has no good source file, **add content before indexing**.

---

## Step 8 — Hook up to the Portal Assistant (after repo is ready)

1. [ ] In Supabase `organizations` row for the client, set:
   - `github_repo_url` — e.g. `https://github.com/bls-org-docs/acme-corp`
   - `github_default_branch` — `main`
   - `assistant_enabled` — `true` (set automatically after first successful index)
2. [ ] Set env vars on Vercel / `.env.local`:
   - `OPENAI_API_KEY` — embeddings + chat
   - `GITHUB_PAT` — read access to the org guide repo
   - `ASSISTANT_REINDEX_SECRET` — optional, for scripted re-index
   - `GITHUB_WEBHOOK_SECRET` — optional, for push webhook re-index
3. [ ] Run initial index:

```bash
npx tsx scripts/index-org-guide.ts acme-corp
```

4. [ ] Confirm `assistant_last_indexed_at` updates in Supabase
5. [ ] Invite test users with each persona; verify suggested prompts and answers at `/portal/assistant`
6. [ ] Portal admins can re-index from **Settings → Re-index org guide**

### After go-live

- [ ] Configure GitHub webhook on the guide repo → `POST /api/portal/assistant/webhook` (optional)
- [ ] Re-index when you push meaningful doc changes
- [ ] Review unanswered questions monthly and expand FAQ/how-to
- [ ] Refresh `last_reviewed` dates at least quarterly per client
- [ ] When the org changes, update guide content manually and re-index

---

## How content stays accurate (manual guides only)

There is **no Salesforce metadata mirror** and **no automated metadata sync**. You maintain accuracy by:

1. Writing and updating markdown in **`bls-org-docs/{slug}`** yourself (or from your own notes/process)
2. Pushing to GitHub
3. Re-indexing the guide repo (`index-org-guide.ts` or Settings → Re-index)

The chatbot indexes **only** published markdown in the org guide repo — not XML, not `_internal/`, not `_drafts/`.

---

## Common mistakes

| Mistake | Why it hurts | Fix |
|---|---|---|
| Generic Salesforce docs | Assistant hallucinates or gives wrong org-specific steps | Only document *this* client’s org |
| Missing frontmatter | Content may not reach the right persona or index poorly | Add YAML to every guide |
| One giant README | Poor chunking; citations point to vague blobs | Split into how-to / processes |
| API-first language | Non-technical users don’t understand answers | UI labels first, API in glossary |
| Stale content after org changes | Wrong answers erode trust | Update guides manually in `bls-org-docs`; re-index |

---

## Quick reference — persona → folder emphasis

| Persona | Priority folders |
|---|---|
| `sales_rep` | `how-to/` (sales tasks), `objects/lead.md`, `objects/opportunity.md`, `personas/sales-rep.md` |
| `sales_manager` | `personas/sales-manager.md`, `processes/` (pipeline), manager sections in processes |
| `service_agent` | `how-to/` (cases), `objects/case.md`, `personas/service-agent.md` |
| `service_manager` | `personas/service-manager.md`, `processes/case-handling.md` (SLA/queues) |
| `general` | `README.md`, `processes/`, `glossary.md`, `faq.md`, `objects/` overviews |

---

## Revision history

| Date | Change |
|---|---|
| 2026-06-20 | Initial BLS admin runbook for Portal Assistant org guides |
| 2026-06-20 | Guides-only model — manual content in `bls-org-docs`; no metadata mirror |
