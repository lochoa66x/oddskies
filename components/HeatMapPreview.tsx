const clusters = [
  { label: "Pacific coast", left: "17%", top: "38%", size: 84, delay: "0s" },
  { label: "Southwest", left: "29%", top: "58%", size: 52, delay: "0.7s" },
  { label: "Great Lakes", left: "44%", top: "33%", size: 66, delay: "1.1s" },
  { label: "Atlantic", left: "63%", top: "47%", size: 96, delay: "0.3s" },
  { label: "North Sea", left: "78%", top: "27%", size: 48, delay: "1.5s" },
  { label: "Andes", left: "43%", top: "69%", size: 38, delay: "2s" },
];

const mapLabels = ["UFO/UAP", "Strange Lights", "Haunted Place", "Paranormal"];

export function HeatMapPreview() {
  return (
    <section className="bg-night-950 px-5 py-16 md:py-24" id="map">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-cyan">
            Heat Map Preview
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold text-white md:text-5xl">
            Activity clusters without pretending they are proof.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Phase 1 uses mocked report density to show how OddSkies will compare
            public stories by category, location, and time.
          </p>
        </div>

        <div className="glass-panel overflow-hidden rounded-lg shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-semibold text-white">
                Public Report Activity
              </p>
              <p className="text-sm text-slate-400">
                Public report activity, not verified events.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
              <span className="rounded-md border border-white/10 bg-night-950/60 px-2 py-1">
                6 clusters
              </span>
              <span className="rounded-md border border-white/10 bg-night-950/60 px-2 py-1">
                24h view
              </span>
              <span className="rounded-md border border-signal-amber/[0.22] bg-signal-amber/[0.08] px-2 py-1 text-signal-amber">
                Mocked
              </span>
            </div>
          </div>

          <div className="map-grid relative min-h-[380px] overflow-hidden bg-night-900">
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-signal-cyan/[0.16]" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-signal-cyan/[0.16]" />
            <div className="absolute left-[8%] top-[22%] h-24 w-44 rounded-[50%] border border-signal-teal/[0.16] bg-signal-teal/[0.08]" />
            <div className="absolute left-[34%] top-[18%] h-20 w-40 rounded-[50%] border border-signal-teal/[0.12] bg-signal-teal/[0.07]" />
            <div className="absolute left-[54%] top-[38%] h-32 w-56 rounded-[50%] border border-signal-teal/[0.14] bg-signal-teal/[0.08]" />
            <div className="absolute left-[72%] top-[18%] h-16 w-32 rounded-[50%] border border-signal-teal/[0.12] bg-signal-teal/[0.07]" />
            <div className="absolute left-[25%] top-[61%] h-14 w-36 rounded-[50%] border border-signal-teal/10 bg-signal-teal/[0.06]" />

            <div className="absolute left-5 top-5 rounded-md border border-white/10 bg-night-950/70 px-3 py-2 text-xs text-slate-400 backdrop-blur">
              Lat / long cluster preview
            </div>

            {clusters.map((cluster) => (
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
                <span className="absolute inset-[30%] rounded-full bg-signal-amber shadow-[0_0_30px_rgba(255,196,107,0.9)]" />
              </span>
            ))}

            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {mapLabels.map((label) => (
                  <span
                    className="rounded-md border border-white/10 bg-night-950/70 px-3 py-2 text-xs text-slate-300 backdrop-blur"
                    key={label}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex max-w-xs items-center gap-3 rounded-md border border-white/10 bg-night-950/75 px-3 py-2 text-xs text-slate-400 backdrop-blur">
                <span>Fewer reports</span>
                <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-signal-teal/40 via-signal-amber/80 to-signal-ember" />
                <span>More reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
