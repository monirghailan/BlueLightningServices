"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { defaultTransition } from "@/lib/animations";

export function CTASection() {
  return (
    <section className="gradient-mesh px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={defaultTransition}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready for full Salesforce engineering ownership?
        </h2>
        <p className="mt-4 text-lg text-muted">
          Book a free team audit. We&apos;ll map your org, backlog, and spend — and show you exactly how we assume ownership of delivery.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="/contact" size="lg">
            Book a free team audit
          </Button>
          <Button href="/pricing" variant="secondary" size="lg">
            View pricing
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
