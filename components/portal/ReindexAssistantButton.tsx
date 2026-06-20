"use client";

import { useState } from "react";

export function ReindexAssistantButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reindex() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const res = await fetch("/api/portal/assistant/reindex", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Re-index failed.");
      return;
    }

    setMessage(
      `Indexed ${data.chunksIndexed} chunks from ${data.filesProcessed} files.`
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={reindex}
        disabled={loading}
        className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-surface-elevated disabled:opacity-50"
      >
        {loading ? "Indexing…" : "Re-index org guide"}
      </button>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-red-200">{error}</p>}
    </div>
  );
}
