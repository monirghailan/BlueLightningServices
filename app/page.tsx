import { AboveFold } from "@/components/sections/AboveFold";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <AboveFold />
      <HowItWorksSection />
      <ServicesGrid limit={3} />
      <PricingSection compact />
      <FAQSection />
      <CTASection />
    </>
  );
}
