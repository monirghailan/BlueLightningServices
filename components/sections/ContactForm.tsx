"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations/contact";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { source: "contact", website: "" },
  });

  async function onSubmit(data: ContactFormData) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      reset({ source: "contact", website: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="glow-border rounded-2xl border border-bolt-glow/30 bg-surface-elevated p-8 text-center">
        <h3 className="text-xl font-semibold text-bolt-glow">Message sent</h3>
        <p className="mt-2 text-muted">
          Thanks for reaching out. We&apos;ll get back to you at the email you provided shortly.
        </p>
        <Button className="mt-6" variant="secondary" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("source")} />
      <input
        type="text"
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Full name *
        </label>
        <input
          id="name"
          {...register("name")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-bolt-glow/50"
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Work email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-bolt-glow/50"
        />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
          Company *
        </label>
        <input
          id="company"
          {...register("company")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-bolt-glow/50"
        />
        {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
          Phone <span className="text-muted">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-bolt-glow/50"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message *
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          placeholder="Tell us about your Salesforce org, team size, and biggest challenges..."
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-bolt-glow/50"
        />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send message"}
      </Button>

      <p className="text-xs text-muted">
        By submitting, you agree to our{" "}
        <a href="/privacy" className="text-bolt-outline hover:underline">
          Privacy Policy
        </a>
        . Your data is stored securely to respond to your enquiry.
      </p>
    </form>
  );
}
