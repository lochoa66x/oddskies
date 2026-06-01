const heroPoints = [
  {
    category: "Canada",
    label: "Montreal Orb",
    labelSide: "above",
    left: "25%",
    size: 52,
    tone: "teal",
    top: "29%",
  },
  {
    category: "United States",
    label: "Sedona Triangle",
    labelSide: "right",
    left: "19%",
    size: 60,
    tone: "amber",
    top: "43%",
  },
  {
    category: "Mexico",
    label: "Popocatepetl Watch",
    labelSide: "right",
    left: "22%",
    size: 56,
    tone: "ember",
    top: "54%",
  },
  {
    category: "Brazil",
    label: "Sao Paulo Signal",
    labelSide: "right",
    left: "35%",
    size: 64,
    tone: "teal",
    top: "74%",
  },
  {
    category: "UK / Ireland",
    label: "Dublin Whisper House",
    labelSide: "above",
    left: "47%",
    size: 54,
    tone: "violet",
    top: "33%",
  },
  {
    category: "Western Europe",
    label: "Black Forest Echo",
    labelSide: "right",
    left: "52%",
    size: 52,
    tone: "muted",
    top: "39%",
  },
  {
    category: "Japan",
    label: "Tokyo Sky Pulse",
    labelSide: "left",
    left: "81%",
    size: 58,
    tone: "amber",
    top: "43%",
  },
  {
    category: "Oceania",
    label: "Outback Fire Disc",
    labelSide: "left",
    left: "80%",
    size: 62,
    tone: "ember",
    top: "75%",
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
                Global preview / 8 regions
              </span>
            </div>
          </div>

          <div className="atlas-grid relative min-h-[360px] overflow-hidden lg:min-h-[410px]">
            <div className="scan-line absolute left-0 top-20 h-px w-full" />
            <svg
              aria-hidden="true"
              className="atlas-map-base absolute inset-x-5 top-8 h-[72%] w-[calc(100%-2.5rem)]"
              viewBox="0 0 1000 500"
            >
              <path d="M100 132c31-46 83-71 141-70 45 1 78 21 114 42 31 18 78 16 99 50 24 40-10 73-48 88-44 17-66 52-92 87-28 39-83 54-126 27-38-23-42-73-76-99-39-30-66-76-12-125Z" />
              <path d="M286 318c42 14 72 44 84 84 10 36-4 67-25 91-39-17-58-47-78-85-18-34-25-62 19-90Z" />
              <path d="M430 150c35-35 92-39 135-22 33 13 59 42 94 49 43 9 83-28 130-6 44 21 73 70 63 117-11 54-62 75-112 61-39-11-70-43-112-37-41 6-69 43-112 34-47-10-74-58-67-101 5-34 30-61-19-95Z" />
              <path d="M482 285c42 7 73 37 93 74 17 31 43 58 42 99-48 15-103-5-131-46-25-37-50-86-4-127Z" />
              <path d="M715 330c29-23 79-18 116 2 34 19 66 47 69 87-44 22-100 12-141-17-30-21-61-44-44-72Z" />
              <path d="M382 70c42-31 99-30 135 2-28 34-79 38-126 33-31-3-41-17-9-35Z" />
            </svg>
            <svg
              aria-hidden="true"
              className="atlas-route-lines absolute inset-x-8 top-12 h-[63%] w-[calc(100%-4rem)]"
              viewBox="0 0 1000 430"
            >
              <path d="M190 184c122-72 235-63 338 27 105 91 218 97 339 21" />
              <path d="M258 236c96-45 187-39 273 19 88 59 174 47 260-35" />
              <path d="M220 318c91 35 155 91 192 168" />
              <path d="M510 172c81 61 144 141 188 240" />
              <path d="M632 214c71-13 142 7 213 60" />
            </svg>
            <span className="radar-ring absolute left-[24%] top-[33%] size-28" />
            <span className="radar-ring absolute left-[52%] top-[39%] size-32 [animation-delay:1.1s]" />
            <span className="radar-ring absolute left-[80%] top-[43%] size-24 [animation-delay:2s]" />
            <span className="radar-ring absolute left-[80%] top-[75%] size-28 [animation-delay:2.6s]" />

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
                <span
                  className={`atlas-point-label atlas-point-label-${point.labelSide}`}
                >
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
