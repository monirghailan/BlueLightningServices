import {
  differentiators,
  faqs,
  howItWorks,
  portalLanding,
  services,
  site,
} from "@/lib/content";

export type WebsiteTopic = {
  id: string;
  title: string;
  body: string;
  pagePath: string;
  category: "service" | "differentiator" | "how_it_works" | "faq" | "portal";
};

export function getWebsiteTopics(): WebsiteTopic[] {
  const topics: WebsiteTopic[] = [];

  for (const service of services) {
    topics.push({
      id: `service:${service.title}`,
      title: service.title,
      body: service.description,
      pagePath: "/services",
      category: "service",
    });
  }

  for (const item of differentiators) {
    topics.push({
      id: `differentiator:${item.title}`,
      title: item.title,
      body: item.description,
      pagePath: "/why-us",
      category: "differentiator",
    });
  }

  for (const step of howItWorks) {
    topics.push({
      id: `how_it_works:${step.title}`,
      title: step.title,
      body: step.description,
      pagePath: "/how-it-works",
      category: "how_it_works",
    });
  }

  for (const faq of faqs) {
    topics.push({
      id: `faq:${faq.question}`,
      title: faq.question,
      body: faq.answer,
      pagePath: "/",
      category: "faq",
    });
  }

  for (const feature of portalLanding.features) {
    topics.push({
      id: `portal:${feature.title}`,
      title: feature.title,
      body: `${feature.description} (${feature.audience})`,
      pagePath: "/portal",
      category: "portal",
    });
  }

  for (const item of portalLanding.stopDoing) {
    topics.push({
      id: `portal_stop:${item.title}`,
      title: item.title,
      body: `${item.description} ${item.savings}`,
      pagePath: "/portal",
      category: "portal",
    });
  }

  topics.push({
    id: "site:tagline",
    title: site.tagline,
    body: `${site.name} — ${site.tagline}. Managed Salesforce engineering for mid-market B2B teams.`,
    pagePath: "/",
    category: "differentiator",
  });

  return topics;
}

export function formatWebsiteTopicForPrompt(topic: WebsiteTopic): string {
  return `Topic: ${topic.title}\nCategory: ${topic.category}\nDetails: ${topic.body}`;
}
