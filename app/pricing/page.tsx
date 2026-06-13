import type { Metadata } from "next";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "£3,999/month on a 12-month contract, or £3,499/month equivalent when paid annually. Full Salesforce engineering capacity.",
};

export default function PricingPage() {
  return (
    <>
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          One transparent plan. Replace your in-house Salesforce development team — without the headcount cost.
        </p>
      </div>
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
