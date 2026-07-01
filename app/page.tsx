import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Footer } from "@/components/layout/Footer";
import { SnapScrollRoot, SnapSection } from "@/components/layout/SnapScroll";
import { AboveFold } from "@/components/sections/AboveFold";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { faqPageJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  path: "/",
  title: "Home",
  description:
    "Own your Salesforce engineering function with an agentic engineering partner. Decades of Salesforce mastery. From £3,499/mo.",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd()} />
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
      <SnapSection tall>
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
    </>
  );
}
