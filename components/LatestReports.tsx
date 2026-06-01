"use client";

import { useMemo, useState } from "react";
import {
  coordinateToAtlasPosition,
  filterReportsByRegion,
  regionAnchors,
  regionFilters,
  type RegionFilter,
  type Report,
} from "@/lib/reports";

export function LatestReports({ reports }: { reports: Report[] }) {
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All");
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const filteredReports = useMemo(
    () => filterReportsByRegion(reports, activeRegion),
    [activeRegion, reports],
  );
  const selected =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0] ??
    reports[0];
  const detailRows = selected
    ? [
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
      ]
    : [];

  function changeRegion(region: RegionFilter) {
    const nextReports = filterReportsByRegion(reports, region);

    setActiveRegion(region);
    setSelectedId(nextReports[0]?.id ?? reports[0]?.id ?? "");
  }

  return (
    <section
      className="border-y border-night-800 bg-night-900 px-5 py-16 md:py-24"
      id="reports"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
            Global seed reports are concept data for Phase 2. Live collectors
            are not connected yet.
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {regionFilters.map((region) => {
            const active = region === activeRegion;

            return (
              <button
                className={`atlas-filter rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-signal-teal/60 bg-signal-teal/15 text-parchment"
                    : "border-night-800 bg-night-950/70 text-muted hover:border-signal-teal/40 hover:text-parchment"
                }`}
                key={region}
                onClick={() => changeRegion(region)}
                type="button"
              >
                {region}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const selectedCard = selected?.id === report.id;

                return (
                  <button
                    className={`report-card block w-full rounded-lg border bg-night-850 p-5 text-left transition ${
                      selectedCard
                        ? "border-signal-teal/60 shadow-glow"
                        : "border-night-800 hover:border-signal-teal/45"
                    }`}
                    key={report.id}
                    onClick={() => setSelectedId(report.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-2.5 rounded-full ${report.marker}`}
                        />
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
                    <span className="source-link mt-5 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold">
                      {report.sourceUrl
                        ? "Source link"
                        : "Source link placeholder"}
                      <span aria-hidden="true">↗</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-lg border border-night-800 bg-night-850 p-5 text-sm text-muted">
                No reports are listed for this region yet.
              </div>
            )}
          </div>

          {selected ? (
            <ReportDetail
              detailRows={detailRows}
              reports={filteredReports}
              selected={selected}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReportDetail({
  detailRows,
  reports,
  selected,
}: {
  detailRows: string[][];
  reports: Report[];
  selected: Report;
}) {
  const selectedPosition = getReportPosition(selected);
  const sourceHref = selected.sourceUrl || "#source-guidelines";
  const external = sourceHref.startsWith("http");

  return (
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

        <span
          className="radar-ring absolute size-28"
          style={{
            left: `${selectedPosition.left}%`,
            top: `${selectedPosition.top}%`,
          }}
        />
        {reports.slice(0, 12).map((report, index) => {
          const position = getReportPosition(report);
          const active = report.id === selected.id;

          return (
            <span
              aria-label={report.shortLabel}
              className={`atlas-pin absolute rounded-full ${
                active ? "size-4" : "size-2"
              }`}
              key={report.id}
              style={{
                animationDelay: `${index * 0.3}s`,
                left: `${position.left}%`,
                top: `${position.top}%`,
              }}
            />
          );
        })}

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
            OddSkies has not verified this report. Check the original source
            when available.
          </p>
          <a
            className="source-link inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
            href={sourceHref}
            rel={external ? "noreferrer" : undefined}
            target={external ? "_blank" : undefined}
          >
            {selected.sourceUrl ? "Open source" : "Source link placeholder"}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

function getReportPosition(report: Report) {
  if (report.latitude !== null && report.longitude !== null) {
    return coordinateToAtlasPosition(report.latitude, report.longitude);
  }

  const anchor = regionAnchors[report.region];

  return coordinateToAtlasPosition(anchor.latitude, anchor.longitude);
}
