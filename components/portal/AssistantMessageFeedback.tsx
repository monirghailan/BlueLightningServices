"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { AssistantMessageFeedback } from "@/lib/assistant/chat-types";

interface AssistantMessageFeedbackProps {
  messageId: string;
  feedback: AssistantMessageFeedback | null | undefined;
  disabled?: boolean;
  onFeedbackChange?: (feedback: AssistantMessageFeedback | null) => void;
}

export function AssistantMessageFeedbackBar({
  messageId,
  feedback,
  disabled = false,
  onFeedbackChange,
}: AssistantMessageFeedbackProps) {
  const [currentFeedback, setCurrentFeedback] = useState<AssistantMessageFeedback | null>(
    feedback ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentFeedback(feedback ?? null);
  }, [feedback]);

  async function submitFeedback(next: AssistantMessageFeedback | null) {
    if (disabled || saving) return;

    const previous = currentFeedback;
    setCurrentFeedback(next);
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/portal/assistant/messages/${messageId}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: next }),
    });

    setSaving(false);

    if (!res.ok) {
      setCurrentFeedback(previous);
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save feedback.");
      return;
    }

    onFeedbackChange?.(next);
  }

  function handleClick(value: AssistantMessageFeedback) {
    void submitFeedback(currentFeedback === value ? null : value);
  }

  const buttonClass = (value: AssistantMessageFeedback) => {
    const active = currentFeedback === value;
    return [
      "rounded-lg p-1.5 transition-colors disabled:opacity-50",
      active
        ? "bg-bolt-fill/20 text-bolt-glow"
        : "text-muted hover:bg-surface-elevated hover:text-foreground",
    ].join(" ");
  };

  return (
    <div className="mt-3 border-t border-border pt-2">
      <div className="flex items-center gap-1">
        <span className="mr-2 text-xs text-muted">Was this helpful?</span>
        <button
          type="button"
          aria-label="Thumbs up"
          aria-pressed={currentFeedback === "up"}
          disabled={disabled || saving}
          onClick={() => handleClick("up")}
          className={buttonClass("up")}
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Thumbs down"
          aria-pressed={currentFeedback === "down"}
          disabled={disabled || saving}
          onClick={() => handleClick("down")}
          className={buttonClass("down")}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-200">{error}</p>}
    </div>
  );
}
