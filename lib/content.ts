export const site = {
  name: "Blue Lightning Services",
  tagline: "Your Salesforce team. Rebuilt with AI.",
  email: "admin@bluelightningservices.com",
  url: "https://bluelightningservices.com",
} as const;

export const icp = {
  primary:
    "Mid-market B2B companies (100–1,000 employees) with an active Salesforce org, a 2–8 person Salesforce team, and a backlog that outpaces capacity.",
  buyer: "VP Engineering, CTO, COO, or Head of Business Systems",
} as const;

export const pricing = {
  monthly: 3999,
  annualEquivalent: 3499,
  annualUpfront: 41988,
  annualSavings: 6000,
  currency: "£",
  contractMonths: 12,
} as const;

export const hero = {
  headline: "Your entire Salesforce development team — without the headcount.",
  tagline: site.tagline,
  subhead:
    "Decades of Salesforce mastery. One partner that builds, ships, and maintains your org.",
  ctaPrimary: `Get started — from ${pricing.currency}${pricing.annualEquivalent.toLocaleString("en-GB")}/mo`,
  ctaSecondary: "See pricing",
} as const;

export const howItWorks = [
  {
    step: "01",
    title: "Audit",
    description:
      "Map your org, team roles, backlog, and annual spend to define scope and transition plan.",
  },
  {
    step: "02",
    title: "Transition",
    description:
      "Knowledge transfer with zero-drama handoff from in-house teams or existing vendors.",
  },
  {
    step: "03",
    title: "Deliver",
    description:
      "Agentic engineering pod ships on a fixed cadence with weekly releases and expert review.",
  },
  {
    step: "04",
    title: "Operate",
    description:
      "Ongoing monitoring, optimization, and roadmap ownership — we stay accountable.",
  },
] as const;

export const services = [
  {
    title: "LWC & Apex Development",
    description:
      "Custom Lightning Web Components, Apex services, triggers, and test coverage at scale.",
    icon: "code",
  },
  {
    title: "Flow & Automation",
    description:
      "Record-triggered and screen flows, approval processes, and declarative automation.",
    icon: "workflow",
  },
  {
    title: "Integrations",
    description:
      "REST, platform events, middleware, and bi-directional sync with your business systems.",
    icon: "plug",
  },
  {
    title: "Agentforce & Einstein",
    description:
      "AI agents, prompt templates, and Einstein features configured for production use.",
    icon: "bot",
  },
  {
    title: "Architecture & Governance",
    description:
      "Well-Architected reviews, security, FLS, sharing models, and release governance.",
    icon: "shield",
  },
  {
    title: "Managed Releases",
    description:
      "CI/CD pipelines, sandbox promotion, regression testing, and production deployments.",
    icon: "rocket",
  },
] as const;

export const differentiators = [
  {
    title: "Team replacement, not staff augmentation",
    description:
      "Fixed-scope managed engineering — not hourly bodies bolted onto your backlog.",
  },
  {
    title: "Agentic delivery stack",
    description:
      "AI-accelerated development with senior architectural guardrails on every release.",
  },
  {
    title: "Full lifecycle ownership",
    description:
      "Build, maintain, optimize, migrate Aura to LWC, release, and operate — end to end.",
  },
  {
    title: "3–5× delivery velocity",
    description:
      "Ship at a fraction of traditional team cost and cycle time — typically 60–80% lower than a 4-person in-house team.",
  },
] as const;

export const planIncludes = [
  "Backlog delivery: LWC, Apex, Flow, admin operations",
  "Fixed monthly engineering capacity with weekly release cadence",
  "Agentic AI-accelerated delivery with senior expert review",
  "Ongoing maintenance, optimization, and roadmap ownership",
] as const;

export const faqs = [
  {
    question: "What's included in £3,999/month?",
    answer:
      "Full Salesforce engineering capacity: development, admin ops, releases, and ongoing maintenance. See our Services page for capability detail.",
  },
  {
    question: "Is there a minimum contract?",
    answer:
      "Yes — a 12-month annual contract. Pay monthly at £3,999/mo, or £41,988 upfront for the year (£3,499/mo equivalent — save £6,000).",
  },
  {
    question: "Are you replacing our admin too?",
    answer:
      "We take on the full engineering function. Admins can transition to business-side roles, or we absorb operational work as part of the partnership.",
  },
  {
    question: "What about security and compliance?",
    answer:
      "Human-reviewed deployments, least-privilege access, and Salesforce Well-Architected standards on every change.",
  },
  {
    question: "How does AI fit in?",
    answer:
      "AI accelerates development, analysis, and test generation. Senior Salesforce experts own architecture, review, and every production release decision.",
  },
  {
    question: "What's the transition timeline?",
    answer:
      "Typical 2–4 week knowledge transfer before we assume full ownership of your Salesforce engineering function.",
  },
] as const;

export const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/services", label: "Services" },
  { href: "/why-us", label: "Why Us" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;
