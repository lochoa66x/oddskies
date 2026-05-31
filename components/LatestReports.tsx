type Report = {
  category: string;
  location: string;
  date: string;
  summary: string;
  accent: string;
};

const reports: Report[] = [
  {
    category: "UFO/UAP",
    location: "Sedona, Arizona",
    date: "May 29, 2026",
    summary:
      "Two hikers describe a silent triangular light formation moving against wind direction.",
    accent: "text-signal-cyan",
  },
  {
    category: "Strange Lights",
    location: "Lake Erie, Ohio",
    date: "May 27, 2026",
    summary:
      "A late-night shoreline post reports pulsing amber lights over low cloud cover.",
    accent: "text-signal-amber",
  },
  {
    category: "Haunted Place",
    location: "Savannah, Georgia",
    date: "May 23, 2026",
    summary:
      "Visitors note repeated cold spots and audio anomalies inside a historic inn.",
    accent: "text-signal-green",
  },
  {
    category: "Paranormal",
    location: "Olympic Peninsula, Washington",
    date: "May 20, 2026",
    summary:
      "A local forum thread collects several accounts of distant voices near a closed trail.",
    accent: "text-signal-teal",
  },
];

export function LatestReports() {
  return (
    <section
      className="border-y border-white/10 bg-night-900/[0.82] px-5 py-16 md:py-24"
      id="reports"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-green">
              Latest Reports
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-white md:text-5xl">
              Source-linked stories, clearly marked as unverified.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">
            These are sample reports for the landing page. Live collection comes
            later.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reports.map((report) => (
            <article
              className="glass-panel flex min-h-[280px] flex-col rounded-lg p-5 transition hover:-translate-y-1 hover:border-signal-cyan/25"
              key={`${report.category}-${report.location}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-bold ${report.accent}`}>
                  {report.category}
                </p>
                <span className="rounded-md border border-signal-amber/[0.28] bg-signal-amber/10 px-2 py-1 text-xs font-semibold text-signal-amber">
                  Unverified
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                {report.location}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{report.date}</p>
              <p className="mt-5 flex-1 text-sm leading-6 text-slate-300">
                {report.summary}
              </p>
              <a
                className="mt-6 inline-flex items-center text-sm font-semibold text-signal-cyan transition hover:text-signal-green"
                href="#"
              >
                Source link placeholder -&gt;
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
