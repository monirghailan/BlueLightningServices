import { faqs, portalLanding, services, site } from "@/lib/content";
import { pageUrl } from "@/lib/seo";

export type FaqItem = {
  question: string;
  answer: string;
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    email: site.email,
    description: site.tagline,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.tagline,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.tagline,
    url: site.url,
    email: site.email,
    priceRange: "£££",
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function faqPageJsonLd(items: FaqItem[] = [...faqs]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function serviceListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        provider: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
        },
        areaServed: "Worldwide",
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

export function portalProductJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${site.name} Client Portal`,
    url: pageUrl("/portal"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: portalLanding.subhead,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      description: portalLanding.included.description,
    },
    featureList: portalLanding.features.map(
      (feature) => `${feature.title} (${feature.audience}): ${feature.description}`,
    ),
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function siteStructuredDataGraph() {
  return [organizationJsonLd(), webSiteJsonLd(), professionalServiceJsonLd()];
}
