import Link from "next/link";

export function OddSkiesOracle() {
  return (
    <aside
      className="oracle-card max-w-md rounded-lg border border-signal-violet/40 p-3.5"
      id="oracle"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-night-800 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-violet">
            Oracle Alpha
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-7 text-parchment">
            Ask the Oracle beside the field notes.
          </h3>
        </div>
        <span className="rounded-md border border-signal-amber/40 bg-signal-amber/10 px-2.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-signal-amber">
          Alpha
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">
        The Oracle gives playful, report-based reality checks for selected case
        files: normal explanations, weird clues, and a maybe-weird verdict.
        Nothing here verifies the report.
      </p>

      <div className="mt-3 rounded-md border border-night-800 bg-night-950/70 p-3 font-mono text-xs leading-5 text-muted">
        <p className="uppercase tracking-[0.18em] text-signal-teal">
          Sample read
        </p>
        <p className="mt-2 font-semibold text-parchment">
          Could be drones, aircraft, reflection, edited media... or the sky
          being dramatic tonight.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {["Normal first", "Weird clues", "No fake certainty"].map((item) => (
          <span
            className="rounded-full border border-night-800 bg-night-950 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted"
            key={item}
          >
            {item}
          </span>
        ))}
      </div>

      <Link
        className="mt-3 inline-flex w-full justify-center rounded-md border border-signal-violet/45 bg-signal-violet/[0.16] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-parchment transition hover:border-signal-violet/70 hover:bg-signal-violet/25"
        href="/field-log"
      >
        Open Oracle Case Files
      </Link>
    </aside>
  );
}
