# Daily Outreach Research — Cursor Automation

Scheduled agent run: discover prospects, write draft copy to Google Sheet. **No sending.**

## Create the automation

1. Open **Cursor → Automations → New automation**
2. Use the settings below (or ask in chat: *"Open the BLS daily outreach automation draft"*)

### Name

`BLS Daily Outreach Research`

### Description

Research BLS ICP prospects, append rows with email and LinkedIn draft copy to the outreach Google Sheet. User sends all outreach manually.

### Trigger

**On a schedule** — weekdays at 8:00 AM:

```
0 8 * * 1-5
```

### Tools

- **Use MCP server** — Google (Sheets read/append; no Gmail send)
- Browser (for company site research)

### Instructions (prompt)

```
You run the BLS cold outreach research workflow. Read these repo files first:
- lib/outreach/icp.ts
- lib/outreach/sheet-schema.ts
- lib/outreach/email-templates.ts
- lib/outreach/enrichment.ts
- data/outreach/do-not-contact.json
- .cursor/skills/cold-outreach/SKILL.md

OUTREACH_SHEET_ID: 1RDyi7CIR_MCPCVRsRukceIjTioScVgxDCHxkcsQIbc8
Sheet tab: BLS Outreach Prospects

Tasks:
1. Research 10 NEW prospects matching the BLS ICP (US/UK/Canada mid-market, Salesforce/RevOps titles).
2. Use Browser MCP for company sites — do NOT scrape LinkedIn at scale.
3. Check data/outreach/do-not-contact.json and skip blocked domains/emails/companies.
4. Dedup against existing Sheet rows (domain + email).
5. For each prospect, write personalized email_subject, email_body, linkedin_connection_note (≤300 chars), linkedin_dm.
6. Append rows via Google MCP with email_status and linkedin_status = draft_ready.
7. Summarize: company, contact, pain_hypothesis, icp_score for each new row.

HARD RULES:
- NEVER call sendEmail, sendDraft, or any send action.
- NEVER set email_status to sent or linkedin_status to messaged/connected.
- NEVER offer to send outreach on the user's behalf.
```

Replace `REPLACE_WITH_YOUR_SPREADSHEET_ID` with `1RDyi7CIR_MCPCVRsRukceIjTioScVgxDCHxkcsQIbc8` before saving (already set in repo `lib/outreach/sheet-config.ts`).

## Prefill JSON (optional)

For agent-assisted setup, see [`.cursor/automations/bls-daily-outreach-research.workflow.json`](../.cursor/automations/bls-daily-outreach-research.workflow.json).

## After each run

1. Open the Sheet and review new `draft_ready` rows.
2. Send outreach manually; update statuses yourself.

## Ad-hoc runs

In chat (no automation required):

- *"Find 10 prospects in healthcare with Salesforce and add to outreach sheet"*
- *"Redraft the email for row 5 — shorter, mention their job post"*
- *"Draft follow-ups for rows where email_status is sent and last_touch > 5 days ago"*
