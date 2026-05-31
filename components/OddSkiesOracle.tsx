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
        </div>

        <div className="glass-panel relative overflow-hidden rounded-lg p-6 md:p-8">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-signal-cyan/[0.14] blur-3xl" />
          <div className="relative">
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

            <div className="mt-7 rounded-lg border border-white/10 bg-night-950/70 p-5">
              <p className="text-sm text-slate-400">Sample prompt</p>
              <p className="mt-2 text-lg font-medium text-white">
                Three lights drifted over the ridge, then blinked out one by
                one.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-signal-teal/[0.18] bg-signal-teal/[0.08] p-5">
              <p className="text-sm text-signal-green">Oracle response style</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Could be aircraft lights, drones, atmospheric reflection, a
                camera artifact, an edited post, or something worth comparing
                against nearby reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
