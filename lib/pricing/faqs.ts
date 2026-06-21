import type { Formatters } from "./format";
import type { Faq, PriceSet } from "./types";

export function getPricingFaqs(prices: PriceSet, format: Formatters): Faq[] {
  return [
    {
      question: `What's included in ${format.formatMoney(prices.monthly)}/month?`,
      answer:
        "Full Salesforce engineering capacity: development, admin ops, releases, and ongoing maintenance. See our Services page for capability detail.",
    },
    {
      question: "Is there a minimum contract?",
      answer: `Yes — a 12-month annual contract. Pay monthly at ${format.formatMoneyPerMonth(prices.monthly)}, or ${format.formatMoney(prices.annualUpfront)} upfront for the year (${format.formatMoneyPerMonth(prices.annualEquivalent)} equivalent — save ${format.formatMoney(prices.annualSavings)}).`,
    },
  ];
}
