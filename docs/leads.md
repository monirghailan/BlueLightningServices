# Website Leads

Contact form submissions are stored in Supabase (`leads` table). Email (Resend) and Google Sheets remain as parallel notifications.

## Setup

1. Run the leads migration after the portal schema migration:
   - [`supabase/migrations/20250616000000_leads.sql`](../supabase/migrations/20250616000000_leads.sql)
2. Set `CRON_SECRET` in Vercel (required for qualified-lead auto-provisioning).
3. Ensure existing contact env vars are set: `RESEND_API_KEY`, `GOOGLE_SHEET_WEBHOOK_URL`, `CONTACT_WEBHOOK_SECRET`.

## Lead status values

| Status | Meaning |
|--------|---------|
| `New` | Just submitted (default) |
| `Contacted` | Initial outreach done |
| `In Progress` | Active conversation |
| `Not Qualified` | Not a fit |
| `Qualified` | Ready for client onboarding — triggers auto-provisioning |
| `Parked` | On hold |

## Managing leads in Supabase

1. Open your Supabase project → **Table Editor** → `leads`.
2. Review new submissions (`status = New`).
3. Update `status` as you work the lead.

### Marking a lead Qualified

When you set `status` to **Qualified**:

1. A row is added to `lead_provisioning_jobs`.
2. Vercel Cron runs every minute and processes the queue.
3. Within ~1 minute the system will:
   - Create Jira filter and Kanban board for the client (scoped by **Client** label)
   - Create a Supabase `organizations` row (org name = `company`, slug derived from company name)
   - Send a portal admin invite email to the lead's `email`
4. On success, `leads.organization_id` and `leads.provisioned_at` are populated.

**Before qualifying**, confirm:

- `company` is the desired client organization name
- `email` is the correct admin contact for the portal invite

If provisioning already ran (`organization_id` is set), changing status again will not re-provision.

## Troubleshooting failed provisioning

Check these columns/tables:

- `leads.provisioning_error` — last error message
- `lead_provisioning_jobs.error` — error on the job
- `lead_provisioning_jobs.attempt_count` — retries stop after 5 attempts

Common causes: Jira API misconfiguration, duplicate slug edge cases, Resend not configured.

To retry after fixing the issue, clear `lead_provisioning_jobs.processed_at` and reset `attempt_count` to `0` for that lead (or delete the job row and set status away from Qualified then back to Qualified).

Manual provisioning is still available:

```bash
npx tsx scripts/provision-org.ts "Acme Corp" acme-corp admin@acme.com
```

## Data flow

```
Contact form → /api/contact → leads (Supabase)
                           → Resend email
                           → Google Sheets webhook

Supabase dashboard: status → Qualified
  → lead_provisioning_jobs (trigger)
  → Vercel Cron → Jira + organization + invite email
```
