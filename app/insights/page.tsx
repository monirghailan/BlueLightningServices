import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CTASection } from "@/components/sections/CTASection";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  path: "/insights",
  title: "Insights",
  description:
    "Salesforce engineering insights on managed services, engineering ownership, and Agentforce delivery from Blue Lightning Services.",
});

const articles = [
  {
    id: "managed-salesforce-development",
    title: "Managed Salesforce development vs. staff augmentation",
    summary:
      "Why mid-market B2B companies outgrow hourly contractors — and what full engineering ownership looks like instead.",
    body: [
      "Staff augmentation adds bodies to your backlog. Managed Salesforce development owns the function: fixed capacity, weekly releases, and accountability for outcomes.",
      "If your org has a 1–4 person Salesforce team and a backlog that never shrinks, the bottleneck is usually ownership — not headcount. A managed partner owns architecture, releases, and roadmap delivery end to end.",
      "Blue Lightning combines agentic AI-accelerated development with senior expert review on every production change. You get 3–5× delivery velocity at a fraction of in-house team cost.",
    ],
  },
  {
    id: "transitioning-salesforce-engineering-ownership",
    title: "How to transition Salesforce engineering ownership without drama",
    summary:
      "A structured audit, transition, and operate model that de-risks knowledge transfer and keeps releases moving.",
    body: [
      "Transferring Salesforce engineering ownership fails when transition is treated as a handoff memo instead of a programme. We start with a free team audit: org map, roles, backlog, spend, and release cadence.",
      "Knowledge transfer typically runs 2–4 weeks before we assume full ownership. Admins can move to business-side roles; we absorb engineering, releases, and operational work.",
      "The goal is zero-drama continuity — your users keep shipping, your backlog keeps moving, and your leadership gets predictable monthly capacity instead of hiring cycles.",
    ],
  },
  {
    id: "agentforce-production-delivery",
    title: "Shipping Agentforce and Einstein to production safely",
    summary:
      "AI features need the same governance as Apex and Flow — with prompt templates, testing, and human review before go-live.",
    body: [
      "Agentforce and Einstein are production systems, not demos. They need sharing models, FLS, test coverage, and release governance like any other Salesforce capability.",
      "We configure agents, prompt templates, and Einstein features for real users — with Well-Architected reviews and human-reviewed deployments on every release.",
      "Agentic AI accelerates configuration and analysis; senior Salesforce architects own what reaches production. That split is how you move fast without breaking trust.",
    ],
  },
] as const;

export default function InsightsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ])}
      />
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Insights</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Practical perspectives on managed Salesforce engineering, engineering ownership, and agentic delivery.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-16 px-6 py-16">
        {articles.map((article) => (
          <article key={article.id} id={article.id} className="scroll-mt-24">
            <h2 className="text-2xl font-bold">{article.title}</h2>
            <p className="mt-3 text-muted">{article.summary}</p>
            <div className="mt-6 space-y-4 text-muted">
              {article.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}

        <p className="text-center text-sm text-muted">
          Ready to talk?{" "}
          <Link href="/contact" className="text-bolt-outline hover:text-bolt-glow">
            Book a free team audit
          </Link>{" "}
          or{" "}
          <Link href="/pricing" className="text-bolt-outline hover:text-bolt-glow">
            view pricing
          </Link>
          .
        </p>
      </div>

      <CTASection />
    </>
  );
}
