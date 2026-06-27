import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

const marketingRoutes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/how-it-works", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/services", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/why-us", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/portal", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/insights", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${site.url}${path}`,
    lastModified: new Date("2026-06-27"),
    changeFrequency,
    priority,
  }));
}
