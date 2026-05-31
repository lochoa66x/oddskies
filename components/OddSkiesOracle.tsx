export function OddSkiesOracle() {
  return (
    <section
      className="border-y border-white/10 bg-night-900 px-5 py-16 md:py-24"
      id="oracle"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-green">
            OddSkies Oracle
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold text-white md:text-5xl">
            Think it&apos;s real? Ask our little bro, the OddSkies Oracle.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            The Oracle is a planned playful AI feature that suggests ordinary,
            unusual, and delightfully weird possible explanations. It does not
            verify reports.
          </p>
          <a
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-signal-green px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-signal-cyan"
            href="#oracle"
          >
            Ask the Oracle
          </a>
        </div>

        <div className="oracle-card glass-panel relative overflow-hidden rounded-lg p-6 md:p-8">
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-lg border border-signal-cyan/[0.35] bg-signal-cyan/10 text-lg font-black text-signal-cyan">
                  O
                </div>
                <div>
                  <p className="font-semibold text-white">Oracle Preview</p>
                  <p className="text-sm text-slate-400">
                    Playful explanations, not verification.
                  </p>
                </div>
              </div>
              <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-signal-amber">
                Mildly Odd
              </span>
            </div>

            <div className="mt-7 rounded-lg border border-white/10 bg-night-950/70 p-5">
              <p className="text-sm text-slate-400">Sample prompt</p>
              <p className="mt-2 text-lg font-medium text-white">
                Three lights drifted over the ridge, then blinked out one by
                one.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-signal-teal/[0.18] bg-signal-teal/[0.08] p-5">
              <p className="text-sm font-semibold text-signal-green">
                Suspiciously Interesting
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Could be aircraft lights, drones, atmospheric reflection, a
                camera artifact, an edited post, or something worth comparing
                against nearby reports.
              </p>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              The Oracle offers playful possibilities only. It does not verify,
              debunk, or confirm reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
