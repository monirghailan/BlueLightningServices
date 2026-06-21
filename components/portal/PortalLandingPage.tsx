"use client";

import { motion } from "framer-motion";
import { CircleDot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AssistantDemo } from "@/components/portal/AssistantDemo";
import { DashboardDemo } from "@/components/portal/DashboardDemo";
import { portalLanding } from "@/lib/content";
import { defaultTransition, fadeUp, staggerContainer } from "@/lib/animations";

export function PortalLandingPage() {
  return (
    <div className="min-w-0">
      {/* Hero */}
      <section className="gradient-mesh relative overflow-x-clip px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={defaultTransition}
            className="min-w-0 text-center lg:text-left"
          >
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-bolt-fill/25 bg-bolt-fill/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-bolt-glow sm:text-xs">
              <CircleDot size={12} strokeWidth={2.5} aria-hidden />
              {portalLanding.badge}
            </p>
            <h1 className="text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              {portalLanding.headline}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg lg:mx-0">
              {portalLanding.subhead}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button href="/portal/login" size="lg" className="w-full max-w-sm sm:w-auto">
                {portalLanding.ctaPrimary}
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                size="lg"
                className="w-full max-w-sm sm:w-auto"
              >
                {portalLanding.ctaSecondary}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, delay: 0.12 }}
          >
            <AssistantDemo />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ ...defaultTransition, delay: 0.08 }}
          className="mx-auto mt-12 max-w-6xl"
        >
          <DashboardDemo />
        </motion.div>
      </section>

      {/* Three things you stop doing */}
      <section className="border-t border-border bg-surface px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold sm:text-3xl">
              Three things you stop doing
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-muted">
              The portal replaces internal overhead — not your Blue Lightning engineering team.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {portalLanding.stopDoing.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                <p className="mt-4 text-sm font-medium text-bolt-glow">{item.savings}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={defaultTransition}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">Everything in one place</h2>
            <p className="mt-3 text-muted">
              Built for your whole Salesforce user base — with admin tools for delivery leads.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portalLanding.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...defaultTransition, delay: index * 0.05 }}
                className="rounded-2xl border border-border bg-surface/60 p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-bolt-outline">
                  {feature.audience}
                </p>
                <h3 className="mt-2 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI strip */}
      <section className="border-y border-border bg-surface px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={defaultTransition}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-xl font-bold sm:text-2xl">{portalLanding.roi.headline}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {portalLanding.roi.example}
          </p>
          <p className="mt-4 text-xs text-muted">{portalLanding.roi.footnote}</p>
        </motion.div>
      </section>

      {/* Included free */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={defaultTransition}
          className="mx-auto max-w-3xl rounded-2xl border border-bolt-fill/20 bg-bolt-fill/5 p-8 text-center sm:p-10"
        >
          <h2 className="text-2xl font-bold sm:text-3xl">{portalLanding.included.headline}</h2>
          <p className="mt-4 text-muted">{portalLanding.included.description}</p>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="gradient-mesh px-4 py-16 sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={defaultTransition}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{portalLanding.finalCta.headline}</h2>
          <p className="mt-4 text-lg text-muted">{portalLanding.finalCta.subhead}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/portal/login" size="lg">
              {portalLanding.finalCta.ctaPrimary}
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              {portalLanding.finalCta.ctaSecondary}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
