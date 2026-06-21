"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { portalLanding } from "@/lib/content";
import { defaultTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

type DemoScenario = (typeof portalLanding.demo.scenarios)[number];

type DemoPhase = "idle" | "user" | "typing" | "assistant" | "done";

const PHASE_DELAYS = {
  user: 0,
  typing: 1200,
  assistant: 1400,
  done: 2200,
} as const;

function TypingIndicator() {
  return (
    <div className="mr-8 rounded-2xl border border-border px-4 py-3 text-sm">
      <p className="mb-2 text-xs uppercase tracking-wide text-muted">Assistant</p>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-muted"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function AssistantAnswer({ scenario }: { scenario: DemoScenario }) {
  const paragraphs = scenario.answer.split("\n\n");

  return (
    <motion.div
      key={scenario.question}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={defaultTransition}
      className="mr-8 rounded-2xl border border-border px-4 py-3 text-sm"
    >
      <p className="mb-2 text-xs uppercase tracking-wide text-muted">Assistant</p>
      <div className="space-y-3 leading-relaxed text-foreground/90">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }}
          />
        ))}
      </div>
      {scenario.source && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, ...defaultTransition }}
          className="mt-3 inline-flex rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-muted"
        >
          {scenario.source}
        </motion.p>
      )}
    </motion.div>
  );
}

export function AssistantDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.4 });
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [activeIndex, setActiveIndex] = useState<number>(portalLanding.demo.defaultScenarioIndex);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasAutoStartedRef = useRef(false);

  const scenarios = portalLanding.demo.scenarios;
  const activeScenario = scenarios[activeIndex];

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const clearScheduled = useCallback(() => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  }, []);

  const startDemo = useCallback(
    (scenarioIndex: number) => {
      clearScheduled();
      setActiveIndex(scenarioIndex);
      if (chatRef.current) {
        chatRef.current.scrollTop = 0;
      }
      setPhase("user");

      const steps: { phase: DemoPhase; delay: number }[] = [
        { phase: "typing", delay: PHASE_DELAYS.typing },
        { phase: "assistant", delay: PHASE_DELAYS.typing + PHASE_DELAYS.assistant },
        { phase: "done", delay: PHASE_DELAYS.typing + PHASE_DELAYS.assistant + PHASE_DELAYS.done },
      ];

      timeoutRef.current = steps.map(({ phase, delay }) =>
        setTimeout(() => setPhase(phase), delay)
      );
    },
    [clearScheduled]
  );

  useEffect(() => {
    if (inView && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startDemo(portalLanding.demo.defaultScenarioIndex);
    }
    if (!inView) {
      hasAutoStartedRef.current = false;
      clearScheduled();
      setPhase("idle");
    }
    return clearScheduled;
  }, [inView, clearScheduled, startDemo]);

  useEffect(() => {
    if (phase === "idle") return;
    const timer = setTimeout(() => scrollChatToBottom(), 80);
    return () => clearTimeout(timer);
  }, [phase, activeIndex, scrollChatToBottom]);

  const showUser = ["user", "typing", "assistant", "done"].includes(phase);
  const showTyping = phase === "typing";
  const showAssistant = ["assistant", "done"].includes(phase);

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-white/10 bg-surface/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Portal Assistant</p>
          <p className="text-sm text-foreground">
            Persona:{" "}
            <span className="rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-xs">
              {portalLanding.demo.persona}
            </span>
          </p>
        </div>
        <span className="hidden rounded-full border border-bolt-fill/30 bg-bolt-fill/10 px-2.5 py-1 text-[11px] font-medium text-bolt-glow sm:inline">
          Live demo
        </span>
      </div>

      <div className="mb-4 flex min-h-[4.25rem] flex-wrap content-start gap-2">
        {scenarios.map((scenario, index) => {
          const isActive = index === activeIndex && phase !== "idle";
          return (
            <button
              key={scenario.question}
              type="button"
              onClick={() => startDemo(index)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "border-bolt-fill/40 bg-bolt-fill/10 text-foreground"
                  : "border-border bg-surface text-muted hover:border-bolt-fill/30 hover:text-foreground"
              )}
            >
              {scenario.question}
            </button>
          );
        })}
      </div>

      <div
        ref={chatRef}
        className="h-[17.5rem] space-y-4 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/60 p-4 scroll-smooth sm:h-[18.5rem]"
      >
        {phase === "idle" ? (
          <p className="text-sm text-muted">
            Ask how to use Salesforce in your organization — answers grounded in your org guide.
            Click a suggested question to try the demo.
          </p>
        ) : (
          <>
            {showUser && activeScenario && (
              <motion.div
                key={activeScenario.question}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={defaultTransition}
                className="ml-8 rounded-2xl bg-surface-elevated px-4 py-3 text-sm"
              >
                <p className="mb-1 text-xs uppercase tracking-wide text-muted">You</p>
                <p className="leading-relaxed">{activeScenario.question}</p>
              </motion.div>
            )}

            {showTyping && <TypingIndicator key={`typing-${activeIndex}`} />}

            {showAssistant && activeScenario && (
              <AssistantAnswer scenario={activeScenario} />
            )}
          </>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex gap-2">
          <div className="min-h-[2.5rem] flex-1 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-muted">
            Ask about how to use Salesforce in your org…
          </div>
          <div className="self-end rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white opacity-60">
            Send
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted">{portalLanding.demoDisclaimer}</p>
    </div>
  );
}
