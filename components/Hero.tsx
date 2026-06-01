const heroClusters = [
  { label: "UFO / UAP", left: "23%", top: "31%", size: 78, delay: "0s" },
  { label: "Strange Lights", left: "38%", top: "57%", size: 52, delay: "0.6s" },
  { label: "Haunted Places", left: "58%", top: "43%", size: 96, delay: "1.1s" },
  { label: "Local Legends", left: "76%", top: "28%", size: 60, delay: "1.7s" },
  { label: "Unknown", left: "70%", top: "70%", size: 48, delay: "2.2s" },
];

const heroTags = ["UFO / UAP", "Strange Lights", "Haunted Places", "Unknown"];

export function Hero() {
  return (
    <section className="hero-shell relative overflow-hidden border-b border-night-800 bg-night-950">
      <div className="absolute inset-0 bg-star-field opacity-80" />
      <div className="paranormal-haze absolute inset-0" />
      <div className="sky-noise absolute inset-0" />
      <div className="ufo-beam absolute right-[9%] top-14 hidden h-[34rem] w-[24rem] md:block" />
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
              className="inline-flex min-h-14 items-center justify-center rounded-md bg-signal-teal px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-parchment"
              href="#map"
            >
              Explore the Map
            </a>
            <a
              className="inline-flex min-h-14 items-center justify-center rounded-md border border-signal-violet/40 bg-signal-violet/[0.12] px-5 py-3 text-sm font-bold text-parchment transition hover:border-signal-teal/60 hover:bg-signal-teal/10"
              href="#oracle"
            >
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
              className="atlas-landmass absolute inset-x-4 top-10 h-[66%] w-[calc(100%-2rem)]"
              viewBox="0 0 840 430"
            >
              <path d="M62 138C91 87 148 70 204 83c32 7 57 28 88 36 37 10 65-9 102-2 35 7 55 33 51 62-6 38-48 45-78 61-37 19-49 53-86 63-45 13-83-14-119-35-40-24-86-30-111-69-13-21-7-44 11-61Z" />
              <path d="M360 132c41-41 112-45 159-13 33 22 52 59 86 79 35 21 88 20 110 58 24 42-3 93-47 110-42 17-83-8-118-26-38-20-73-24-114-16-48 10-105-1-126-43-20-41 13-77 48-102 12-9-7-30 2-47Z" />
              <path d="M634 92c42-31 113-19 141 21 29 41 9 93-38 113-42 18-107 14-139-22-31-36-10-79 36-112Z" />
              <path d="M580 330c28-26 85-27 116-1 28 24 20 66-15 79-36 14-92-7-109-38-8-15-4-29 8-40Z" />
            </svg>
            <svg
              aria-hidden="true"
              className="atlas-route-lines absolute inset-x-8 top-12 h-[58%] w-[calc(100%-4rem)]"
              viewBox="0 0 760 340"
            >
              <path d="M116 116C208 62 318 61 429 134c72 48 133 53 207 19" />
              <path d="M238 238c73-68 166-84 279-48 45 14 82 7 111-19" />
              <path d="M108 187c84 23 155 63 220 122" />
            </svg>
            <span className="radar-ring absolute left-[18%] top-[28%] size-28" />
            <span className="radar-ring absolute left-[55%] top-[38%] size-36 [animation-delay:1.1s]" />
            <span className="radar-ring absolute left-[72%] top-[20%] size-24 [animation-delay:2s]" />

            <div className="absolute left-5 top-5 rounded-md border border-night-800 bg-night-950/80 px-3 py-2 text-xs text-muted">
              Field layer: public report density
            </div>
            <div className="absolute right-5 top-5 rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs font-semibold text-signal-amber">
              Not confirmed events
            </div>

            {heroClusters.map((cluster) => (
              <span
                aria-label={cluster.label}
                className="heat-cluster absolute block -translate-x-1/2 -translate-y-1/2 rounded-full"
                key={cluster.label}
                style={{
                  animationDelay: cluster.delay,
                  height: cluster.size,
                  left: cluster.left,
                  top: cluster.top,
                  width: cluster.size,
                }}
              >
                <span className="absolute inset-[34%] rounded-full bg-signal-amber shadow-[0_0_30px_rgba(246,180,75,0.9)]" />
                <span className="absolute inset-[44%] rounded-full bg-parchment/90" />
              </span>
            ))}

            <div className="absolute right-5 bottom-24 hidden rounded-md border border-night-800 bg-night-950/80 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted sm:block">
              Sweep 03 / anomalous cluster watch
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
