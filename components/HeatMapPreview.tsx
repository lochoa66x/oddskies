const clusters = [
  { label: "Pacific coast", left: "17%", top: "36%", size: 78 },
  { label: "Southwest", left: "28%", top: "55%", size: 52 },
  { label: "Great Lakes", left: "44%", top: "31%", size: 62 },
  { label: "Atlantic", left: "62%", top: "43%", size: 86 },
  { label: "North Sea", left: "76%", top: "27%", size: 46 },
];

const mapLabels = ["UFO/UAP", "Strange Lights", "Haunted Place", "Paranormal"];

export function HeatMapPreview() {
  return (
    <section
      className="bg-night-950 px-5 py-16 md:py-24"
      id="map"
    >
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

        <div className="glass-panel overflow-hidden rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-semibold text-white">Public Report Activity</p>
              <p className="text-sm text-slate-400">
                Public report activity, not verified events.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="size-2 rounded-full bg-signal-green shadow-[0_0_18px_rgba(168,255,191,0.9)]" />
              Mocked preview
            </div>
          </div>

          <div className="map-grid relative min-h-[330px] overflow-hidden bg-night-900">
            <div className="absolute left-[10%] top-[22%] h-24 w-40 rounded-[50%] border border-signal-teal/[0.14] bg-signal-teal/[0.08] blur-[0.2px]" />
            <div className="absolute left-[34%] top-[18%] h-20 w-36 rounded-[50%] border border-signal-teal/[0.12] bg-signal-teal/[0.07]" />
            <div className="absolute left-[55%] top-[34%] h-28 w-52 rounded-[50%] border border-signal-teal/[0.12] bg-signal-teal/[0.08]" />
            <div className="absolute left-[71%] top-[18%] h-16 w-28 rounded-[50%] border border-signal-teal/[0.12] bg-signal-teal/[0.07]" />
            <div className="absolute left-[24%] top-[58%] h-14 w-32 rounded-[50%] border border-signal-teal/10 bg-signal-teal/6" />

            {clusters.map((cluster) => (
              <span
                aria-label={cluster.label}
                className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-ember/30 shadow-heat"
                key={cluster.label}
                style={{
                  height: cluster.size,
                  left: cluster.left,
                  top: cluster.top,
                  width: cluster.size,
                }}
              >
                <span className="absolute inset-[28%] rounded-full bg-signal-amber/80 shadow-[0_0_28px_rgba(255,196,107,0.8)]" />
              </span>
            ))}

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {mapLabels.map((label) => (
                <span
                  className="rounded-md border border-white/10 bg-night-950/70 px-3 py-2 text-xs text-slate-300 backdrop-blur"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
