export function OddSkiesOracle() {
  return (
    <section className="bg-night-950 px-5 py-8 md:py-10" id="oracle">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-violet">
            Feature Preview
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-parchment md:text-4xl">
            OddSkies Oracle
          </h2>
          <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-parchment md:text-lg">
            Think it&apos;s real? Ask our little bro, the OddSkies Oracle.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            The Oracle gives playful, report-based reality checks for selected
            case files — possible normal explanations, weird clues, and a
            maybe-weird verdict. It cannot verify whether something is real.
          </p>
          <p className="mt-3 max-w-xl rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
            The Oracle cannot verify whether something is real, AI-generated,
            mistaken, staged, satire, or a joke.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-signal-violet/45 bg-signal-violet/[0.16] px-5 py-3 text-sm font-bold text-parchment transition hover:border-signal-violet/70 hover:bg-signal-violet/25"
              href="/field-log"
            >
              Ask in Field Log
            </a>
            <span className="rounded-md border border-night-800 bg-night-900 px-3 py-2 text-xs font-semibold text-muted">
              Report-based alpha
            </span>
          </div>
        </div>

        <div
          aria-label="OddSkies Oracle coming soon preview"
          className="oracle-card rounded-lg border border-night-800 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-night-800 pb-3.5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-signal-teal">
                Field Assistant / Sample Read
              </p>
              <p className="mt-2 text-lg font-semibold text-parchment">
                Report: amber lights over low cloud cover
              </p>
            </div>
            <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-signal-amber">
              Oracle mood: Suspiciously Interesting
            </span>
          </div>

          <div className="mt-3 rounded-md border border-night-800 bg-night-950 p-3.5 font-mono text-sm leading-6 text-muted">
            <p className="text-signal-teal">oddskies-oracle://preview</p>
            <p className="mt-3 text-parchment">
              Could be drones, aircraft, reflection, edited media… or maybe the
              sky is just being dramatic tonight.
            </p>
            <p className="mt-3 text-xs text-muted">
              Alpha mode. Confidence: playful. Verification: none. Suggested
              next step: open a case file and compare source context.
            </p>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {["Normal explanations", "Weird clues", "Maybe-weird verdict"].map(
              (item) => (
                <span
                  className="rounded-md border border-night-800 bg-night-950/60 px-3 py-2 text-xs font-semibold text-parchment"
                  key={item}
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
