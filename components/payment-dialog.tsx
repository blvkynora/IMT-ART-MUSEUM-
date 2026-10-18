"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn, formatPrice } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Bank details are public by nature (you need them to pay), so they are
 * read from NEXT_PUBLIC_* env vars. The fallbacks are obviously
 * placeholder values — replace them in `.env`.
 */
export const bankDetails = {
  bank: process.env.NEXT_PUBLIC_BANK_NAME || "Zenith Bank",
  accountName: process.env.NEXT_PUBLIC_ACCOUNT_NAME || "IMT ART MUSEUM LTD",
  accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || "0123456789",
};

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  reference: string;
  amountCents: number;
  currency?: string;
  email?: string;
}

function CopyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b py-3.5 hairline">
      <div className="min-w-0">
        <dt className="label-caps-sm text-stone">{label}</dt>
        <dd
          className={cn(
            "mt-1.5 truncate text-[0.95rem] text-ink",
            mono && "tnum tracking-[0.06em]",
          )}
        >
          {value}
        </dd>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="group grid size-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/50 transition-colors duration-300 hover:border-ink hover:text-ink"
      >
        {copied ? (
          <Check className="size-3.5 text-navy" strokeWidth={1.75} aria-hidden />
        ) : (
          <Copy className="size-3.5" strokeWidth={1.4} aria-hidden />
        )}
      </button>
    </div>
  );
}

/**
 * The pay step: bank-transfer instructions, in the museum's own voice.
 * Appears once an order is placed, and can be reopened from the
 * confirmation.
 */
export function PaymentDialog({
  open,
  onClose,
  reference,
  amountCents,
  currency = "USD",
  email,
}: PaymentDialogProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const notifyHref = `mailto:concierge@imtartmuseum.com?subject=${encodeURIComponent(
    `Transfer sent — ${reference}`,
  )}&body=${encodeURIComponent(
    `Hello,\n\nI have sent a transfer of ${formatPrice(amountCents, currency)} for order ${reference}.\n\nThank you,\n`,
  )}`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close payment details"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: EASE, delay: 0.08 } }}
            transition={{ duration: 0.4, ease: EASE }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
            className="relative w-full max-w-lg overflow-hidden bg-paper text-ink shadow-lift"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-6 px-6 pt-6 pb-5 md:px-8 md:pt-7">
              <div>
                <p className="label-caps flex items-center gap-2.5 text-stone">
                  <span className="h-px w-6 bg-navy" />
                  Payment · bank transfer
                </p>
                <h2
                  id="payment-title"
                  className="mt-3 font-display text-[1.9rem] leading-[1.05] md:text-[2.15rem]"
                >
                  Complete your transfer
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close payment details"
                autoFocus
                className="grid size-8 shrink-0 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
            </div>

            <div className="flex items-baseline justify-between gap-4 border-y bg-bone/60 px-6 py-4 hairline md:px-8">
              <div>
                <p className="label-caps-sm text-stone">Amount due</p>
                <p className="mt-1.5 font-display text-2xl tabular-nums">
                  {formatPrice(amountCents, currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="label-caps-sm text-stone">Reference</p>
                <p className="mt-1.5 text-sm tracking-[0.08em] tabular-nums">{reference}</p>
              </div>
            </div>

            <dl className="px-6 md:px-8">
              <CopyField label="Bank" value={bankDetails.bank} />
              <CopyField label="Account name" value={bankDetails.accountName} />
              <CopyField label="Account number" value={bankDetails.accountNumber} mono />
            </dl>

            <div className="px-6 pt-5 pb-6 md:px-8 md:pb-7">
              <p className="text-xs leading-relaxed text-stone">
                Use <span className="text-ink">{reference}</span> as your transfer
                reference so the registrar can match the payment. The work is held
                for 72 hours from this order.
              </p>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <a
                  href={notifyHref}
                  className="group flex flex-1 items-center justify-between gap-3 bg-ink px-5 py-3.5 text-bone transition-colors duration-500 hover:bg-graphite"
                >
                  <span className="label-caps">Notify the registrar</span>
                  <Check
                    className="size-4 transition-transform duration-500 ease-luxe group-hover:scale-110"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="label-caps border border-ink/20 px-5 py-3.5 text-ink/70 transition-colors duration-500 hover:border-ink hover:text-ink"
                >
                  Later
                </button>
              </div>

              {email && (
                <p className="mt-3 text-center text-[0.68rem] text-stone/80">
                  Confirmation sent to {email}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
