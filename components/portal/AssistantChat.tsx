"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useState } from "react";
import {
  ASSISTANT_PERSONA_LABELS,
  ASSISTANT_PERSONAS,
  suggestedPromptsForPersona,
} from "@/lib/assistant/personas";
import type { AssistantPersona } from "@/lib/supabase/database.types";
import { PortalCard } from "@/components/portal/PortalCard";

interface AssistantMeta {
  assistantPersona: AssistantPersona;
  assistantEnabled: boolean;
  assistantLastIndexedAt: string | null;
}

export function AssistantChat() {
  const [meta, setMeta] = useState<AssistantMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [personaSaving, setPersonaSaving] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/portal/chat",
        fetch: async (input, init) => {
          const response = await fetch(input, init);
          const id = response.headers.get("X-Conversation-Id");
          if (id) {
            setConversationId(id);
          }
          return response;
        },
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            messages,
            conversationId: body?.conversationId ?? conversationId,
          },
        }),
      }),
    [conversationId]
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  useEffect(() => {
    let active = true;
    async function loadMeta() {
      const res = await fetch("/api/portal/assistant/persona");
      if (!active || !res.ok) {
        setLoadingMeta(false);
        return;
      }
      const data = (await res.json()) as AssistantMeta;
      setMeta(data);
      setLoadingMeta(false);
    }
    void loadMeta();
    return () => {
      active = false;
    };
  }, []);

  async function savePersona(persona: AssistantPersona) {
    setPersonaSaving(true);
    const res = await fetch("/api/portal/assistant/persona", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantPersona: persona }),
    });
    setPersonaSaving(false);

    if (res.ok) {
      const data = await res.json();
      setMeta((current) =>
        current ? { ...current, assistantPersona: data.assistantPersona } : current
      );
      window.localStorage.setItem("bls-assistant-persona-confirmed", "1");
      setShowPersonaPicker(false);
    }
  }

  function handleSuggestedPrompt(prompt: string) {
    void sendMessage(
      { text: prompt },
      { body: { conversationId } }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== "ready") return;

    setInput("");
    await sendMessage(
      { text },
      {
        body: { conversationId },
      }
    );
  }

  useEffect(() => {
    const confirmed = window.localStorage.getItem("bls-assistant-persona-confirmed");
    if (!confirmed && meta?.assistantPersona === "general") {
      setShowPersonaPicker(true);
    }
  }, [meta?.assistantPersona]);

  if (loadingMeta) {
    return <p className="text-sm text-muted">Loading assistant…</p>;
  }

  if (!meta?.assistantEnabled) {
    return (
      <PortalCard title="Assistant not ready yet">
        <p className="text-sm text-muted">
          Your organization guide has not been connected yet. Contact Blue Lightning Services
          if you expected this to be available.
        </p>
      </PortalCard>
    );
  }

  const prompts = suggestedPromptsForPersona(meta.assistantPersona);

  return (
    <div className="space-y-6">
      {showPersonaPicker && (
        <PortalCard title="What best describes your Salesforce role?">
          <p className="mb-4 text-sm text-muted">
            This helps the assistant show the most relevant guidance for your day-to-day work.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ASSISTANT_PERSONAS.map((persona) => (
              <button
                key={persona}
                type="button"
                disabled={personaSaving}
                onClick={() => savePersona(persona)}
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-left text-sm hover:border-bolt-fill/40"
              >
                {ASSISTANT_PERSONA_LABELS[persona]}
              </button>
            ))}
          </div>
        </PortalCard>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            Persona:{" "}
            <span className="text-foreground">
              {ASSISTANT_PERSONA_LABELS[meta.assistantPersona]}
            </span>
          </p>
          {meta.assistantLastIndexedAt && (
            <p className="text-xs text-muted">
              Guide last updated{" "}
              {new Date(meta.assistantLastIndexedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowPersonaPicker((value) => !value)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
        >
          Change role
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSuggestedPrompt(prompt)}
            disabled={status !== "ready"}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="max-h-[32rem] space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted">
              Ask how to use Salesforce in your organization — for example, how to create a lead,
              log a case, or follow a business process.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-8 rounded-2xl bg-surface-elevated px-4 py-3 text-sm"
                  : "mr-8 rounded-2xl border border-border px-4 py-3 text-sm"
              }
            >
              <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              {message.parts.map((part, index) =>
                part.type === "text" ? <p key={index}>{part.text}</p> : null
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          {error && <p className="mb-2 text-sm text-red-200">{error.message}</p>}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Ask about how to use Salesforce in your org…"
              disabled={status !== "ready"}
              className="min-h-[3rem] flex-1 resize-y rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={status !== "ready" || !input.trim()}
              className="self-end rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {status === "streaming" || status === "submitted" ? "…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
