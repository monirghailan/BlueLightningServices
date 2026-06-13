import type { Metadata } from "next";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Services",
  description:
    "LWC, Apex, Flow, integrations, Agentforce, architecture, and managed Salesforce releases — full engineering capacity.",
};

export default function ServicesPage() {
  return (
    <>
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Services</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Everything your in-house Salesforce team does — delivered by one agentic engineering partner.
        </p>
      </div>
      <ServicesGrid />
      <CTASection />
    </>
  );
}
