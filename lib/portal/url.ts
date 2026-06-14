import { site } from "@/lib/content";

/** Site origin for portal invite links (no trailing slash, no `/portal` path). */
export function getPortalBaseUrl(): string {
  const fromEnv = process.env.PORTAL_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return site.url;
}

export function portalInviteUrl(token: string): string {
  return `${getPortalBaseUrl()}/portal/invite/${token}`;
}
