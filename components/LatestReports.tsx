type Report = {
  category: string;
  location: string;
  date: string;
  summary: string;
  accent: string;
  icon: string;
  tone: string;
};

const reports: Report[] = [
  {
    category: "UFO/UAP",
    location: "Sedona, Arizona",
    date: "May 29, 2026",
    summary:
      "Two hikers describe a silent triangular light formation moving against wind direction.",
    accent: "text-signal-cyan",
    icon: "U",
    tone: "border-signal-cyan/30 bg-signal-cyan/10 text-signal-cyan",
  },
  {
    category: "Strange Lights",
    location: "Lake Erie, Ohio",
    date: "May 27, 2026",
    summary:
      "A late-night shoreline post reports pulsing amber lights over low cloud cover.",
    accent: "text-signal-amber",
    icon: "L",
    tone: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
  },
  {
    category: "Haunted Place",
    location: "Savannah, Georgia",
    date: "May 23, 2026",
    summary:
      "Visitors note repeated cold spots and audio anomalies inside a historic inn.",
    accent: "text-signal-green",
    icon: "H",
    tone: "border-signal-green/30 bg-signal-green/10 text-signal-green",
  },
  {
    category: "Paranormal",
    location: "Olympic Peninsula, Washington",
    date: "May 20, 2026",
    summary:
      "A local forum thread collects several accounts of distant voices near a closed trail.",
    accent: "text-signal-teal",
    icon: "P",
    tone: "border-signal-teal/30 bg-signal-teal/10 text-signal-teal",
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
          <div className="max-w-md rounded-lg border border-signal-amber/[0.22] bg-signal-amber/[0.08] px-4 py-3 text-sm leading-6 text-signal-amber">
            Phase 1 preview: these report cards are mocked sample data, not a
            live feed.
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reports.map((report) => (
            <article
              className="report-card glass-panel flex min-h-[310px] flex-col rounded-lg p-5 transition hover:-translate-y-1 hover:border-signal-cyan/35"
              key={`${report.category}-${report.location}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-9 place-items-center rounded-lg border text-xs font-black ${report.tone}`}
                  >
                    {report.icon}
                  </span>
                  <p className={`text-sm font-bold ${report.accent}`}>
                    {report.category}
                  </p>
                </div>
                <span className="rounded-md border border-signal-amber/40 bg-signal-amber/15 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
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
                className="mt-6 inline-flex items-center justify-between gap-3 rounded-md border border-signal-cyan/20 bg-signal-cyan/[0.07] px-3 py-2 text-sm font-semibold text-signal-cyan transition hover:border-signal-green/35 hover:text-signal-green"
                href="#"
              >
                <span>Source link placeholder</span>
                <span className="rounded border border-current/30 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                  External
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
