const heroPoints = [
  {
    category: "Strange Lights",
    label: "Green Fireball",
    left: "31%",
    size: 78,
    tone: "teal",
    top: "25%",
  },
  {
    category: "UFO / UAP",
    label: "Triangle Lights",
    left: "46%",
    size: 64,
    tone: "amber",
    top: "48%",
  },
  {
    category: "Haunted Places",
    label: "Silent Hill",
    left: "57%",
    size: 94,
    tone: "violet",
    top: "42%",
  },
  {
    category: "Strange Lights",
    label: "Cape Cod Light",
    left: "76%",
    size: 58,
    tone: "amber",
    top: "33%",
  },
  {
    category: "Local Legends",
    label: "Whispering Pines",
    left: "68%",
    size: 54,
    tone: "ember",
    top: "68%",
  },
  {
    category: "Unknown",
    label: "Sky Disc",
    left: "22%",
    size: 52,
    tone: "muted",
    top: "58%",
  },
];

const heroTags = ["UFO / UAP", "Strange Lights", "Haunted Places", "Unknown"];

export function Hero() {
  return (
    <section className="hero-shell relative overflow-hidden border-b border-night-800 bg-night-950">
      <div className="absolute inset-0 bg-star-field opacity-80" />
      <div className="paranormal-haze absolute inset-0" />
      <div className="sky-noise absolute inset-0" />
      <div className="ufo-beam absolute right-[9%] top-14 hidden h-[34rem] w-[24rem] md:block" />
      <div className="saucer-silhouette absolute right-[22%] top-16 hidden md:block" />
      <div className="haunted-horizon absolute bottom-0 left-[44%] hidden h-52 w-[34rem] lg:block" />
      <div className="terrain-silhouette absolute inset-x-0 bottom-0 h-36" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-teal/50 to-transparent" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a className="flex items-center gap-3" href="#">
          <span className="grid size-10 place-items-center rounded-md border border-signal-teal/40 bg-signal-teal/10 text-sm font-black text-signal-teal shadow-glow">
            OS
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-parchment">
              OddSkies
            </span>
            <span className="block text-xs text-muted">oddskies.com</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-md border border-night-800 bg-night-900/80 p-1 text-sm text-muted md:flex">
          {["Map", "Reports", "Oracle", "About"].map((item) => (
            <a
              className="rounded px-3 py-2 transition hover:bg-night-850 hover:text-parchment"
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-5 lg:min-h-[calc(100svh-76px)] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-10 lg:pb-14 lg:pt-4">
        <div>
          <p className="inline-flex rounded-md border border-signal-amber/30 bg-signal-amber/10 px-3 py-2 text-sm font-semibold text-signal-amber">
            Mystery Atlas / Phase 1 Preview
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.95] text-parchment sm:text-6xl lg:text-7xl">
            Explore the weird side of the map.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
            OddSkies organizes strange, unverified public reports — from UFOs
            and strange lights to haunted places and local legends — by time,
            place, category, and source.
          </p>
          <p className="mt-5 max-w-xl rounded-md border border-night-800 bg-night-900/80 px-4 py-3 text-sm font-semibold text-parchment">
            Verified? No. Interesting? Maybe. Source-linked? Always.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              className="hero-cta hero-cta-primary inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-signal-teal px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-parchment"
              href="#map"
            >
              <span aria-hidden="true" className="cta-glyph cta-glyph-map" />
              Explore the Map
            </a>
            <a
              className="hero-cta hero-cta-secondary inline-flex min-h-14 items-center justify-center gap-3 rounded-md border border-signal-violet/40 bg-signal-violet/[0.12] px-5 py-3 text-sm font-bold text-parchment transition hover:border-signal-teal/60 hover:bg-signal-teal/10"
              href="#oracle"
            >
              <span aria-hidden="true" className="cta-glyph cta-glyph-oracle" />
              Ask the Oracle
            </a>
          </div>
        </div>

        <div
          className="field-card relative overflow-hidden rounded-lg"
          id="map"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-night-800 bg-night-850 px-5 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-teal">
                Live Atlas Preview
              </p>
              <p className="mt-1 text-sm text-muted">
                Public report activity, not verified events.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs text-muted">
                Phase 1 density layer
              </span>
              <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs text-muted">
                45.5017 N / 73.5673 W
              </span>
            </div>
          </div>

          <div className="atlas-grid relative min-h-[360px] overflow-hidden lg:min-h-[410px]">
            <div className="scan-line absolute left-0 top-20 h-px w-full" />
            <svg
              aria-hidden="true"
              className="atlas-map-base absolute inset-x-5 top-8 h-[72%] w-[calc(100%-2.5rem)]"
              viewBox="0 0 900 500"
            >
              <path d="M97 161c22-43 70-80 119-92 61-15 93 20 134 28 38 7 68-16 103-5 35 10 48 42 74 60 31 21 78 16 105 43 34 34 20 88-21 106-47 21-98-12-141 14-52 31-83 89-148 88-66-1-78-63-123-93-48-32-124-21-146-76-9-23 9-47 44-73Z" />
              <path d="M489 137c38-47 107-65 169-48 58 16 85 64 128 92 37 24 81 34 91 77 12 51-33 101-83 111-56 11-96-34-144-30-44 3-78 49-126 38-45-11-70-62-58-104 11-37 55-59 54-91 0-18-44-15-31-45Z" />
              <path d="M287 344c41 5 71 26 102 50 28 22 76 20 91 57-48 8-96 0-136-22-38-21-62-48-57-85Z" />
              <path d="M733 89c40-24 95-11 125 23 31 36 16 83-27 101-38 16-99 8-122-27-22-34-9-73 24-97Z" />
            </svg>
            <svg
              aria-hidden="true"
              className="atlas-route-lines absolute inset-x-8 top-12 h-[63%] w-[calc(100%-4rem)]"
              viewBox="0 0 820 390"
            >
              <path d="M146 116c104-39 214-30 330 54 70 51 144 57 224 14" />
              <path d="M222 244c91-79 209-94 354-42 54 19 94 11 133-18" />
              <path d="M112 196c106 27 192 84 266 168" />
              <path d="M531 92c70 49 129 112 181 190" />
            </svg>
            <span className="radar-ring absolute left-[31%] top-[25%] size-28" />
            <span className="radar-ring absolute left-[57%] top-[42%] size-36 [animation-delay:1.1s]" />
            <span className="radar-ring absolute left-[76%] top-[33%] size-24 [animation-delay:2s]" />

            <div className="absolute left-5 top-5 rounded-md border border-night-800 bg-night-950/80 px-3 py-2 text-xs text-muted">
              Field layer: public report density
            </div>
            <div className="absolute right-5 top-5 rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs font-semibold text-signal-amber">
              Not confirmed events
            </div>

            {heroPoints.map((point, index) => (
              <div
                className={`atlas-report-point atlas-report-point-${point.tone}`}
                key={point.label}
                style={{
                  height: point.size,
                  left: point.left,
                  top: point.top,
                  width: point.size,
                }}
              >
                <span
                  aria-label={`${point.label}, ${point.category}`}
                  className="heat-cluster absolute inset-0 block rounded-full"
                  style={{ animationDelay: `${index * 0.42}s` }}
                >
                  <span className="absolute inset-[34%] rounded-full bg-signal-amber shadow-[0_0_30px_rgba(246,180,75,0.9)]" />
                  <span className="absolute inset-[44%] rounded-full bg-parchment/90" />
                </span>
                <span className="atlas-point-label">
                  <span>{point.label}</span>
                  <small>{point.category}</small>
                </span>
              </div>
            ))}

            <div className="absolute right-5 bottom-24 hidden rounded-md border border-night-800 bg-night-950/80 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted md:block">
              Sweep 03 / anomalous cluster watch
            </div>

            <div className="atlas-control absolute right-5 top-16 hidden rounded-md border border-night-800 bg-night-950/80 p-2 text-xs text-muted lg:block">
              <span>Density</span>
              <span>Source links</span>
              <span>48h</span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {heroTags.map((tag) => (
                  <span
                    className="rounded-md border border-night-800 bg-night-950/80 px-3 py-2 text-xs text-parchment"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex max-w-sm items-center gap-3 rounded-md border border-night-800 bg-night-950/85 px-3 py-2 text-xs text-muted">
                <span>Fewer reports</span>
                <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-signal-teal/35 via-signal-amber to-signal-ember" />
                <span>More reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
