import type { FaqItem } from "@/lib/structured-data";
import { faqs as staticFaqs } from "@/lib/content";

type FAQSectionProps = {
  extraFaqs?: FaqItem[];
};

export function FAQSection({ extraFaqs = [] }: FAQSectionProps) {
  const allFaqs = [...extraFaqs, ...staticFaqs];

  return (
    <section className="px-6 py-20" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="faq-heading" className="mb-10 text-center text-3xl font-bold">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {allFaqs.map((faq) => (
            <details
              key={faq.question}
              className="glow-border group rounded-xl border border-border bg-surface-elevated p-5"
            >
              <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                <h3 className="inline font-medium">{faq.question}</h3>
              </summary>
              <p className="mt-3 text-sm text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
