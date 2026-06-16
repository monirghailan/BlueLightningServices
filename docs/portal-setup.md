# Client Portal Setup

The portal is served at **`https://bluelightningservices.com/portal`** on the main site (no subdomain required).

## 1. Supabase

1. Create a Supabase project.
2. Run migrations via the SQL editor or Supabase CLI:
   - [`supabase/migrations/20250614000000_portal_schema.sql`](../supabase/migrations/20250614000000_portal_schema.sql)
   - [`supabase/migrations/20250616000000_leads.sql`](../supabase/migrations/20250616000000_leads.sql)
3. Copy URL, anon key, and service role key into `.env.local`.

## 2. Jira service account

1. Create an Atlassian API token for a dedicated bot user.
2. Grant the user access to project **KAN** with permission to create issues, rank issues (Schedule Issues), and move issues on boards.
3. Set `JIRA_*` env vars in Vercel.

## 3. Provision a client organization

```bash
npx tsx scripts/provision-org.ts "Acme Corp" acme-corp admin@acme.com
```

This creates:

- Jira label `client-acme-corp` (native **Labels** field) on each ticket
- Filtered Kanban board scoped to that client label
- Supabase `organizations` row
- Admin invitation URL (also emailed if Resend is configured)

Example invite link: `https://bluelightningservices.com/portal/invite/{token}`

## 4. Vercel domain

In Vercel → Project → Settings → Domains, add:

- `bluelightningservices.com`
- `www.bluelightningservices.com`

No separate portal subdomain is required. Share **`/portal`** with clients as the entry point.

### Optional: portal subdomain

If you later add `portal.bluelightningservices.com` in Vercel/DNS, middleware redirects its root (`/`) to `/portal` so both URLs work. The canonical URL for invites and documentation should remain **`bluelightningservices.com/portal`**.

## 5. Portal env vars (Vercel)

See [`.env.example`](../.env.example) for the full list. Required for production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
- `PORTAL_BASE_URL` — set to `https://bluelightningservices.com` (site origin only, no `/portal` suffix)
- `PORTAL_INVITE_SECRET`
- `RESEND_API_KEY` (for invite emails)
- `CRON_SECRET` (for qualified-lead auto-provisioning — see [leads.md](./leads.md))

If `PORTAL_BASE_URL` is unset, invite links fall back to `site.url` from [`lib/content.ts`](../lib/content.ts) (`https://bluelightningservices.com`).

## Website leads

See [leads.md](./leads.md) for contact form → Supabase workflow and qualifying leads for portal onboarding.

## Routes

| Route | Purpose |
|-------|---------|
| `/portal` | Dashboard |
| `/portal/backlog` | Prioritize backlog + move to/from board |
| `/portal/tickets` | All tickets |
| `/portal/tickets/new` | Create ticket |
| `/portal/team` | Admin: invite & manage users |
| `/portal/settings` | Admin: org info |
