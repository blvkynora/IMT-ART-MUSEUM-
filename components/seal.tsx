import Image from "next/image";

import { cn } from "@/lib/utils";

interface SealProps {
  /**
   * `false` — the seal in its own colours (navy + ink) for light grounds.
   * `true`  — knocked out to white for dark grounds, preserving the
   *           emblem's transparent cut-outs (the mark has no white pixels,
   *           so a luminance knock-out keeps every interior detail).
   */
  onDark?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * The museum seal. Decorative when a link or heading already names the
 * institution (`alt=""`), so screen readers never hear it twice.
 */
export function Seal({ onDark = false, className, priority = false }: SealProps) {
  return (
    <Image
      src="/brand/imt-seal.png"
      alt=""
      width={160}
      height={160}
      priority={priority}
      draggable={false}
      className={cn(
        "h-full w-full object-contain select-none",
        onDark && "brightness-0 invert opacity-90",
        className,
      )}
    />
  );
}
