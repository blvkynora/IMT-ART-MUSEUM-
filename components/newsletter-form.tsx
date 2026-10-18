"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "done" | "error";

/**
 * The private-view list. Posts to `/api/newsletter`, which is where you
 * would hand off to your email provider — the form itself never needs
 * to change.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting" || status === "done") return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <label htmlFor="newsletter-email" className="label-caps-sm text-bone/45">
        Private view invitations
      </label>

      <div className="mt-3 flex items-center gap-3 border-b border-bone/25 pb-2 transition-colors focus-within:border-navy-soft">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="your@email.com"
          autoComplete="email"
          disabled={status === "done"}
          className="w-full bg-transparent py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting" || status === "done"}
          aria-label="Subscribe to private view invitations"
          className="group shrink-0 p-2 text-bone/60 transition-colors hover:text-navy-soft disabled:opacity-50"
        >
          {status === "done" ? (
            <Check className="size-4" strokeWidth={1.5} aria-hidden />
          ) : (
            <ArrowRight
              className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
              strokeWidth={1.5}
              aria-hidden
            />
          )}
        </button>
      </div>

      <p
        aria-live="polite"
        className={cn(
          "mt-3 text-xs leading-relaxed",
          status === "error" ? "text-oxblood" : "text-bone/40",
        )}
      >
        {status === "done"
          ? "You are on the list. Invitations are sent before each opening."
          : status === "error"
            ? "Something went wrong — please try again."
            : status === "submitting"
              ? "Adding you to the list…"
              : "Four invitations a year. No noise, ever."}
      </p>
    </form>
  );
}
