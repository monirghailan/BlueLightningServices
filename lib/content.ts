export const site = {
  name: "Blue Lightning Services",
  tagline: "Your Salesforce team. Rebuilt with AI.",
  email: "admin@bluelightningservices.com",
  url: "https://bluelightningservices.com",
} as const;

export const icp = {
  primary:
    "Mid-market B2B companies (100–1,000 employees) with an active Salesforce org, a 1–4 person Salesforce team, and a backlog that outpaces capacity.",
  buyer: "VP Engineering, CTO, COO, or Head of Business Systems",
} as const;

export const hero = {
  headline: "Your entire Salesforce development team — without the headcount.",
  tagline: site.tagline,
  subhead:
    "Decades of Salesforce mastery. One partner that builds, ships, and maintains your org.",
  ctaPrimary: "Get started",
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

export const portalLanding = {
  badge: "Included free with your Blue Lightning partnership",
  headline: "Ask your org anything. Get an answer in seconds.",
  subhead:
    "The client portal puts an AI assistant, living documentation, and delivery visibility in one place — free for every Blue Lightning client.",
  ctaPrimary: "Sign in to your portal",
  ctaSecondary: "Not a client yet?",
  demoDisclaimer:
    "Example conversation. Your portal is grounded in your organization's own guide.",
  stopDoing: [
    {
      title: "Answer the same Salesforce questions",
      description:
        "The Assistant gives plain-English answers grounded in your org guide, 24/7 — so reps and managers stop pinging admins and team leads.",
      savings: "Saves hours per week of interrupt-driven support.",
    },
    {
      title: "Maintain documentation",
      description:
        "Blue Lightning writes, updates, and indexes your org guide. Users get answers without hunting a wiki or outdated deck.",
      savings: "Saves BA or enablement headcount — or expensive doc projects.",
    },
    {
      title: "Chase delivery status",
      description:
        "Submit tickets, prioritize your backlog, and see live metrics. We manage execution — you stay in control of priorities.",
      savings: "Saves PM overhead and weekly status-meeting time.",
    },
  ] as const,
  features: [
    {
      title: "Portal Assistant",
      audience: "All users",
      description: "Instant answers in plain English, tailored to each user's role.",
    },
    {
      title: "Living org guide",
      audience: "All users",
      description: "Always-current documentation — maintained by Blue Lightning, not your team.",
    },
    {
      title: "Ticket submission",
      audience: "Administrators",
      description: "One place to request work. New items land in your prioritized backlog.",
    },
    {
      title: "Backlog prioritization",
      audience: "Administrators",
      description: "You decide what ships first. We deliver on a fixed weekly cadence.",
    },
    {
      title: "Delivery dashboard",
      audience: "Administrators",
      description: "Open and closed metrics, status mix, and average time to close.",
    },
    {
      title: "Team & personas",
      audience: "Administrators",
      description: "Invite colleagues and set roles so the Assistant shows the right guidance.",
    },
  ] as const,
  roi: {
    headline: "Time your team gets back",
    example:
      "50 Salesforce users × 2 \"how do I\" questions per week × 15 minutes each ≈ 25 hours per week of interrupt-driven support. The Assistant handles the repeatable majority instantly.",
    footnote:
      "Actual savings depend on org size and how much tier-1 support you currently absorb in-house.",
  },
  included: {
    headline: "No per-seat fee. No setup fee.",
    description:
      "Every Blue Lightning client gets the portal at no extra cost — Assistant, documentation, tickets, and delivery visibility included in your partnership.",
  },
  finalCta: {
    headline: "Ready to sign in?",
    subhead: "Use the email and password from your invitation. Need access? Contact us.",
    ctaPrimary: "Sign in to your portal",
    ctaSecondary: "Contact us",
  },
  demo: {
    persona: "Sales rep",
    defaultScenarioIndex: 2,
    scenarios: [
      {
        question: "How do I create a lead?",
        answer:
          "From the **Leads** tab, click **New**. Enter the person's name, company, and email — at minimum. Set **Lead Source** so reporting stays accurate, then click **Save**.\n\nIf the company already exists as an account, search first to avoid duplicates. The org guide lists required fields for your team.",
        source: "From your org guide",
      },
      {
        question: "How do I log a case?",
        answer:
          "Open the **Cases** tab and click **New**. Select the account or contact the case is for, enter a subject and description, and set **Status** to New.\n\nChoose the **Type** and **Reason** that best match the issue — your service team uses these for routing. Click **Save** and the case owner is assigned automatically.",
        source: "From your org guide",
      },
      {
        question: "How do I convert a lead?",
        answer:
          "Open the lead record and confirm the details are complete. Before you can convert, **Country**, **Website**, and **Number of Employees** must be filled in — conversion is blocked until all three are present.\n\nOnce those fields are set, click **Convert**. Choose an existing account or create a new one, add contact details if prompted, and optionally create an opportunity. Click **Convert** to finish.",
        source: "From your org guide",
      },
    ],
  },
  dashboardDemo: {
    orgName: "Acme Corp",
    disclaimer: "Example dashboard. Your portal shows live metrics from your organization's tickets.",
    stats: [
      { label: "Open tickets", value: 7, unit: "tickets" },
      { label: "Oldest open ticket", value: 3, unit: "days", hint: "KAN-142: Quote approval flow error" },
      { label: "Closed this month", value: 14, unit: "tickets" },
      { label: "Avg time to close this month", value: "1.8", unit: "business days" },
    ],
    byStatus: [
      { status: "To Do", count: 4 },
      { status: "In Progress", count: 3 },
      { status: "In Review", count: 2 },
      { status: "Done", count: 14 },
    ],
    byType: {
      Feature: 8,
      Bug: 5,
      Request: 6,
    },
    backlog: [
      { key: "KAN-201", summary: "Add discount field to quote screen", type: "Feature", priority: "High" },
      { key: "KAN-198", summary: "Fix duplicate contact trigger", type: "Bug", priority: "Medium" },
      { key: "KAN-195", summary: "Integrate billing API webhook", type: "Feature", priority: "Medium" },
    ],
  },
  loginReminder:
    "Your portal includes the Assistant, ticket management, and live delivery metrics — included with your partnership.",
} as const;
