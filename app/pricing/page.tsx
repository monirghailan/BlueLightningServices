import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { currencies } from "@/lib/pricing/currencies";
import { createFormatters } from "@/lib/pricing/format";
import { getPricingFaqs } from "@/lib/pricing/faqs";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/structured-data";
import { faqs } from "@/lib/content";

const gbpConfig = currencies.gbp;
const pricingFaqs = getPricingFaqs(gbpConfig.prices, createFormatters(gbpConfig));

export const metadata = buildPageMetadata({
  path: "/pricing",
  title: "Pricing",
  description:
    "£3,999/month on a 12-month contract, or £3,499/month equivalent when paid annually. Full Salesforce engineering capacity.",
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
          faqPageJsonLd([...pricingFaqs, ...faqs]),
        ]}
      />
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Pricing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          One transparent plan. Replace your in-house Salesforce development team — without the headcount cost.{" "}
          <Link href="/services" className="text-bolt-outline hover:text-bolt-glow">
            See what&apos;s included
          </Link>
          .
        </p>
      </div>
      <PricingSection />
      <FAQSection extraFaqs={pricingFaqs} />
      <CTASection />
    </>
  );
}
