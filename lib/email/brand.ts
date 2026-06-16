import { site } from "@/lib/content";
import { getPortalBaseUrl } from "@/lib/portal/url";

export const emailBrand = {
  name: site.name,
  tagline: site.tagline,
  supportEmail: site.email,
  portalUrl: `${getPortalBaseUrl()}/portal`,
  logoUrl: `${site.url}/logo.svg`,
  colors: {
    background: "#0a0f1a",
    surface: "#111827",
    text: "#1f2937",
    muted: "#6b7280",
    border: "#e5e7eb",
    accent: "#3d7cb8",
    accentHover: "#2f6699",
    onAccent: "#ffffff",
  },
} as const;
