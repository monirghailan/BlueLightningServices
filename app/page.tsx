import { Footer } from "@/components/layout/Footer";
import { SnapScrollRoot, SnapSection } from "@/components/layout/SnapScroll";
import { AboveFold } from "@/components/sections/AboveFold";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <SnapScrollRoot>
      <SnapSection>
        <AboveFold />
      </SnapSection>
      <SnapSection>
        <HowItWorksSection />
      </SnapSection>
      <SnapSection>
        <ServicesGrid limit={3} />
      </SnapSection>
      <SnapSection>
        <PricingSection compact />
      </SnapSection>
      <SnapSection>
        <FAQSection />
      </SnapSection>
      <SnapSection isLast>
        <div className="snap-section__last-screen">
          <div className="snap-section__last-main">
            <CTASection />
          </div>
          <Footer embedded />
        </div>
        <div className="snap-section__last-end" aria-hidden />
      </SnapSection>
    </SnapScrollRoot>
  );
}
