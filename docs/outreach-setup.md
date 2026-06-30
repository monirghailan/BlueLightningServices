# Cold Outreach Setup (BLS)

Cursor automates **prospect research and draft copy only**. You send every email and LinkedIn message manually.

## Quick start

1. **Sheet is live** — [BLS Outreach CRM](https://docs.google.com/spreadsheets/d/1RDyi7CIR_MCPCVRsRukceIjTioScVgxDCHxkcsQIbc8/edit) (ID in `lib/outreach/sheet-config.ts`).
2. Ensure **Google MCP** (`mcp-google`) is connected in Cursor Settings → MCP.
3. **On-demand run:**
   ```bash
   npm run outreach:run
   ```
   Paste the printed prompt into Cursor chat (starts with `/cold-outreach`).
4. Review drafts in the Sheet; send manually; update statuses yourself.

## Google Sheet CRM

### Create the spreadsheet

1. Create a new Google Sheet named **BLS Outreach CRM**.
2. Add tab **BLS Outreach Prospects** with row 1 headers (exact order):

```
id | discovered_at | company | domain | contact_name | title | email | linkedin_url | source | icp_score | pain_hypothesis | email_subject | email_body | linkedin_connection_note | linkedin_dm | email_status | linkedin_status | last_touch | notes
```

3. Add tab **Do Not Contact** with headers:

```
domain | email | company | reason | added_at
```

Or import the CSV template:

```bash
# Headers only — import into Google Sheets
cat scripts/outreach/sheet-template.csv
```

4. Copy the spreadsheet ID from the URL — or use the committed config in [`lib/outreach/sheet-config.ts`](../lib/outreach/sheet-config.ts) (`1RDyi7CIR_MCPCVRsRukceIjTioScVgxDCHxkcsQIbc8`).

5. Store it where the agent can read it:
   - Already in `lib/outreach/sheet-config.ts`, or
   - Set `OUTREACH_SHEET_ID` in `.env.local` (gitignored) for local scripts

**Live sheet:** [BLS Outreach CRM](https://docs.google.com/spreadsheets/d/1RDyi7CIR_MCPCVRsRukceIjTioScVgxDCHxkcsQIbc8/edit)

### Column reference

| Column | Who writes | Purpose |
|--------|------------|---------|
| `email_subject`, `email_body` | Cursor | Copy into your mail client |
| `linkedin_connection_note` | Cursor | ≤300 chars — paste on connect request |
| `linkedin_dm` | Cursor | Paste after connection accepted |
| `email_status`, `linkedin_status` | **You** | Track manual outreach |
| `last_touch`, `notes` | **You** | Manual tracking |

### Status values

**email_status:** `draft_ready` → `sent` → `replied` / `no_response` / `opted_out`

**linkedin_status:** `draft_ready` → `connected` → `messaged` → `replied`

Cursor sets new rows to `draft_ready` only. Cursor never sets `sent` or `messaged`.

## Google MCP auth

1. Open **Cursor Settings → MCP**
2. Enable **Google** (`user-mcp-google`)
3. Complete OAuth when prompted
4. Test in chat: *"List my spreadsheets"* or *"Read the BLS Outreach Prospects tab"*

The agent uses `readSpreadsheet`, `appendRows`, and `batchWrite` — never `sendEmail` or `sendDraft`.

## Do-not-contact list (repo)

Committed exclusions live in [`data/outreach/do-not-contact.json`](../data/outreach/do-not-contact.json). The agent checks this before adding prospects.

Add entries for clients, competitors, and opted-out contacts:

```json
{
  "entries": [
    { "domain": "competitor.com", "reason": "Competitor", "added_at": "2026-06-30" }
  ]
}
```

Mirror important exclusions in the Sheet **Do Not Contact** tab for visibility.

## Enrichment

**Default tier: browser-only** — no paid API required. See [`lib/outreach/enrichment.ts`](../lib/outreach/enrichment.ts).

**Optional: Apollo.io or Clay CSV**

Export contacts from Apollo/Clay, then:

```bash
npm run outreach:import-csv -- ~/Downloads/apollo-export.csv
```

Output: `apollo-export-outreach-ready.csv` — import or paste into the Sheet.

## Key files

| File | Purpose |
|------|---------|
| [`lib/outreach/icp.ts`](../lib/outreach/icp.ts) | ICP titles, signals, exclusions |
| [`lib/outreach/sheet-schema.ts`](../lib/outreach/sheet-schema.ts) | Sheet columns and statuses |
| [`lib/outreach/email-templates.ts`](../lib/outreach/email-templates.ts) | Draft scaffolds + copy rules |
| [`lib/outreach/enrichment.ts`](../lib/outreach/enrichment.ts) | Browser enrichment guidance |
| [`lib/outreach/do-not-contact.ts`](../lib/outreach/do-not-contact.ts) | Blocklist helpers |
| [`lib/outreach/sheet-config.ts`](../lib/outreach/sheet-config.ts) | Spreadsheet ID + URL |
| [`lib/outreach/run-prompt.ts`](../lib/outreach/run-prompt.ts) | Canonical chat prompt builder |
| [`scripts/outreach/run.ts`](../scripts/outreach/run.ts) | `npm run outreach:run` |
| [`.cursor/skills/cold-outreach/SKILL.md`](../.cursor/skills/cold-outreach/SKILL.md) | Agent workflow |
| [`docs/outreach-automation.md`](./outreach-automation.md) | Daily Cursor Automation setup |

## Manual outreach routine

1. Open the Sheet (or ask Cursor to summarize new `draft_ready` rows).
2. Edit draft cells if needed.
3. **Email:** copy `email_subject` + `email_body` → send from Gmail.
4. **LinkedIn:** paste `linkedin_connection_note` on connect; later paste `linkedin_dm`.
5. Update statuses and `last_touch` yourself.

## Compliance

- CAN-SPAM / GDPR: honest subject, identify yourself, honor opt-outs when you send.
- LinkedIn ToS: no automated connections or bulk bots — your manual workflow is correct.
- Verify guessed emails (noted in `notes`) before sending.

## Related

- Inbound leads: [`docs/leads.md`](./leads.md)
- LinkedIn content (not outreach): [`.cursor/skills/linkedin-video-script/SKILL.md`](../.cursor/skills/linkedin-video-script/SKILL.md)
