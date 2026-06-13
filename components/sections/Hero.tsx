"use client";

import { motion } from "framer-motion";
import { LogoHero } from "@/components/logo/LogoHero";
import { Button } from "@/components/ui/Button";
import { hero } from "@/lib/content";
import { defaultTransition } from "@/lib/animations";

export function Hero() {
  return (
    <section className="hero-section gradient-mesh relative min-h-0 min-w-0 overflow-x-clip px-4 sm:px-6">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl flex-1 items-center gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
        <motion.div
          className="min-w-0 text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={defaultTransition}
        >
          <motion.div
            className="hero-logo-inline mb-0.5 flex justify-center sm:mb-1.5 lg:hidden"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...defaultTransition, delay: 0.05 }}
          >
            <LogoHero inline />
          </motion.div>

          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-bolt-outline sm:mb-3 sm:text-xs">
            Agentic Salesforce Engineering
          </p>
          <h1 className="text-[1.65rem] font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15] xl:text-5xl xl:leading-tight">
            {hero.headline}
          </h1>
          <p className="mt-1.5 text-base font-medium text-bolt-glow sm:mt-3 sm:text-lg xl:text-xl">
            {hero.tagline}
          </p>
          <p className="hero-subhead mx-auto mt-2 max-w-xl text-sm text-muted sm:mt-3 sm:text-base lg:mx-0">
            {hero.subhead}
          </p>
          <div className="mt-2 flex flex-col items-center gap-2 sm:mt-5 sm:gap-3 sm:flex-row sm:justify-center lg:justify-start xl:mt-6">
            <Button href="/contact" size="lg" className="w-full max-w-sm sm:w-auto">
              {hero.ctaPrimary}
            </Button>
            <Button
              href="/pricing"
              variant="secondary"
              size="lg"
              className="w-full max-w-sm sm:w-auto"
            >
              {hero.ctaSecondary}
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="hero-logo-wrap hidden justify-center lg:flex lg:justify-end"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...defaultTransition, delay: 0.15 }}
        >
          <LogoHero compact className="lg:mr-0 xl:mr-4" />
        </motion.div>
      </div>
    </section>
  );
}
