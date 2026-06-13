"use client";

import { motion } from "framer-motion";
import { Users, Zap } from "lucide-react";
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/animations";

export function ProblemSolution() {
  return (
    <section className="problem-section border-t border-white/[0.06] px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-2 md:gap-8"
        >
          <motion.div variants={fadeUp} transition={defaultTransition}>
            <div className="mb-2 flex items-center gap-2 text-muted sm:mb-3">
              <Users size={18} />
              <span className="text-xs font-medium uppercase tracking-wider sm:text-sm">
                The problem
              </span>
            </div>
            <h2 className="text-xl font-bold sm:text-2xl lg:text-[1.65rem] lg:leading-snug">
              Your Salesforce team is expensive, slow, and hard to retain
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted sm:mt-4 sm:space-y-2 sm:text-base">
              <li>• 2–8 FTEs costing £400K–£800K+ per year</li>
              <li>• Growing backlog and delayed releases</li>
              <li>• Key-person risk when admins or devs leave</li>
              <li>• Can&apos;t hire senior architects fast enough</li>
            </ul>
          </motion.div>
          <motion.div variants={fadeUp} transition={defaultTransition}>
            <div className="mb-2 flex items-center gap-2 text-bolt-glow sm:mb-3">
              <Zap size={18} />
              <span className="text-xs font-medium uppercase tracking-wider sm:text-sm">
                The solution
              </span>
            </div>
            <h2 className="text-xl font-bold sm:text-2xl lg:text-[1.65rem] lg:leading-snug">
              One agentic partner replaces your entire dev function
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted sm:mt-4 sm:space-y-2 sm:text-base">
              <li>• Fixed capacity from £3,499/mo — not hourly T&M</li>
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
