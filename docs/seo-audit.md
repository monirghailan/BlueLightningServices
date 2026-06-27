# SEO & AI Discoverability — Implementation Checklist

Site: https://bluelightningservices.com

## Post-implementation verification

### Metadata & canonical URLs

- [ ] Each marketing URL has unique `title`, `description`, and `alternates.canonical`
- [ ] Open Graph `url` matches the page being shared (test `/pricing`, `/services`, `/contact`)
- [ ] Homepage canonical is `https://bluelightningservices.com`

**How to verify:** View page source or use [Meta Tags debugger](https://metatags.io/) with each URL.

### Structured data

- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) passes for homepage (Organization, WebSite, ProfessionalService, FAQPage)
- [ ] Rich Results Test passes for `/services` (Service list + BreadcrumbList)
- [ ] Rich Results Test passes for `/pricing` (FAQPage + BreadcrumbList)

### Crawl control

- [ ] `/robots.txt` disallows `/api/`, `/portal/login`, authenticated portal routes, and invite links
- [ ] `/portal/login` HTML includes `noindex` (view source: `robots` meta)
- [ ] Public `/portal` landing is indexable — listed in sitemap, allowed in robots, has canonical + SoftwareApplication schema

### AI discoverability files

- [ ] `https://bluelightningservices.com/llms.txt` returns plain-text curated index
- [ ] `https://bluelightningservices.com/sitemap.md` returns markdown sitemap
- [ ] `https://bluelightningservices.com/sitemap.xml` includes `/insights` and `/portal`

### Google Search Console

1. Add property for `bluelightningservices.com`
2. Verify via HTML tag — set `GOOGLE_SITE_VERIFICATION` in Vercel env vars
3. Submit sitemap: `https://bluelightningservices.com/sitemap.xml`
4. Monitor **Pages** → confirm no unexpected `/portal/login` or `/portal/dashboard` URLs indexed
5. Use **URL Inspection** on `/`, `/pricing`, `/services` after deploy

### Social previews

- [ ] LinkedIn Post Inspector — share URL for `/pricing` shows correct title and OG URL
- [ ] X/Twitter Card Validator — summary_large_image renders

### Performance monitoring

- [ ] `@vercel/speed-insights` active in production (Vercel project → Speed Insights tab)

## Scorecard (after implementation)

| Category | Before | After (target) |
|----------|--------|----------------|
| Metadata completeness | 5/10 | 9/10 |
| Structured data | 3/10 | 8/10 |
| Crawl control | 4/10 | 9/10 |
| Content depth | 5/10 | 7/10 |
| AI discoverability | 2/10 | 7/10 |
| Performance monitoring | 3/10 | 7/10 |

## Notes on AI SEO

- AI search crawlers (GPTBot, ClaudeBot, PerplexityBot) read HTML directly — structured data and crawlable text matter most.
- `llms.txt` is B2A infrastructure for AI agents; it is not a proven ranking factor for AI search citations.
- Long-term visibility also depends on external mentions, backlinks, and topical content (`/insights`).
