"use client";

import { motion } from "framer-motion";
import { Users, Zap } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

export function ProblemSolution() {
  const { prices, format, isReady } = useCurrency();

  const inHouseCost = isReady
    ? format.formatCompactRange(prices.inHouseMin, prices.inHouseMax)
    : null;
  const monthlyPrice = isReady
    ? format.formatMoneyPerMonth(prices.annualEquivalent)
    : null;

  return (
    <section className="problem-section border-t border-white/[0.06] px-4 pt-5 sm:px-6 sm:pt-6 lg:pt-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="grid min-w-0 grid-cols-1 gap-4 min-[480px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[480px]:gap-2 sm:gap-6 md:gap-8"
        >
          <motion.div
            className="min-w-0 text-center"
            variants={fadeUp}
            transition={defaultTransition}
          >
            <div className="mb-1.5 flex items-center justify-center gap-1.5 text-muted sm:mb-3 sm:gap-2">
              <Users className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" />
              <span className="text-[10px] font-medium uppercase tracking-wider sm:text-sm">
                The problem
              </span>
            </div>
            <h2 className="text-balance font-bold leading-snug lg:text-[1.65rem]">
              Your Salesforce team is expensive, slow, and hard to retain
            </h2>
            <ul className="mt-1.5 space-y-0.5 text-center leading-snug text-muted sm:mt-4 sm:space-y-2 lg:text-base">
              <li>
                • 1–4 FTEs costing {inHouseCost ?? "—"} per year
              </li>
              <li>• Growing backlog and delayed releases</li>
              <li>• Key-person risk when admins or devs leave</li>
              <li>• Can&apos;t hire senior architects fast enough</li>
            </ul>
          </motion.div>
          <motion.div
            className="min-w-0 text-center"
            variants={fadeUp}
            transition={defaultTransition}
          >
            <div className="mb-1.5 flex items-center justify-center gap-1.5 text-bolt-glow sm:mb-3 sm:gap-2">
              <Zap className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" />
              <span className="text-[10px] font-medium uppercase tracking-wider sm:text-sm">
                The solution
              </span>
            </div>
            <h2 className="text-balance font-bold leading-snug lg:text-[1.65rem]">
              One agentic partner
              <br />
              replaces your entire dev function
            </h2>
            <ul className="mt-1.5 space-y-0.5 text-center leading-snug text-muted sm:mt-4 sm:space-y-2 lg:text-base">
              <li>• Fixed capacity from {monthlyPrice ?? "—"} — not hourly T&M</li>
              <li>• Decades of Salesforce expertise + agentic AI delivery</li>
              <li>• Weekly releases with architectural guardrails</li>
              <li>• Full lifecycle: build, ship, maintain, optimize</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
