import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/reveal";

const LOCATIONS = [
  {
    city: "New York",
    role: "Flagship",
    address: ["48 Mercer Street", "SoHo, NY 10013"],
    hours: ["Tue – Sat, 10:00 – 18:00", "Sun, 12:00 – 17:00"],
  },
  {
    city: "Paris",
    role: "Project space",
    address: ["7 rue de Braque", "75003 Paris"],
    hours: ["Wed – Sat, 11:00 – 19:00"],
  },
  {
    city: "Lagos",
    role: "Studio",
    address: ["12 Bourdillon Road", "Ikoyi, Lagos"],
    hours: ["By appointment only"],
  },
] as const;

export function VisitBand() {
  return (
    <section
      id="visit"
      aria-labelledby="visit-heading"
      className="scroll-mt-24 bg-ink text-bone"
    >
      <div className="shell py-20 md:py-28">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Reveal y={14}>
              <p className="label-caps flex items-center gap-3 text-bone/45">
                <span className="h-px w-8 bg-navy-soft/70" />
                Visit
              </p>
            </Reveal>
            <h2
              id="visit-heading"
              className="mt-6 font-display text-[clamp(2.1rem,4.6vw,3.75rem)] leading-[0.98]"
            >
              Three cities,
              <br />
              one collection.
            </h2>
          </div>

          <Reveal delay={0.14} className="shrink-0">
            <a
              href="mailto:concierge@imtartmuseum.com"
              className="label-caps group inline-flex items-center gap-3 border border-bone/30 px-7 py-4 transition-colors duration-500 ease-luxe hover:border-bone hover:bg-bone hover:text-ink"
            >
              Request a private view
              <ArrowRight
                className="size-3.5 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </a>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 border-t border-bone/12 pt-10 sm:grid-cols-3 md:gap-8">
          {LOCATIONS.map((location, index) => (
            <Reveal key={location.city} delay={index * 0.09}>
              <div>
                <p className="label-caps-sm text-navy-soft/85">{location.role}</p>
                <h3 className="mt-3 font-display text-3xl">{location.city}</h3>
                <address className="mt-4 text-sm leading-relaxed text-bone/60 not-italic">
                  {location.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <ul className="mt-4 space-y-1 text-sm text-bone/45">
                  {location.hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
