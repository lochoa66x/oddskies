const badges = [
  "Unverified by default",
  "Source-linked when available",
  "AI summaries may be imperfect",
  "Public reports, not confirmed events",
];

export function Disclaimer() {
  return (
    <section className="border-y border-night-800 bg-night-900 px-5 py-16" id="about">
      <div className="mx-auto max-w-5xl">
        <div className="field-card rounded-lg p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-amber">
            Honesty / Source Policy
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-parchment md:text-4xl">
            Strange reports, honestly mapped.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            OddSkies cannot confirm whether reports are real, mistaken,
            AI-generated, edited, staged, satire, jokes, or paranormal. We
            organize public reports and source links for curiosity,
            entertainment, and trend exploration.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                className="rounded-md border border-night-800 bg-night-850 px-3 py-2 text-xs font-semibold text-parchment"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
