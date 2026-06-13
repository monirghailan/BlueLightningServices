"use client";

import { motion } from "framer-motion";
import { faqs } from "@/lib/content";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

export function FAQSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeUp}
            transition={defaultTransition}
            className="mb-10 text-center text-3xl font-bold"
          >
            Frequently asked questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.details
                key={faq.question}
                variants={fadeUp}
                transition={defaultTransition}
                className="glow-border group rounded-xl border border-border bg-surface-elevated p-5"
              >
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-muted">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
