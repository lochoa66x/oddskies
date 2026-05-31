export function OddSkiesOracle() {
  return (
    <section className="bg-night-950 px-5 py-16 md:py-24" id="oracle">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-violet">
            OddSkies Oracle
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-parchment md:text-5xl">
            Think it&apos;s real? Ask our little bro, the OddSkies Oracle.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            The Oracle gives playful, AI-generated reality checks for strange
            reports — possible normal explanations, weird clues, and a
            maybe-weird verdict. It cannot verify sightings.
          </p>
          <p className="mt-4 max-w-xl rounded-md border border-signal-amber/25 bg-signal-amber/10 px-4 py-3 text-sm leading-6 text-signal-amber">
            The Oracle cannot verify whether something is real, AI-generated,
            mistaken, staged, satire, or a joke.
          </p>
          <a
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-signal-violet px-5 py-3 text-sm font-bold text-parchment transition hover:bg-signal-teal hover:text-night-950"
            href="#oracle"
          >
            Ask the Oracle
          </a>
        </div>

        <div className="oracle-card rounded-lg border border-night-800 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-night-800 pb-4">
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

          <div className="mt-5 rounded-md border border-night-800 bg-night-950 p-5 font-mono text-sm leading-7 text-muted">
            <p className="text-signal-teal">oddskies-oracle://reading</p>
            <p className="mt-4 text-parchment">
              Could be drones, aircraft, reflection, edited media… or maybe the
              sky is just being dramatic tonight.
            </p>
            <p className="mt-4 text-xs text-muted">
              Confidence: playful. Verification: none. Suggested next step:
              compare nearby reports and source context.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
