"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { differentiators, icp } from "@/lib/content";
import { CTASection } from "@/components/sections/CTASection";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

export function WhyUsContent() {
  return (
    <>
      <div className="gradient-mesh px-6 py-16 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Why Blue Lightning</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Decades of Salesforce experience meets production-grade agentic AI — not generic consulting.{" "}
          <Link href="/how-it-works" className="text-bolt-outline hover:text-bolt-glow">
            See how we work
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-bolt-outline hover:text-bolt-glow">
            get in touch
          </Link>
          .
        </p>
      </div>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">Built for companies like yours</h2>
          <p className="mt-4 text-muted">{icp.primary}</p>
          <p className="mt-2 text-sm text-bolt-outline">Primary buyer: {icp.buyer}</p>
        </div>
      </section>

      <section className="border-y border-border bg-surface px-6 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2"
        >
          {differentiators.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              transition={defaultTransition}
              className="glow-border rounded-2xl border border-border bg-surface-elevated p-8"
            >
              <h3 className="text-lg font-semibold text-bolt-glow">{item.title}</h3>
              <p className="mt-3 text-sm text-muted">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold">Agentic methodology</h2>
          <div className="mt-8 space-y-6 text-muted">
            <p>
              AI accelerates code generation, metadata analysis, test creation, and Agentforce configuration. Senior Salesforce architects review every change before it reaches production.
            </p>
            <p>
              We follow Salesforce Well-Architected standards — secure sharing models, least-privilege access, and human-reviewed deployments on every release.
            </p>
            <p>
              The result: 3–5× delivery velocity compared to traditional teams, at 60–80% lower cost than a typical 4-person in-house Salesforce function.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
