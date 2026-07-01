"use client";

import { motion } from "framer-motion";
import { howItWorks } from "@/lib/content";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

export function HowItWorksSection({ showLink = true }: { showLink?: boolean }) {
  return (
    <section className="border-y border-border bg-surface px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} transition={defaultTransition} className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              A structured path from audit to full engineering ownership — typically 2–4 weeks.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                transition={defaultTransition}
                className="glow-border rounded-2xl border border-border bg-surface-elevated p-6"
              >
                <span className="text-sm font-bold text-bolt-glow">{step.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </motion.div>
            ))}
          </div>
          {showLink && (
            <motion.div variants={fadeUp} transition={defaultTransition} className="mt-10 text-center">
              <a href="/how-it-works" className="text-sm text-bolt-outline hover:text-bolt-glow">
                Learn more about our process →
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
