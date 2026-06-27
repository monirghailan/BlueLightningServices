import { buildPageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhyUsContent } from "@/components/sections/WhyUsContent";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  path: "/why-us",
  title: "Why Us",
  description:
    "Decades of Salesforce mastery plus agentic AI delivery. Team replacement, not staff augmentation.",
});

export default function WhyUsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Why Us", path: "/why-us" },
        ])}
      />
      <WhyUsContent />
    </>
  );
}
