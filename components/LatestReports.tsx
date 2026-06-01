type Report = {
  category: string;
  confidenceMood: string;
  eventDateTime: string;
  location: string;
  marker: string;
  region: string;
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
    region: "United States",
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
    region: "United States / Canada",
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
    eventDateTime: "May 23, 2026 / 11:15 PM",
    location: "Dublin, Ireland",
    marker: "bg-signal-violet",
    region: "UK & Ireland",
    reportedDateTime: "May 24, 2026 / 10:21 AM",
    sourceName: "Neighborhood history thread",
    sourceType: "Public forum post",
    sourceUrl: "#source-guidelines",
    summary:
      "Residents trade stories about knocks, cold windows, and a stairwell voice.",
    title: "Dublin whisper house thread resurfaces",
    verificationStatus: "Unverified",
  },
  {
    category: "Strange Lights",
    confidenceMood: "Active Watch",
    eventDateTime: "May 22, 2026 / 9:03 PM",
    location: "Puebla, Mexico",
    marker: "bg-signal-ember",
    region: "Mexico",
    reportedDateTime: "May 23, 2026 / 7:42 AM",
    sourceName: "Volcano watch clip thread",
    sourceType: "Public video post",
    sourceUrl: "#source-guidelines",
    summary:
      "Bright point described hovering near the Popocatepetl skyline before fading.",
    title: "Popocatepetl watch light near skyline",
    verificationStatus: "Unverified",
  },
  {
    category: "UFO / UAP",
    confidenceMood: "Mildly Odd",
    eventDateTime: "May 19, 2026 / 1:04 AM",
    location: "Sao Paulo, Brazil",
    marker: "bg-signal-teal",
    region: "Brazil",
    reportedDateTime: "May 19, 2026 / 8:33 AM",
    sourceName: "City skywatch thread",
    sourceType: "Social thread",
    sourceUrl: "#source-guidelines",
    summary:
      "Small cluster of pale green lights reported drifting above high-rise rooftops.",
    title: "Sao Paulo signal above rooftop line",
    verificationStatus: "Unverified",
  },
  {
    category: "Unknown",
    confidenceMood: "Low Context",
    eventDateTime: "May 18, 2026 / 12:27 AM",
    location: "Tokyo, Japan",
    marker: "bg-muted",
    region: "East Asia",
    reportedDateTime: "May 18, 2026 / 6:18 AM",
    sourceName: "Late-night sky post",
    sourceType: "Social post",
    sourceUrl: "#source-guidelines",
    summary:
      "Blue-white pulse captured between buildings with little location context.",
    title: "Tokyo sky pulse between towers",
    verificationStatus: "Unverified",
  },
  {
    category: "Local Legends",
    confidenceMood: "Folklore Signal",
    eventDateTime: "May 14, 2026 / 10:58 PM",
    location: "Northern Territory, Australia",
    marker: "bg-signal-amber",
    region: "Australia / New Zealand",
    reportedDateTime: "May 15, 2026 / 4:02 PM",
    sourceName: "Outback travel log",
    sourceType: "Public blog post",
    sourceUrl: "#source-guidelines",
    summary:
      "Orange disc-like glow described low over a distant ridgeline after sundown.",
    title: "Outback fire disc near remote ridge",
    verificationStatus: "Unverified",
  },
  {
    category: "Paranormal",
    confidenceMood: "Eerie but Thin",
    eventDateTime: "May 12, 2026 / 2:11 AM",
    location: "Black Forest, Germany",
    marker: "bg-signal-violet",
    region: "Western Europe",
    reportedDateTime: "May 12, 2026 / 11:39 AM",
    sourceName: "Regional mystery board",
    sourceType: "Community post",
    sourceUrl: "#source-guidelines",
    summary:
      "Hikers describe repeating knocks and a distant voice near an old trail marker.",
    title: "Black Forest echo near old trail marker",
    verificationStatus: "Unverified",
  },
];

const selected = reports[5];
const detailRows = [
  ["Title", selected.title],
  ["Category", selected.category],
  ["Region", selected.region],
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
                className="atlas-map-base absolute inset-x-5 top-8 h-[70%] w-[calc(100%-2.5rem)]"
                viewBox="0 0 1000 500"
              >
                <path d="M100 132c31-46 83-71 141-70 45 1 78 21 114 42 31 18 78 16 99 50 24 40-10 73-48 88-44 17-66 52-92 87-28 39-83 54-126 27-38-23-42-73-76-99-39-30-66-76-12-125Z" />
                <path d="M286 318c42 14 72 44 84 84 10 36-4 67-25 91-39-17-58-47-78-85-18-34-25-62 19-90Z" />
                <path d="M430 150c35-35 92-39 135-22 33 13 59 42 94 49 43 9 83-28 130-6 44 21 73 70 63 117-11 54-62 75-112 61-39-11-70-43-112-37-41 6-69 43-112 34-47-10-74-58-67-101 5-34 30-61-19-95Z" />
                <path d="M715 330c29-23 79-18 116 2 34 19 66 47 69 87-44 22-100 12-141-17-30-21-61-44-44-72Z" />
              </svg>
              <svg
                aria-hidden="true"
                className="atlas-route-lines absolute inset-x-8 top-9 h-[58%] w-[calc(100%-4rem)]"
                viewBox="0 0 1000 430"
              >
                <path d="M190 184c122-72 235-63 338 27 105 91 218 97 339 21" />
                <path d="M632 214c71-13 142 7 213 60" />
              </svg>
              <span className="radar-ring absolute left-[81%] top-[43%] size-28" />
              <span className="radar-ring absolute left-[35%] top-[74%] size-20 [animation-delay:1.3s]" />
              <span className="atlas-pin absolute left-[81%] top-[43%] size-3 rounded-full" />
              <span className="atlas-pin absolute left-[47%] top-[33%] size-2 rounded-full [animation-delay:0.7s]" />
              <span className="atlas-pin absolute left-[80%] top-[75%] size-2 rounded-full [animation-delay:1.4s]" />
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
