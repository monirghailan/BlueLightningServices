import type { Metadata } from "next";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Our 4-step process: Audit, Transition, Deliver, Operate. Zero-drama handoff from your in-house Salesforce team.",
};

export default function HowItWorksPage() {
  return (
    <>
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">How it works</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          From first audit to full ownership — a structured transition that de-risks replacing your Salesforce development team.
        </p>
      </div>
      <HowItWorksSection showLink={false} />
      <FAQSection />
      <CTASection />
    </>
  );
}
