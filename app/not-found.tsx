import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-[72px] md:pt-20">
      <div className="shell flex min-h-[75svh] flex-col items-center justify-center py-24 text-center">
        <p className="label-caps text-stone">Error 404</p>

        <h1 className="mt-6 font-display text-[clamp(3rem,12vw,9rem)] leading-[0.85] text-ink/90">
          Off the wall
        </h1>

        <p className="mt-8 max-w-md text-sm leading-relaxed text-stone">
          This work is not in the collection, or has been moved to the archive.
          The gallery below is still open.
        </p>

        <Link
          href="/#collection"
          className="label-caps group mt-10 inline-flex items-center gap-2 border-b border-ink/30 pb-2 transition-colors hover:border-ink"
        >
          <ArrowLeft
            className="size-3.5 transition-transform duration-500 ease-luxe group-hover:-translate-x-1"
            strokeWidth={1.5}
            aria-hidden
          />
          Return to the collection
        </Link>
      </div>
    </div>
  );
}
