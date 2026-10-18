interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds for one full loop. Slower reads as more expensive. */
  duration?: number;
}

/**
 * An infinite editorial ticker. The track holds the list twice and
 * translates by exactly -50%, so the seam is invisible at any width.
 */
export function Marquee({ items, className, duration = 48 }: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div className={className} aria-hidden>
      <div className="relative flex overflow-hidden">
        <div
          className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s` }}
        >
          {track.map((item, index) => (
            <span key={`${item}-${index}`} className="label-caps flex items-center gap-10">
              <span>{item}</span>
              <span className="text-navy-soft">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
