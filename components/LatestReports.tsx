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
import { WorldMapBase } from "@/components/WorldMapBase";

export function LatestReports({ reports }: { reports: Report[] }) {
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All");
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const filteredReports = useMemo(
    () => filterReportsByRegion(reports, activeRegion),
    [activeRegion, reports],
  );
  const visibleReports = filteredReports.slice(0, 4);
  const selected =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0] ??
    reports[0];
  const selectedCountry = selected ? getCountry(selected.location) : "";
  const detailRows = selected
    ? [
        ["Category", selected.category],
        ["Location", selected.location],
        ["Region", selected.region],
        ["Country", selectedCountry],
        ["Event date/time", selected.eventDateTime],
        ["Reported date/time", selected.reportedDateTime],
        ["Source name", selected.sourceName],
        ["Source type", selected.sourceType],
        ["Source quality", selected.sourceQualityLabel ?? "Source-light"],
        ["Location confidence", getLocationConfidenceLabel(selected)],
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
      className="border-y border-night-800 bg-night-900 px-5 py-9 md:py-12"
      id="reports"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Field Log
              <span className="ml-2 text-xs normal-case tracking-[0.16em] lg:hidden">
                swipe -&gt;
              </span>
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-parchment md:text-5xl">
              Latest reports, filed as unverified.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Source-aware, time-stamped, and linked whenever possible.
            </p>
          </div>
          <p className="max-w-sm rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
            Global seed reports are concept data for Phase 2. Live collectors
            are not connected yet.
          </p>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
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

        <div className="grid items-start gap-4 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="field-log-list flex gap-3 overflow-x-auto pb-1 lg:grid lg:max-h-[760px] lg:overflow-x-hidden lg:overflow-y-auto lg:pr-1">
            {visibleReports.length > 0 ? (
              visibleReports.map((report, index) => {
                const selectedCard = selected?.id === report.id;
                const locationConfidenceLabel =
                  getLocationConfidenceBadge(report);

                return (
                  <button
                    aria-pressed={selectedCard}
                    className={`report-card field-log-card group block w-full min-w-[18rem] rounded-lg border bg-night-850 p-3.5 text-left transition lg:min-w-0 ${
                      selectedCard
                        ? "border-signal-teal/60 shadow-glow"
                        : "border-night-800 hover:border-signal-teal/45"
                    }`}
                    key={report.id}
                    onClick={() => setSelectedId(report.id)}
                    type="button"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 border-b border-night-800/80 pb-2.5">
                      <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted">
                        Field note {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded border border-night-800 bg-night-950/60 px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-muted">
                        {report.sourceQualityLabel ?? "Source trail"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${report.marker}`}
                        />
                        <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-parchment">
                          {report.category}
                        </p>
                      </div>
                      <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
                        Unverified
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold leading-6 text-parchment transition group-hover:text-signal-teal">
                      {report.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                      <span className={getLocationChipClass(report.location)}>
                        {report.location}
                      </span>
                      <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
                        {report.eventDateTime}
                      </span>
                      <span className="rounded border border-signal-violet/25 bg-signal-violet/10 px-2 py-1 text-signal-violet">
                        {report.confidenceMood}
                      </span>
                      {locationConfidenceLabel ? (
                        <span className="rounded border border-signal-teal/25 bg-signal-teal/10 px-2 py-1 text-signal-teal">
                          {locationConfidenceLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="field-log-summary mt-3 text-sm leading-6 text-muted">
                      {report.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2 text-xs text-muted">
                        {report.sourceType} · {report.sourceName}
                      </span>
                      <span className="source-link inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold">
                        {report.sourceUrl
                          ? "View source"
                          : "Source link placeholder"}
                        <span aria-hidden="true">↗</span>
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-lg border border-night-800 bg-night-850 p-5 text-sm text-muted">
                No reports are listed for this region yet.
              </div>
            )}
            {filteredReports.length > visibleReports.length ? (
              <p className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2 text-xs leading-5 text-muted">
                Showing {visibleReports.length} preview artifacts from this
                filter. More report browsing comes later.
              </p>
            ) : null}
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
  const sourceHref =
    selected.sourceUrl === "#source-guidelines"
      ? "/source-guidelines"
      : selected.sourceUrl || "/source-guidelines";
  const external = sourceHref.startsWith("http");
  const selectedCountry = getCountry(selected.location);

  return (
    <aside className="field-card field-file-card overflow-hidden rounded-lg">
      <div className="border-b border-night-800 bg-night-850 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
              Open Field File
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-parchment">
              {selected.title}
            </h3>
            {selected.originalTitle ? (
              <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
                Original title: {selected.originalTitle}
              </p>
            ) : null}
          </div>
          <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
            Unverified
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {selected.location} · {selected.region} · {selectedCountry}
        </p>
      </div>

      <div className="atlas-grid detail-atlas relative min-h-[225px] overflow-hidden">
        <WorldMapBase className="absolute inset-x-5 top-8 h-[70%] w-[calc(100%-2.5rem)]" />
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

      <div className="space-y-3.5 p-4 md:p-5">
        <dl className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
          {detailRows.map(([label, value]) => (
            <div
              className="rounded-md border border-night-800 bg-night-950/55 p-2.5"
              key={label}
            >
              <dt className="text-[0.68rem] text-muted">{label}</dt>
              <dd className="mt-1 text-xs font-semibold leading-5 text-parchment">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-md border border-signal-amber/25 bg-signal-amber/10 p-3.5">
            <p className="text-sm leading-6 text-signal-amber">
              OddSkies has not verified this report. Check the original source
              when available.
            </p>
            {selected.oracleReady ? (
              <p className="mt-2 text-xs leading-5 text-muted">
                Oracle-ready means there is enough public context for a playful
                future reading. It does not mean the report is true.
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <a
              className="source-link inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
              href={sourceHref}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              {selected.sourceUrl ? "Open source" : "Source link placeholder"}
              <span aria-hidden="true">↗</span>
            </a>
            <a
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-signal-violet/35 bg-signal-violet/10 px-3 py-2 text-sm font-semibold text-parchment transition hover:border-signal-violet/70 hover:bg-signal-violet/20"
              href="#oracle"
            >
              Ask the Oracle
            </a>
          </div>
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

function getCountry(location: string) {
  if (isPendingLocation(location)) {
    return "Unknown";
  }

  return location.split(",").at(-1)?.trim() || "Unknown";
}

function getLocationConfidenceLabel(report: Report) {
  const confidence = report.locationConfidence;
  const resolution = report.locationResolution;

  if (!confidence) {
    return "Location pending";
  }

  return resolution
    ? `${toDisplayLabel(confidence)} / ${toDisplayLabel(resolution)}`
    : toDisplayLabel(confidence);
}

function getLocationConfidenceBadge(report: Report) {
  if (!report.locationConfidence) {
    return undefined;
  }

  return `Location ${toDisplayLabel(report.locationConfidence)}`;
}

function getLocationChipClass(location: string) {
  const tone = isPendingLocation(location)
    ? "border-night-800 bg-night-950/40 text-muted"
    : "border-night-800 bg-night-950/55 text-muted";

  return `rounded border px-2 py-1 ${tone}`;
}

function isPendingLocation(location: string) {
  return location.trim().toLowerCase() === "location pending";
}

function toDisplayLabel(value: string) {
  const normalized = value.replace(/[_-]+/g, " ").trim().toLowerCase();

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
