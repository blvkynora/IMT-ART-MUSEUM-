import Link from "next/link";

import { Seal } from "@/components/seal";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  href?: string;
  /** Set on dark grounds (hero, mobile menu, footer) to knock the seal out. */
  onDark?: boolean;
  priority?: boolean;
}

/**
 * The museum's lockup: seal + name.
 *
 * On the light grounds the seal leads in its true brand colours (deep navy
 * on bone); on dark grounds it is knocked out to bone. One definition,
 * used by the header, the mobile menu and the footer.
 */
export function Wordmark({
  className,
  href = "/",
  onDark = false,
  priority = false,
}: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label="IMT Art Museum — home"
      className={cn("group inline-flex items-center gap-2.5 md:gap-3", className)}
    >
      <span
        className={cn(
          "relative block size-9 shrink-0 transition-transform duration-700 ease-luxe group-hover:scale-[1.045] md:size-10",
        )}
      >
        <Seal onDark={onDark} priority={priority} />
      </span>

      <span className="flex flex-col justify-center">
        <span className="font-display text-[1.15rem] leading-none tracking-[0.22em] md:text-[1.2rem]">
          IMT
        </span>
        <span className="label-caps-sm mt-[0.35rem] opacity-60 transition-opacity duration-500 group-hover:opacity-100">
          Art Museum
        </span>
      </span>
    </Link>
  );
}
