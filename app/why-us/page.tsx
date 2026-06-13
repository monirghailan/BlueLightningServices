import type { Metadata } from "next";
import { WhyUsContent } from "@/components/sections/WhyUsContent";

export const metadata: Metadata = {
  title: "Why Us",
  description:
    "Decades of Salesforce mastery plus agentic AI delivery. Team replacement, not staff augmentation.",
};

export default function WhyUsPage() {
  return <WhyUsContent />;
}
