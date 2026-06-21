"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Plus } from "lucide-react";
import { portalLanding } from "@/lib/content";
import { defaultTransition } from "@/lib/animations";
import { TypePieChart } from "@/components/portal/TypePieChart";
import { cn } from "@/lib/utils";

const demo = portalLanding.dashboardDemo;

function statusTone(status: string) {
  if (status === "Done") return "bg-emerald-500/15 text-emerald-300";
  if (status === "In Progress" || status === "In Review") return "bg-amber-500/15 text-amber-200";
  return "bg-bolt-fill/20 text-bolt-outline";
}

export function DashboardDemo({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.25, once: true });
  const [phase, setPhase] = useState(0);
  const backlogRows = compact ? demo.backlog.slice(0, 2) : demo.backlog;

  useEffect(() => {
    if (!inView) return;

    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1700),
    ];

    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const statusTotal = demo.byStatus.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-2xl border border-white/10 bg-surface/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5"
      )}
    >
      <div className={cn("flex items-center justify-between gap-3", compact ? "mb-2" : "mb-4")}>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Client Portal</p>
          <p className="text-sm font-semibold text-foreground">{demo.orgName} — Dashboard</p>
        </div>
        <span className="hidden rounded-full border border-bolt-fill/30 bg-bolt-fill/10 px-2.5 py-1 text-[11px] font-medium text-bolt-glow sm:inline">
          Live demo
        </span>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-border bg-background/60",
          compact ? "space-y-3 p-3" : "space-y-5 p-4"
        )}
      >
        {/* Stat cards */}
        <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", compact && "gap-2")}>
          {demo.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ ...defaultTransition, delay: index * 0.08 }}
              className={cn(
                "rounded-2xl border border-border bg-surface",
                compact ? "p-2.5" : "p-4"
              )}
            >
              <p className={cn("text-muted", compact ? "text-[10px]" : "text-xs")}>{stat.label}</p>
              <p className={cn("mt-1 font-semibold tracking-tight", compact ? "text-lg" : "mt-2 text-2xl")}>
                {stat.value}
                {"unit" in stat && stat.unit ? (
                  <span className="text-sm font-normal text-muted"> {stat.unit}</span>
                ) : null}
              </p>
              {"hint" in stat && stat.hint ? (
                <p className="mt-2 truncate text-[11px] text-muted">{stat.hint}</p>
              ) : null}
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className={cn("grid gap-4 sm:grid-cols-2", compact && "gap-3")}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={defaultTransition}
            className={cn(
              "rounded-2xl border border-border bg-surface",
              compact ? "p-3" : "p-4"
            )}
          >
            <h3 className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>By status</h3>
            <p className={cn("text-muted", compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs")}>
              All tickets, all time — where they sit in the workflow
            </p>
            <ul className={cn(compact ? "mt-2 space-y-2" : "mt-4 space-y-3")}>
              {demo.byStatus.map((item, index) => {
                const pct = Math.round((item.count / statusTotal) * 100);
                return (
                  <li key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{item.status}</span>
                      <span className="text-muted">{item.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                      <motion.div
                        className="h-full rounded-full bg-bolt-fill"
                        initial={{ width: 0 }}
                        animate={phase >= 2 ? { width: `${pct}%` } : { width: 0 }}
                        transition={{ ...defaultTransition, delay: 0.15 + index * 0.1 }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ ...defaultTransition, delay: 0.1 }}
            className={cn(
              "rounded-2xl border border-border bg-surface",
              compact ? "p-3" : "p-4"
            )}
          >
            <h3 className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>By type</h3>
            <p className={cn("text-muted", compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs")}>
              All tickets, all time — Feature / Bug / Request mix
            </p>
            <div className={compact ? "mt-1" : "mt-2 scale-90 sm:scale-100"}>
              <TypePieChart data={demo.byType} compact={compact} />
            </div>
          </motion.div>
        </div>

        {/* Backlog */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={defaultTransition}
          className={cn(
            "rounded-2xl border border-border bg-surface",
            compact ? "p-3" : "p-4"
          )}
        >
          <div className={cn("flex items-start justify-between gap-3", compact ? "mb-2" : "mb-4")}>
            <div>
              <h3 className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>Backlog</h3>
              <p className={cn("text-muted", compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs")}>
                Prioritize items here, then mark them ready to move onto the delivery board.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-bolt-fill/30 bg-bolt-fill/10 px-2.5 py-1 text-[11px] font-medium text-bolt-glow">
              <Plus size={12} strokeWidth={2.5} aria-hidden />
              New ticket
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-2 pr-3 font-medium">Key</th>
                  <th className="pb-2 pr-3 font-medium">Summary</th>
                  <th className="pb-2 pr-3 font-medium">Type</th>
                  <th className="pb-2 pr-3 font-medium">Priority</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {backlogRows.map((item, index) => (
                  <motion.tr
                    key={item.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                    transition={{ ...defaultTransition, delay: index * 0.12 }}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className={cn("pr-3 font-mono text-bolt-outline", compact ? "py-1.5" : "py-2.5")}>
                      {item.key}
                    </td>
                    <td className={cn("max-w-[12rem] truncate pr-3", compact ? "py-1.5" : "py-2.5")}>
                      {item.summary}
                    </td>
                    <td className={cn("pr-3", compact ? "py-1.5" : "py-2.5")}>
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px]", statusTone("To Do"))}>
                        {item.type}
                      </span>
                    </td>
                    <td className={cn("pr-3 text-muted", compact ? "py-1.5" : "py-2.5")}>{item.priority}</td>
                    <td className={compact ? "py-1.5" : "py-2.5"}>
                      {index === 0 ? (
                        <motion.span
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={phase >= 4 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                          transition={{ ...defaultTransition, delay: 0.35 }}
                          className="inline-flex rounded-lg bg-bolt-fill px-2 py-1 text-[11px] font-medium text-white"
                        >
                          Ready
                        </motion.span>
                      ) : (
                        <span className="inline-flex rounded-lg border border-border px-2 py-1 text-[11px] text-muted">
                          Ready
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <p className={cn("text-center text-muted", compact ? "mt-2 text-[10px]" : "mt-3 text-[11px]")}>
        {demo.disclaimer}
      </p>
    </div>
  );
}
