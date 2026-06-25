"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ASSISTANT_PERSONA_LABELS, ASSISTANT_PERSONAS } from "@/lib/assistant/personas";
import type { AssistantPersona } from "@/lib/supabase/database.types";
import type { AssistantChatMessage } from "@/lib/assistant/chat-types";
import { AssistantMessageFeedbackBar } from "@/components/portal/AssistantMessageFeedback";
import { AssistantTypingIndicator } from "@/components/portal/AssistantTypingIndicator";
import { MarkdownContent } from "@/components/portal/MarkdownContent";
import { PortalCard } from "@/components/portal/PortalCard";

interface AssistantMeta {
  assistantPersona: AssistantPersona;
  assistantEnabled: boolean;
  assistantLastIndexedAt: string | null;
}

interface AssistantChatProps {
  initialMeta: AssistantMeta;
  suggestedQuestions?: string[];
  canChangePersona?: boolean;
}

export function AssistantChat({
  initialMeta,
  suggestedQuestions = [],
  canChangePersona = false,
}: AssistantChatProps) {
  const [meta, setMeta] = useState<AssistantMeta>(initialMeta);
  const [savingPersona, setSavingPersona] = useState<AssistantPersona | null>(null);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const { messages, sendMessage, status, error } = useChat<AssistantChatMessage>({
    transport,
  });

  const lastMessage = messages.at(-1);
  const showTypingIndicator =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      !lastMessage.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0
      ));

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (messages.length === 0 && !showTypingIndicator) return;
    const timer = setTimeout(() => scrollChatToBottom(), 80);
    return () => clearTimeout(timer);
  }, [messages, status, showTypingIndicator, scrollChatToBottom]);

  async function savePersona(persona: AssistantPersona) {
    const previousPersona = meta.assistantPersona;
    setPersonaError(null);
    setSavingPersona(persona);
    setMeta((current) => ({ ...current, assistantPersona: persona }));

    const res = await fetch("/api/portal/assistant/persona", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantPersona: persona }),
    });

    if (res.ok) {
      const data = await res.json();
      setMeta((current) => ({ ...current, assistantPersona: data.assistantPersona }));
      setShowPersonaPicker(false);
    } else {
      setMeta((current) => ({ ...current, assistantPersona: previousPersona }));
      setPersonaError("Couldn't save role. Try again.");
    }

    setSavingPersona(null);
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

  if (!meta.assistantEnabled) {
    return (
      <PortalCard title="Assistant not ready yet">
        <p className="text-sm text-muted">
          Your organization guide has not been connected yet. Contact Blue Lightning Services
          if you expected this to be available.
        </p>
      </PortalCard>
    );
  }

  return (
    <div className="space-y-6">
      {canChangePersona && showPersonaPicker && (
        <PortalCard title="What best describes your Salesforce role?">
          <p className="mb-4 text-sm text-muted">
            This helps the assistant show the most relevant guidance for your day-to-day work.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ASSISTANT_PERSONAS.map((persona) => {
              const isSaving = savingPersona === persona;

              return (
                <button
                  key={persona}
                  type="button"
                  disabled={savingPersona !== null}
                  onClick={() => savePersona(persona)}
                  aria-busy={isSaving}
                  className={`rounded-xl border bg-surface-elevated px-4 py-3 text-left text-sm transition-colors ${
                    isSaving
                      ? "border-bolt-fill/60 text-foreground"
                      : "border-border hover:border-bolt-fill/40"
                  } ${savingPersona !== null && !isSaving ? "opacity-50" : ""}`}
                >
                  {isSaving ? "Saving…" : ASSISTANT_PERSONA_LABELS[persona]}
                </button>
              );
            })}
          </div>
          {personaError && <p className="mt-3 text-sm text-red-200">{personaError}</p>}
        </PortalCard>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            Persona:{" "}
            <span className="text-foreground">
              {savingPersona
                ? "Saving…"
                : ASSISTANT_PERSONA_LABELS[meta.assistantPersona]}
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
        {canChangePersona && (
          <button
            type="button"
            disabled={savingPersona !== null}
            onClick={() => setShowPersonaPicker((value) => !value)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground disabled:opacity-50"
          >
            Change role
          </button>
        )}
      </div>

      {suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleSuggestedPrompt(question)}
              disabled={status !== "ready"}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface">
        <div
          ref={messagesContainerRef}
          className="max-h-[32rem] space-y-4 overflow-y-auto p-4 scroll-smooth"
        >
          {messages.length === 0 && (
            <p className="text-sm text-muted">
              Ask how to use Salesforce in your organization — for example, how to create a lead,
              log a case, or follow a business process.
            </p>
          )}
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const isStreamingThisMessage =
              isAssistant &&
              (status === "streaming" || status === "submitted") &&
              message.id === messages.at(-1)?.id;
            const dbMessageId = message.metadata?.dbMessageId;
            const hasText = message.parts.some(
              (part) => part.type === "text" && part.text.trim().length > 0
            );

            if (isAssistant && isStreamingThisMessage && !hasText) {
              return null;
            }

            return (
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
                part.type === "text" ? (
                  message.role === "assistant" ? (
                    <MarkdownContent key={index} content={part.text} assistantMode />
                  ) : (
                    <p key={index} className="whitespace-pre-wrap leading-relaxed">
                      {part.text}
                    </p>
                  )
                ) : null
              )}
              {isAssistant && dbMessageId && hasText && !isStreamingThisMessage && (
                <AssistantMessageFeedbackBar
                  messageId={dbMessageId}
                  feedback={message.metadata?.feedback}
                />
              )}
            </div>
            );
          })}
          {showTypingIndicator && <AssistantTypingIndicator />}
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
