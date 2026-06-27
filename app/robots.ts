import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/portal/login",
        "/portal/dashboard",
        "/portal/assistant",
        "/portal/settings",
        "/portal/tickets/",
        "/portal/invite/",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
