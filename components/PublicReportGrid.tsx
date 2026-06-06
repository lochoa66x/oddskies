import Link from "next/link";
import {
  getPublicReportDisplayBadge,
  getReportCasePath,
  type Report,
} from "@/lib/reports";

export function PublicReportGrid({
  emptyCopy = "No public field notes are filed here yet.",
  reports,
}: {
  emptyCopy?: string;
  reports: Report[];
}) {
  if (reports.length === 0) {
    return (
      <div className="field-card p-5">
        <p className="text-sm font-semibold text-parchment">{emptyCopy}</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          The archive is still warming up. Reports wait for review before they
          join the public Field Log.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => (
        <PublicReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

export function PublicReportCard({ report }: { report: Report }) {
  const sourceHref = getSourceHref(report.sourceUrl);
  const external = sourceHref.startsWith("http");
  const location = getLocationLabel(report.location);

  return (
    <article className="field-log-card report-card group flex min-h-[18rem] flex-col rounded-lg border border-night-800 bg-night-850 p-3 text-left transition hover:border-signal-teal/45">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-night-800/80 pb-2.5">
        <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Field note
        </span>
        <span className="rounded border border-night-800 bg-night-950/60 px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-muted">
          {getPublicReportDisplayBadge(report)}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`size-2.5 shrink-0 rounded-full ${report.marker}`} />
          <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-parchment">
            {report.category}
          </p>
        </div>
        <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
          Unverified
        </span>
      </div>

      <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-7 text-parchment transition group-hover:text-signal-teal">
        {report.title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
          {location}
        </span>
        <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
          {report.eventDateTime}
        </span>
        <span className="rounded border border-signal-violet/25 bg-signal-violet/10 px-2 py-1 text-signal-violet">
          {report.confidenceMood}
        </span>
      </div>

      <p className="mt-2.5 line-clamp-3 text-sm leading-6 text-muted">
        {report.summary}
      </p>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2">
          {report.sourceType}
        </span>
        <span className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2">
          {report.sourceQualityLabel ?? "Source-light"}
        </span>
      </div>

      <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-xs font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
          href={getReportCasePath(report)}
        >
          Open Case File
        </Link>
        <a
          className="source-link inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold"
          href={sourceHref}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {report.sourceUrl ? "View original source" : "Source guidelines"}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

function getLocationLabel(location: string) {
  const normalized = location.trim().toLowerCase();

  if (
    !normalized ||
    normalized === "unknown" ||
    normalized === "location pending" ||
    normalized === "location not listed" ||
    normalized === "location under review"
  ) {
    return "Location under review";
  }

  return location;
}

function getSourceHref(sourceUrl: string) {
  if (!sourceUrl || sourceUrl === "#source-guidelines") {
    return "/source-guidelines";
  }

  if (/^https?:\/\//i.test(sourceUrl) || sourceUrl.startsWith("/")) {
    return sourceUrl;
  }

  if (/^(www\.|[a-z0-9.-]+\.[a-z]{2,}\/?)/i.test(sourceUrl)) {
    return `https://${sourceUrl}`;
  }

  return sourceUrl;
}
