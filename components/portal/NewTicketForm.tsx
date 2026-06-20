"use client";

import { useState } from "react";

interface NewTicketFormProps {
  onCreated: (key: string) => void;
  onCancel?: () => void;
}

export function NewTicketForm({ onCreated, onCancel }: NewTicketFormProps) {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("Feature");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/portal/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, description, issueType, priority }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create ticket.");
      setLoading(false);
      return;
    }

    onCreated(data.key);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <label className="block space-y-1">
        <span className="text-sm text-muted">Type</span>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
        >
          <option>Feature</option>
          <option>Bug</option>
          <option>Request</option>
          <option>Task</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-muted">Summary</span>
        <input
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
          maxLength={200}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-muted">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-muted">Priority</span>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
        >
          <option>Highest</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
          <option>Lowest</option>
        </select>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-bolt-fill px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create ticket"}
        </button>
      </div>
    </form>
  );
}
