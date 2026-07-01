import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";
import { breadcrumbJsonLd, serviceListJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  path: "/services",
  title: "Services",
  description:
    "LWC, Apex, Flow, integrations, Agentforce, architecture, and managed Salesforce releases — full engineering capacity.",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          serviceListJsonLd(),
        ]}
      />
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Services</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Full Salesforce engineering capacity — owned and delivered by one agentic partner.{" "}
          <Link href="/pricing" className="text-bolt-outline hover:text-bolt-glow">
            View pricing
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-bolt-outline hover:text-bolt-glow">
            book a free audit
          </Link>
          .
        </p>
      </div>
      <ServicesGrid />
      <CTASection />
    </>
  );
}
