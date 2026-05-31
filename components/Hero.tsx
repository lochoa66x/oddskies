const heroClusters = [
  { label: "UFO / UAP", left: "19%", top: "34%", size: 92, delay: "0s" },
  { label: "Strange Lights", left: "37%", top: "57%", size: 58, delay: "0.6s" },
  { label: "Haunted Places", left: "59%", top: "44%", size: 112, delay: "1.1s" },
  { label: "Local Legends", left: "76%", top: "28%", size: 66, delay: "1.7s" },
  { label: "Unknown", left: "70%", top: "71%", size: 46, delay: "2.2s" },
];

const heroTags = ["UFO / UAP", "Strange Lights", "Haunted Places", "Unknown"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-night-800 bg-night-950">
      <div className="absolute inset-0 bg-star-field opacity-80" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-teal/50 to-transparent" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
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
          {["Map", "Reports", "Oracle", "Policy"].map((item) => (
            <a
              className="rounded px-3 py-2 transition hover:bg-night-850 hover:text-parchment"
              href={item === "Policy" ? "#policy" : `#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[86svh] max-w-7xl gap-10 px-5 pb-14 pt-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:pb-24 lg:pt-16">
        <div>
          <p className="inline-flex rounded-md border border-signal-amber/30 bg-signal-amber/10 px-3 py-2 text-sm font-semibold text-signal-amber">
            Mystery Atlas / Phase 1 Preview
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.95] text-parchment sm:text-6xl lg:text-7xl">
            Explore the weird side of the map.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
            OddSkies organizes strange, unverified public reports — from UFOs
            and strange lights to haunted places and local legends — by time,
            place, category, and source.
          </p>
          <p className="mt-5 max-w-xl rounded-md border border-night-800 bg-night-900/80 px-4 py-3 text-sm font-semibold text-parchment">
            Verified? No. Interesting? Maybe. Source-linked? Always.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
            <div className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs text-muted">
              45.5017 N / 73.5673 W
            </div>
          </div>

          <div className="atlas-grid relative min-h-[430px] overflow-hidden">
            <div className="scan-line absolute left-0 top-20 h-px w-full" />
            <div className="absolute left-[8%] top-[22%] h-32 w-48 rounded-[52%_48%_58%_42%] atlas-shape" />
            <div className="absolute left-[34%] top-[30%] h-24 w-40 rounded-[44%_56%_42%_58%] atlas-shape" />
            <div className="absolute left-[55%] top-[46%] h-36 w-56 rounded-[57%_43%_45%_55%] atlas-shape" />
            <div className="absolute left-[69%] top-[18%] h-20 w-36 rounded-[50%] atlas-shape" />

            <div className="absolute left-5 top-5 rounded-md border border-night-800 bg-night-950/80 px-3 py-2 text-xs text-muted">
              Field layer: public-source report density
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
                <span className="absolute inset-[32%] rounded-full bg-signal-amber shadow-[0_0_30px_rgba(246,180,75,0.9)]" />
              </span>
            ))}

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
