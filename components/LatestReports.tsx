type Report = {
  category: string;
  confidenceMood: string;
  eventDateTime: string;
  location: string;
  marker: string;
  reportedDateTime: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  summary: string;
  title: string;
  verificationStatus: string;
};

const reports: Report[] = [
  {
    category: "UFO / UAP",
    confidenceMood: "Mildly Odd",
    eventDateTime: "May 29, 2026 / 10:42 PM",
    location: "Sedona, Arizona",
    marker: "bg-signal-teal",
    reportedDateTime: "May 30, 2026 / 8:16 AM",
    sourceName: "Public sighting post",
    sourceType: "Social thread",
    sourceUrl: "#source-guidelines",
    summary:
      "Silent triangular light formation reported moving against wind direction.",
    title: "Silent triangular lights over ridge line",
    verificationStatus: "Unverified",
  },
  {
    category: "Strange Lights",
    confidenceMood: "Suspiciously Interesting",
    eventDateTime: "May 27, 2026 / 12:18 AM",
    location: "Lake Erie, Ohio",
    marker: "bg-signal-amber",
    reportedDateTime: "May 27, 2026 / 9:44 AM",
    sourceName: "Local shoreline forum",
    sourceType: "Community post",
    sourceUrl: "#source-guidelines",
    summary:
      "Pulsing amber lights described above low cloud cover near the shoreline.",
    title: "Amber lights reported above low cloud cover",
    verificationStatus: "Unverified",
  },
  {
    category: "Haunted Place",
    confidenceMood: "Eerie but Thin",
    eventDateTime: "May 23, 2026 / 8:05 PM",
    location: "Savannah, Georgia",
    marker: "bg-signal-violet",
    reportedDateTime: "May 24, 2026 / 11:02 AM",
    sourceName: "Historic inn review",
    sourceType: "Public review",
    sourceUrl: "#source-guidelines",
    summary:
      "Visitors note cold spots and audio anomalies inside a historic inn.",
    title: "Cold spots and odd audio noted at historic inn",
    verificationStatus: "Unverified",
  },
  {
    category: "Paranormal",
    confidenceMood: "Low Context",
    eventDateTime: "May 20, 2026 / 1:31 AM",
    location: "Olympic Peninsula, Washington",
    marker: "bg-signal-ember",
    reportedDateTime: "May 21, 2026 / 6:50 PM",
    sourceName: "Trail discussion thread",
    sourceType: "Forum post",
    sourceUrl: "#source-guidelines",
    summary:
      "Forum thread collects accounts of distant voices near a closed trail.",
    title: "Distant voices reported near closed forest trail",
    verificationStatus: "Unverified",
  },
];

const selected = reports[1];
const detailRows = [
  ["Title", selected.title],
  ["Category", selected.category],
  ["Location", selected.location],
  ["Event date/time", selected.eventDateTime],
  ["Reported date/time", selected.reportedDateTime],
  ["Source name", selected.sourceName],
  ["Source type", selected.sourceType],
  ["Verification", selected.verificationStatus],
  ["Mood label", selected.confidenceMood],
];

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
              Latest reports, unverified by default.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Source-aware, time-stamped, and linked whenever possible.
            </p>
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
                  {report.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {report.location} · {report.eventDateTime}
                </p>
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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-semibold text-parchment">
                  {selected.title}
                </h3>
                <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
                  Unverified
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {selected.location} · {selected.eventDateTime}
              </p>
            </div>

            <div className="atlas-grid detail-atlas relative min-h-[260px] overflow-hidden">
              <svg
                aria-hidden="true"
                className="atlas-landmass absolute inset-x-5 top-8 h-[70%] w-[calc(100%-2.5rem)]"
                viewBox="0 0 620 300"
              >
                <path d="M44 92c26-36 79-45 125-31 35 11 62 37 100 36 35-1 62-29 100-20 39 9 55 48 40 78-17 36-68 30-102 53-39 27-74 59-124 49-43-9-58-45-89-66-29-20-72-18-87-52-7-17 6-33 37-47Z" />
                <path d="M390 73c44-31 119-17 151 25 29 38 13 88-34 106-43 16-111 5-143-31-31-36-17-70 26-100Z" />
                <path d="M398 226c29-22 83-22 107 2 25 24 12 58-24 67-34 9-78-9-91-37-5-11-1-22 8-32Z" />
              </svg>
              <svg
                aria-hidden="true"
                className="atlas-route-lines absolute inset-x-8 top-9 h-[58%] w-[calc(100%-4rem)]"
                viewBox="0 0 560 240"
              >
                <path d="M75 94c73-39 148-35 225 12 50 30 103 31 166 4" />
                <path d="M166 180c71-52 155-59 252-20" />
              </svg>
              <span className="radar-ring absolute left-[48%] top-[35%] size-28" />
              <span className="radar-ring absolute left-[68%] top-[57%] size-20 [animation-delay:1.3s]" />
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

            <div className="space-y-5 p-5">
              <div className="rounded-md border border-night-800 bg-night-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Summary
                </p>
                <p className="mt-3 text-sm leading-6 text-parchment">
                  {selected.summary}
                </p>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                {detailRows.map(([label, value]) => (
                  <div
                    className="rounded-md border border-night-800 bg-night-950/55 p-3"
                    key={label}
                  >
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-parchment">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-3 rounded-md border border-signal-amber/25 bg-signal-amber/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-signal-amber">
                  OddSkies has not verified this report. Check the original
                  source when available.
                </p>
                <a
                  className="source-link inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
                  href={selected.sourceUrl}
                >
                  Source link placeholder
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
