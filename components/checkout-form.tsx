"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { variants as cloud } from "@/lib/cloudinary";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import type { PlacedOrder } from "@/lib/types";
import { cn, formatPrice, pad } from "@/lib/utils";
import { PaymentDialog } from "@/components/payment-dialog";

const EASE = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "submitting" | "error" | "done";

const FIELDS = [
  { name: "customerName", label: "Full name", type: "text", autoComplete: "name", span: 2 },
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: 2 },
  { name: "line1", label: "Address", type: "text", autoComplete: "address-line1", span: 2 },
  { name: "line2", label: "Apartment, suite (optional)", type: "text", autoComplete: "address-line2", span: 2, optional: true },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2", span: 1 },
  { name: "postalCode", label: "Postal code", type: "text", autoComplete: "postal-code", span: 1 },
  { name: "country", label: "Country", type: "text", autoComplete: "country-name", span: 2 },
] as const;

const inputClass =
  "w-full border-b bg-transparent py-3 text-[0.95rem] text-ink transition-colors duration-300 placeholder:text-stone/50 focus:border-ink focus:outline-none hairline";

export function CheckoutForm() {
  const lines = useCart((state) => state.lines);
  const isHydrated = useCart((state) => state.isHydrated);
  const clear = useCart((state) => state.clear);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [placedEmail, setPlacedEmail] = useState("");

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);
  const currency = lines[0]?.currency ?? "USD";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting" || lines.length === 0) return;

    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();

    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value("email"),
          customerName: value("customerName"),
          note: value("note"),
          address: {
            name: value("customerName"),
            line1: value("line1"),
            line2: value("line2"),
            city: value("city"),
            postalCode: value("postalCode"),
            country: value("country"),
          },
          items: lines.map((line) => ({
            artworkId: line.artworkId,
            quantity: line.quantity,
          })),
        }),
      });

      const payload = (await response.json()) as
        | { order: PlacedOrder }
        | { error: string };

      if (!response.ok || !("order" in payload)) {
        throw new Error("error" in payload ? payload.error : "Checkout failed.");
      }

      setOrder(payload.order);
      setPlacedEmail(value("email"));
      setStatus("done");
      clear();
      // The work is reserved, not paid — surface the transfer details now.
      setPaymentOpen(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout failed.");
      setStatus("error");
    }
  }

  /* ── Confirmation ────────────────────────────────────────── */
  if (status === "done" && order) {
    return (
      <div className="shell flex min-h-[70svh] items-center justify-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-xl text-center"
        >
          <div className="mx-auto grid size-14 place-items-center rounded-full border border-ink/15">
            <Check className="size-5 text-navy" strokeWidth={1.5} aria-hidden />
          </div>

          <p className="label-caps mt-8 text-stone">Acquisition confirmed</p>
          <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
            Thank you — your works are reserved.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-stone">
            Our registrar will write to you within one working day to arrange
            payment, condition review and insured delivery.
          </p>

          <dl className="mx-auto mt-10 max-w-sm divide-y divide-ink/10 border-y hairline">
            <div className="flex items-baseline justify-between py-3.5">
              <dt className="label-caps-sm text-stone">Reference</dt>
              <dd className="text-sm tracking-wide tabular-nums">{order.number}</dd>
            </div>
            <div className="flex items-baseline justify-between py-3.5">
              <dt className="label-caps-sm text-stone">Works</dt>
              <dd className="text-sm tabular-nums">{order.itemCount}</dd>
            </div>
            <div className="flex items-baseline justify-between py-3.5">
              <dt className="label-caps-sm text-stone">Total</dt>
              <dd className="font-display text-xl tabular-nums">
                {formatPrice(order.totalCents, order.currency)}
              </dd>
            </div>
          </dl>

          {!order.persisted && (
            <p className="mt-6 text-xs leading-relaxed text-stone/70">
              Demo mode: connect Neon (<code>DATABASE_URL</code>) and this order is
              written to Postgres. The flow above is the real one.
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <button
              type="button"
              onClick={() => setPaymentOpen(true)}
              className="label-caps group inline-flex items-center gap-2.5 bg-ink px-6 py-3.5 text-bone transition-colors duration-500 hover:bg-graphite"
            >
              Payment details
              <ArrowRight
                className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            <Link
              href="/#collection"
              className="label-caps group inline-flex items-center gap-2 border-b border-ink/30 pb-2 text-ink/70 transition-colors hover:border-ink hover:text-ink"
            >
              Return to the collection
            </Link>
          </div>
        </motion.div>

        <PaymentDialog
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          reference={order.number}
          amountCents={order.totalCents}
          currency={order.currency}
          email={placedEmail}
        />
      </div>
    );
  }

  /* ── Not hydrated yet ────────────────────────────────────── */
  if (!isHydrated) {
    return (
      <div className="shell py-24">
        <div className="h-8 w-48 animate-pulse bg-ink/5" />
        <div className="mt-4 h-4 w-72 animate-pulse bg-ink/5" />
      </div>
    );
  }

  /* ── Empty bag ───────────────────────────────────────────── */
  if (lines.length === 0) {
    return (
      <div className="shell flex min-h-[60svh] flex-col items-center justify-center py-24 text-center">
        <p className="label-caps text-stone">Checkout</p>
        <h1 className="mt-5 font-display text-4xl md:text-5xl">Your bag is empty</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">
          Nothing has been selected yet. Every work in the collection is a single
          acquisition, ready to be placed on reserve.
        </p>
        <Link
          href="/#collection"
          className="label-caps mt-9 inline-flex items-center gap-2 border-b border-ink/30 pb-2 transition-colors hover:border-ink"
        >
          Browse the collection
          <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    );
  }

  /* ── Checkout ────────────────────────────────────────────── */
  return (
    <div className="shell grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
      <div>
        <p className="label-caps text-stone">Secure checkout</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] leading-tight">
          Arrange your acquisition
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">
          No payment is taken here. A registrar confirms payment, provenance
          transfer and delivery directly with you.
        </p>

        <form onSubmit={handleSubmit} className="mt-12">
          <fieldset disabled={status === "submitting"} className="contents">
            <legend className="label-caps-sm mb-6 block text-stone">
              01 — Contact & delivery
            </legend>

            <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div
                  key={field.name}
                  className={field.span === 2 ? "sm:col-span-2" : undefined}
                >
                  <label
                    htmlFor={field.name}
                    className="label-caps-sm mb-1 block text-stone"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    required={!("optional" in field && field.optional)}
                    className={inputClass}
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label htmlFor="note" className="label-caps-sm mb-1 block text-stone">
                  Notes for the registrar (optional)
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  placeholder="Installation needs, deadlines, questions…"
                  className={cn(inputClass, "resize-none")}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="mt-6 border-l-2 border-oxblood bg-oxblood/5 px-4 py-3 text-sm text-oxblood"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="group mt-10 flex w-full items-center justify-between bg-ink px-7 py-4.5 text-bone transition-colors duration-500 hover:bg-graphite disabled:opacity-60"
            >
              <span className="label-caps">
                {status === "submitting" ? "Reserving…" : "Complete acquisition"}
              </span>
              <ArrowRight
                className="size-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone">
              <Lock className="size-3" strokeWidth={1.5} aria-hidden />
              Encrypted in transit. Your details are never sold.
            </p>
          </fieldset>
        </form>
      </div>

      {/* ── Order summary ─────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border bg-linen/60 p-6 hairline md:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Your selection</h2>
            <span className="label-caps-sm text-stone tabular-nums">
              {pad(lines.length)} works
            </span>
          </div>

          <ul className="mt-6 divide-y divide-ink/10 border-t hairline">
            {lines.map((line) => (
              <li key={line.artworkId} className="flex gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-bone">
                  <Image
                    src={cloud.thumb(line.imageUrl)}
                    alt={line.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-display text-lg leading-snug">
                    {line.title}
                  </p>
                  <p className="truncate text-xs text-stone">{line.artist}</p>
                  <p className="mt-auto pt-2 text-sm tabular-nums">
                    {formatPrice(line.priceCents * line.quantity, line.currency)}
                    {line.quantity > 1 && (
                      <span className="ml-1.5 text-xs text-stone">
                        ×{line.quantity}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t pt-5 hairline">
            <div className="flex items-baseline justify-between text-sm">
              <dt className="text-stone">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <dt className="text-stone">Insured delivery</dt>
              <dd className="text-stone">Included</dd>
            </div>
            <div className="flex items-baseline justify-between border-t pt-4 hairline">
              <dt className="label-caps text-stone">Total</dt>
              <dd className="font-display text-2xl tabular-nums">
                {formatPrice(subtotal, currency)}
              </dd>
            </div>
          </dl>

          <ul className="mt-7 space-y-2.5 border-t pt-5 text-xs leading-relaxed text-stone hairline">
            <li>· Signed certificate of authenticity</li>
            <li>· Full provenance documentation</li>
            <li>· Climate-controlled, insured delivery</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
