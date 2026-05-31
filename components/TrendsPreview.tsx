const trends = [
  {
    label: "Reports by region",
    value: "Northeast corridor",
    detail: "Mocked density lead",
  },
  {
    label: "Most active time",
    value: "9 PM - 1 AM",
    detail: "Local report window",
  },
  {
    label: "Reports this month",
    value: "1,284",
    detail: "Sample value only",
  },
  {
    label: "Top category",
    value: "Strange Lights",
    detail: "Mocked category rank",
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
