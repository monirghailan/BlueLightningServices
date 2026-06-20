# Agent handoff: Genie Shopping Portal Assistant setup

Use this doc to continue setup in a **new agent session**. Do not re-implement the Assistant feature — it is already built. Finish **Genie Shopping onboarding** only.

## What is already done

- **Portal Assistant feature** implemented (chat UI, RAG, personas, indexer, migration applied).
- **Supabase migration** `assistant_schema` applied on project **bls-portal** (`mquynlijvirpavrfgbnr`).
- **GitHub guide repo** created and scaffold pushed:
  - https://github.com/bls-org-docs/genie-shopping
  - Local clone: `org-guides/genie-shopping/` (gitignored from main site repo)
  - 23 markdown files with TODO placeholders + YAML frontmatter
- **`.env.local`** (partial): has `OPENAI_API_KEY`, `GITHUB_PAT` — missing Supabase keys for local index script.

## What is NOT done yet (6 steps)

### Step 1 — Portal org in Supabase

No `genie-shopping` organization row exists yet. Only org in DB:

| name | slug | id |
|---|---|---|
| testing company | testing-company | `68027f54-4363-49f3-8c36-080c8fdedd43` |

**Action:** Provision Genie Shopping (recommended):

```bash
npx tsx scripts/provision-org.ts "Genie Shopping" genie-shopping <admin@email.com>
```

Or link repo to `testing-company` temporarily for a trial.

---

### Step 2 — Link repo in Supabase

On the target `organizations` row, set:

| Column | Value |
|---|---|
| `github_repo_url` | `https://github.com/bls-org-docs/genie-shopping` |
| `github_default_branch` | `main` |

`assistant_enabled` becomes `true` automatically after first successful index.

---

### Step 3 — Complete `.env.local` for local indexing

Add (from Supabase → bls-portal → Settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mquynlijvirpavrfgbnr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Already present: `OPENAI_API_KEY`, `GITHUB_PAT`.

Also add `OPENAI_API_KEY` + `GITHUB_PAT` to **Vercel** env for production `/portal/assistant`.

---

### Step 4 — Fill guide content

Edit `org-guides/genie-shopping/` (or on GitHub). Minimum before index:

- [ ] `README.md` — org overview
- [ ] `glossary.md` — client-specific terms
- [ ] `faq.md` — 5–10 real questions
- [ ] 2–3 `how-to/*.md` with real UI click paths
- [ ] Remove unused persona/process files if sales-only or service-only

Push when ready:

```bash
cd org-guides/genie-shopping
git add . && git commit -m "Add Genie Shopping org content" && git push
```

Writing rules: [`docs/assistant-repo-setup.md`](./assistant-repo-setup.md)

---

### Step 5 — First index

```bash
npx tsx scripts/index-org-guide.ts genie-shopping
```

Or portal admin → **Settings → Re-index org guide**.

Requires: `OPENAI_API_KEY`, `GITHUB_PAT`, `SUPABASE_SERVICE_ROLE_KEY`.

---

### Step 6 — Test

1. Log in at `/portal` as user on that org
2. Open `/portal/assistant`
3. Pick persona, ask a documented question
4. Confirm citations / “not in guide yet” for unknown topics

---

## Key references

| Item | Path / URL |
|---|---|
| Setup runbook | [`docs/assistant-repo-setup.md`](./assistant-repo-setup.md) |
| Scaffold script | `scripts/scaffold-org-guide.ts` |
| Index script | `scripts/index-org-guide.ts` |
| Provision org | `scripts/provision-org.ts` |
| Chat API | `app/api/portal/chat/route.ts` |
| Indexer | `lib/assistant/index-repo.ts` |
| Migration (local file) | `supabase/migrations/20250620000000_assistant_schema.sql` |

## GitHub structure reminder

- **`bls-org-docs/genie-shopping`** → `github_repo_url` — org guide the assistant indexes
- You maintain guide markdown **manually**; re-index after meaningful updates

## Personas (for test users)

` sales_rep | sales_manager | service_agent | service_manager | general `

Set at Team invite or on first Assistant visit.

## Optional later

- `ASSISTANT_REINDEX_SECRET` — scripted re-index
- `GITHUB_WEBHOOK_SECRET` + webhook → `/api/portal/assistant/webhook`

## Suggested first message for new agent session

```
Continue Genie Shopping Portal Assistant onboarding using docs/agent-handoff-genie-shopping-assistant.md.
Complete steps 1–6. Admin email for provision-org: <YOUR_EMAIL>.
```

Replace `<YOUR_EMAIL>` before sending.
