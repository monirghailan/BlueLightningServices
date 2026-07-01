import { hero, navLinks, portalLanding, services, site } from "@/lib/content";
import { pageUrl } from "@/lib/seo";

const marketingPages = [
  { path: "/", description: hero.headline },
  { path: "/how-it-works", description: "Audit, transition, deliver, and operate — how we assume Salesforce engineering ownership." },
  { path: "/services", description: "LWC, Apex, Flow, integrations, Agentforce, architecture, and managed releases." },
  { path: "/why-us", description: "Function ownership with agentic AI delivery and senior expert review." },
  { path: "/pricing", description: "Transparent monthly pricing for full Salesforce engineering capacity." },
  { path: "/contact", description: "Book a free team audit or send a message." },
  { path: "/insights", description: "Salesforce engineering insights on managed services and engineering ownership." },
  { path: "/privacy", description: "Privacy policy and data handling." },
  { path: "/portal", description: `${portalLanding.headline} Features: ${portalLanding.features.map((f) => f.title).join(", ")}.` },
] as const;

export function buildLlmsTxt(): string {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.tagline} ${hero.subhead}`,
    "",
    "## Primary pages",
    "",
    ...marketingPages.map(
      (page) => `- [${page.path === "/" ? "Home" : page.path.slice(1).replace(/-/g, " ")}](${pageUrl(page.path)}): ${page.description}`,
    ),
    "",
    "## Services",
    "",
    ...services.map((service) => `- ${service.title}: ${service.description}`),
    "",
    "## Navigation",
    "",
    ...navLinks.map((link) => `- ${link.label}: ${pageUrl(link.href)}`),
    "",
    `Contact: ${site.email}`,
    `Sitemap: ${pageUrl("/sitemap.xml")}`,
  ];

  return lines.join("\n");
}

export function buildSitemapMd(): string {
  const lines = [
    `# ${site.name} — sitemap`,
    "",
    site.tagline,
    "",
    "## Pages",
    "",
    ...marketingPages.map(
      (page) => `### ${page.path === "/" ? "Home" : page.path.slice(1).replace(/-/g, " ")}\n\n${page.description}\n\n${pageUrl(page.path)}`,
    ),
  ];

  return lines.join("\n\n");
}
