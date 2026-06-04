const phaseTwoSignals = [
  {
    label: "Live collectors",
    status: "Warming up",
  },
  {
    label: "Oracle",
    status: "Sleeping lightly",
  },
  {
    label: "Global map",
    status: "Preparing to move",
  },
];

export function PhaseTwoDispatch() {
  return (
    <section className="bg-night-950 px-5 py-6 md:py-8" id="phase-2">
      <div className="mx-auto max-w-7xl">
        <div className="field-card relative overflow-hidden rounded-lg border-signal-teal/25 p-4 md:p-5">
          <span
            aria-hidden="true"
            className="absolute -right-14 -top-14 size-44 rounded-full bg-signal-teal/10 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-signal-violet/45 to-transparent"
          />

          <div className="relative grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-amber">
                Phase 2 Dispatch
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-parchment md:text-4xl">
                The map is about to get weirder.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base md:leading-7">
                Live collectors go online. The Oracle wakes up. The map starts
                moving on its own.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Reports will still be unverified. OddSkies just gets better at
                keeping the trail organized.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-3">
                {phaseTwoSignals.map((signal) => (
                  <div
                    className="rounded-md border border-night-800 bg-night-950/70 p-3"
                    key={signal.label}
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
                      {signal.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-parchment">
                      {signal.status}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-signal-teal/40 bg-signal-teal/15 px-4 py-2 text-sm font-bold text-signal-teal transition hover:border-signal-teal/70 hover:bg-signal-teal/20"
                  href="#reports"
                >
                  Watch the field log
                </a>
                <a
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-signal-violet/35 bg-signal-violet/10 px-4 py-2 text-sm font-bold text-parchment transition hover:border-signal-violet/70 hover:bg-signal-violet/20"
                  href="#oracle"
                >
                  Check the Oracle preview
                </a>
              </div>

              <p className="rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
                No confirmed events, no dramatic certainty. Just a stranger
                little map getting ready for its next sweep.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
