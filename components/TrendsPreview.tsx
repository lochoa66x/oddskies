const trends = [
  {
    label: "Reports by region",
    value: "Sample region",
    detail: "Preview label only",
  },
  {
    label: "Most active time",
    value: "Sample window",
    detail: "Not live timing",
  },
  {
    label: "Reports this month",
    value: "Mock count",
    detail: "Placeholder metric",
  },
  {
    label: "Top category",
    value: "Sample category",
    detail: "Preview ranking",
  },
];

export function TrendsPreview() {
  return (
    <section
      className="bg-night-950 bg-star-field px-5 py-16 md:py-24"
      id="trends"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-cyan">
            Trends Preview
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
            A dashboard for patterns, not conclusions.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            OddSkies is built to help people explore report volume, timing, and
            public-source patterns without claiming a report is true.
          </p>
          <p className="mt-5 inline-flex rounded-lg border border-signal-amber/[0.22] bg-signal-amber/[0.08] px-4 py-3 text-sm text-signal-amber">
            Coming soon: these trend tiles are mocked sample data.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trends.map((trend) => (
            <div className="glass-panel rounded-lg p-5" key={trend.label}>
              <p className="text-sm text-slate-400">{trend.label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">
                {trend.value}
              </p>
              <p className="mt-3 text-sm text-signal-green">{trend.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
