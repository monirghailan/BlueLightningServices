"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  Code2,
  GitBranch,
  Plug,
  Rocket,
  Shield,
} from "lucide-react";
import { services } from "@/lib/content";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

const icons = {
  code: Code2,
  workflow: GitBranch,
  plug: Plug,
  bot: Bot,
  shield: Shield,
  rocket: Rocket,
};

export function ServicesGrid({ limit }: { limit?: number }) {
  const items = limit ? services.slice(0, limit) : services;

  return (
    <section className="border-y border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} transition={defaultTransition} className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What we deliver</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Full-stack Salesforce engineering — from LWC and Apex to Agentforce and managed releases.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service) => {
              const Icon = icons[service.icon as keyof typeof icons];
              return (
                <motion.div
                  key={service.title}
                  variants={fadeUp}
                  transition={defaultTransition}
                  className="glow-border rounded-2xl border border-border bg-surface-elevated p-6 transition-colors hover:border-bolt-glow/30"
                >
                  <Icon className="mb-4 text-bolt-glow" size={28} />
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
          {limit ? (
            <p className="mt-10 text-center text-sm text-muted">
              <Link href="/services" className="text-bolt-outline hover:text-bolt-glow">
                View all services
              </Link>{" "}
              ·{" "}
              <Link href="/pricing" className="text-bolt-outline hover:text-bolt-glow">
                See pricing
              </Link>
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
