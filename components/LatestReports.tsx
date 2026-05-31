type Report = {
  category: string;
  dateTime: string;
  location: string;
  marker: string;
  summary: string;
};

const reports: Report[] = [
  {
    category: "UFO / UAP",
    dateTime: "May 29, 2026 / 10:42 PM",
    location: "Sedona, Arizona",
    marker: "bg-signal-teal",
    summary:
      "Silent triangular light formation reported moving against wind direction.",
  },
  {
    category: "Strange Lights",
    dateTime: "May 27, 2026 / 12:18 AM",
    location: "Lake Erie, Ohio",
    marker: "bg-signal-amber",
    summary:
      "Pulsing amber lights described above low cloud cover near the shoreline.",
  },
  {
    category: "Haunted Place",
    dateTime: "May 23, 2026 / 8:05 PM",
    location: "Savannah, Georgia",
    marker: "bg-signal-violet",
    summary:
      "Visitors note cold spots and audio anomalies inside a historic inn.",
  },
  {
    category: "Paranormal",
    dateTime: "May 20, 2026 / 1:31 AM",
    location: "Olympic Peninsula, Washington",
    marker: "bg-signal-ember",
    summary:
      "Forum thread collects accounts of distant voices near a closed trail.",
  },
];

const selected = reports[1];

export function LatestReports() {
  return (
    <section
      className="border-y border-night-800 bg-night-900 px-5 py-16 md:py-24"
      id="reports"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Report Feed
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-parchment md:text-5xl">
              Latest reports, source-aware and unverified by default.
            </h2>
          </div>
          <p className="max-w-md rounded-md border border-signal-amber/25 bg-signal-amber/10 px-4 py-3 text-sm text-signal-amber">
            Mock reports for Phase 1. Live collectors are not connected yet.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {reports.map((report) => (
              <article
                className="report-card rounded-lg border border-night-800 bg-night-850 p-5 transition hover:border-signal-teal/45"
                key={`${report.category}-${report.location}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`size-2.5 rounded-full ${report.marker}`} />
                    <p className="text-sm font-bold text-parchment">
                      {report.category}
                    </p>
                  </div>
                  <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
                    Unverified
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-parchment">
                  {report.location}
                </h3>
                <p className="mt-1 text-sm text-muted">{report.dateTime}</p>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {report.summary}
                </p>
                <a
                  className="source-link mt-5 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
                  href="#"
                >
                  Source link placeholder
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>

          <aside className="field-card overflow-hidden rounded-lg">
            <div className="border-b border-night-800 bg-night-850 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
                Selected Detail
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-parchment">
                {selected.location}
              </h3>
              <p className="mt-1 text-sm text-muted">{selected.dateTime}</p>
            </div>

            <div className="atlas-grid relative min-h-[330px] overflow-hidden">
              <div className="absolute left-[14%] top-[28%] h-20 w-36 rounded-[50%] atlas-shape" />
              <div className="absolute left-[48%] top-[38%] h-28 w-48 rounded-[46%_54%_48%_52%] atlas-shape" />
              <div className="absolute left-[68%] top-[64%] h-16 w-28 rounded-[50%] atlas-shape" />
              <span className="atlas-pin absolute left-[57%] top-[43%] size-3 rounded-full" />
              <span className="atlas-pin absolute left-[33%] top-[61%] size-2 rounded-full [animation-delay:0.7s]" />
              <span className="atlas-pin absolute left-[76%] top-[29%] size-2 rounded-full [animation-delay:1.4s]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-md border border-night-800 bg-night-950/85 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`size-2.5 rounded-full ${selected.marker}`} />
                  <span className="text-sm font-semibold text-parchment">
                    {selected.category}
                  </span>
                  <span className="rounded border border-signal-amber/30 px-2 py-0.5 text-xs text-signal-amber">
                    Unverified
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {selected.summary}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
