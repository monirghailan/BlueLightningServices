"use client";

import { motion } from "framer-motion";

interface AssistantTypingIndicatorProps {
  label?: string;
}

export function AssistantTypingIndicator({ label }: AssistantTypingIndicatorProps) {
  return (
    <div
      className="mr-8 rounded-2xl border border-border px-4 py-3 text-sm"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? "Assistant is typing"}
    >
      <p className="mb-2 text-xs uppercase tracking-wide text-muted">Assistant</p>
      {label ? <p className="mb-2 text-sm text-muted">{label}</p> : null}
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
