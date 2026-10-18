import type { ReactNode } from "react";

import { Reveal, WordReveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  tone?: "ink" | "bone";
  /** Set when a section's `aria-labelledby` points at this heading. */
  id?: string;
}

/** The repeated editorial masthead for every section on the site. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  tone = "ink",
  id,
}: SectionHeadingProps) {
  const light = tone === "bone";

  return (
    <div
      className={cn(
        "flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12",
        className,
      )}
    >
      <div className="max-w-2xl">
        <Reveal y={14}>
          <p
            className={cn(
              "label-caps flex items-center gap-3",
              light ? "text-bone/50" : "text-stone",
            )}
          >
            <span className={cn("h-px w-8", light ? "bg-navy-soft/70" : "bg-navy")} />
            {eyebrow}
          </p>
        </Reveal>

        <h2
          id={id}
          className={cn(
            "mt-5 font-display text-[clamp(2.1rem,4.6vw,3.75rem)] leading-[0.98]",
            light ? "text-bone" : "text-ink",
          )}
        >
          <WordReveal text={title} />
        </h2>
      </div>

      {(description || action) && (
        <div className="flex shrink-0 flex-col gap-5 md:items-end md:text-right">
          {description && (
            <Reveal delay={0.1}>
              <p
                className={cn(
                  "max-w-sm text-sm leading-relaxed",
                  light ? "text-bone/55" : "text-stone",
                )}
              >
                {description}
              </p>
            </Reveal>
          )}
          {action && <Reveal delay={0.16}>{action}</Reveal>}
        </div>
      )}
    </div>
  );
}
