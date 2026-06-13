# Blue Lightning Services — Website

Modern marketing site for [bluelightningservices.com](https://bluelightningservices.com).

**Tagline:** Your Salesforce team. Rebuilt with AI.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion + React Three Fiber (3D logo)
- Resend (email) + Google Sheets (lead log)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. See `docs/google-apps-script.md` for Sheet setup.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy

## DNS migration (GoDaddy → Vercel)

After deploying on Vercel:

1. In Vercel → Project → Settings → Domains, add `bluelightningservices.com` and `www.bluelightningservices.com`
2. In GoDaddy DNS, update records to match Vercel instructions:
   - **A record** `@` → Vercel IP (or CNAME to `cname.vercel-dns.com`)
   - **CNAME** `www` → `cname.vercel-dns.com`
3. Wait for DNS propagation (up to 48 hours)
4. Retire GoDaddy Website Builder once the new site is live
5. Submit sitemap in Google Search Console: `https://bluelightningservices.com/sitemap.xml`

## Redirects

Old URLs are redirected in `next.config.ts`:

- `/managed-services` → `/services`
- `/contact-us` → `/contact`
