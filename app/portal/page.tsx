import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPortalSession, getPortalHomePath } from "@/lib/portal/auth";
import { buildPageMetadata } from "@/lib/seo";
import { PortalLandingPage } from "@/components/portal/PortalLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, portalProductJsonLd } from "@/lib/structured-data";

const portalDescription =
  "Free client portal for Blue Lightning partners: AI assistant grounded in your org guide, living documentation, ticket submission, backlog prioritization, and delivery dashboard.";

export const metadata: Metadata = buildPageMetadata({
  path: "/portal",
  title: "Client Portal",
  description: portalDescription,
});

export default async function PortalEntryPage() {
  const session = await getPortalSession();
  if (session) {
    redirect(getPortalHomePath(session.role));
  }

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Client Portal", path: "/portal" },
          ]),
          portalProductJsonLd(),
        ]}
      />
      <PortalLandingPage />
    </>
  );
}
