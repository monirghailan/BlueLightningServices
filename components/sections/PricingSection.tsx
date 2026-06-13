"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PricingToggle } from "@/components/ui/PricingToggle";
import { planIncludes, pricing } from "@/lib/content";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

export function PricingSection({ compact = false }: { compact?: boolean }) {
  const [annual, setAnnual] = useState(true);
  const price = annual ? pricing.annualEquivalent : pricing.monthly;

  return (
    <section className="px-6 py-20" id="pricing">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} transition={defaultTransition} className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {compact ? "Simple, transparent pricing" : "One plan. Full Salesforce engineering."}
            </h2>
            {!compact && (
              <p className="mx-auto mt-4 max-w-2xl text-muted">
                Replace your in-house Salesforce development team with fixed monthly capacity — not hourly consulting.
              </p>
            )}
            <div className="mt-8 flex justify-center">
              <PricingToggle annual={annual} onChange={setAnnual} />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={defaultTransition}
            className="mx-auto mt-10 max-w-lg"
          >
            <div className="glow-border rounded-3xl border border-bolt-glow/20 bg-surface-elevated p-8 text-center">
              <p className="text-sm font-medium text-bolt-outline">
                Salesforce Engineering Partner
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">
                  {pricing.currency}
                  {price.toLocaleString("en-GB")}
                </span>
                <span className="text-muted">/mo</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {annual
                  ? `£${pricing.annualUpfront.toLocaleString("en-GB")} billed once per year · 12-month commitment`
                  : "12-month contract · billed monthly"}
              </p>
              {annual && (
                <span className="mt-3 inline-block rounded-full bg-bolt-glow/15 px-3 py-1 text-xs font-medium text-bolt-outline">
                  Save £{pricing.annualSavings.toLocaleString("en-GB")}/year
                </span>
              )}
              <ul className="mt-8 space-y-3 text-left text-sm text-muted">
                {planIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-bolt-glow" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/contact" className="mt-8 w-full" size="lg">
                Get started
              </Button>
            </div>
          </motion.div>

          {!compact && (
            <motion.div
              variants={fadeUp}
              transition={defaultTransition}
              className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-border"
            >
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted" />
                    <th className="px-6 py-4 text-left font-medium text-muted">
                      In-house team
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-bolt-outline">
                      Blue Lightning
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 text-muted">Annual cost</td>
                    <td className="px-6 py-4">£400K–£800K+</td>
                    <td className="px-6 py-4 text-bolt-glow">
                      £{annual ? pricing.annualUpfront.toLocaleString("en-GB") : (pricing.monthly * 12).toLocaleString("en-GB")}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-muted">Risk</td>
                    <td className="px-6 py-4">Hiring, retention, backlog</td>
                    <td className="px-6 py-4">Fixed capacity partner</td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}

          {compact && (
            <motion.div variants={fadeUp} transition={defaultTransition} className="mt-8 text-center">
              <Link href="/pricing" className="text-sm text-bolt-outline hover:text-bolt-glow">
                View full pricing details →
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
