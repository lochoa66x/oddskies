"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categoryFilters,
  coordinateToAtlasPosition,
  filterReportsByCategory,
  filterReportsByRegion,
  getReportCasePath,
  getPublicReportDisplayBadge,
  isCategoryFilter,
  regionAnchors,
  regionFilters,
  type CategoryFilter,
  type RegionFilter,
  type Report,
} from "@/lib/reports";
import { AtlasMotionGuard } from "@/components/AtlasMotionGuard";
import { OddSkiesOracle } from "@/components/OddSkiesOracle";
import { OracleReportPanel } from "@/components/OracleReportPanel";
import { WorldMapBase } from "@/components/WorldMapBase";

export function LatestReports({
  reports,
  totalCount,
}: {
  reports: Report[];
  totalCount?: number;
}) {
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All");
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("All categories");
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const filteredReports = useMemo(
    () =>
      filterReportsByCategory(
        filterReportsByRegion(reports, activeRegion),
        activeCategory,
      ),
    [activeCategory, activeRegion, reports],
  );
  const visibleReports = filteredReports.slice(0, 5);
  const selected =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0] ??
    reports[0];

  function changeRegion(region: RegionFilter) {
    const nextReports = filterReportsByCategory(
      filterReportsByRegion(reports, region),
      activeCategory,
    );

    setActiveRegion(region);
    setSelectedId(nextReports[0]?.id ?? reports[0]?.id ?? "");
  }

  function changeCategory(category: CategoryFilter) {
    const nextReports = filterReportsByCategory(
      filterReportsByRegion(reports, activeRegion),
      category,
    );

    setActiveCategory(category);
    setSelectedId(nextReports[0]?.id ?? reports[0]?.id ?? "");
  }

  useEffect(() => {
    function handleCategoryFilter(event: Event) {
      const category = (event as CustomEvent<{ category?: string }>).detail
        ?.category;

      if (!isCategoryFilter(category)) {
        return;
      }

      const nextReports = filterReportsByCategory(
        filterReportsByRegion(reports, activeRegion),
        category,
      );

      setActiveCategory(category);
      setSelectedId(nextReports[0]?.id ?? reports[0]?.id ?? "");
    }

    window.addEventListener("oddskies:category-filter", handleCategoryFilter);

    return () => {
      window.removeEventListener(
        "oddskies:category-filter",
        handleCategoryFilter,
      );
    };
  }, [activeRegion, reports]);

  return (
    <section
      className="border-y border-night-800 bg-night-900 px-5 py-8 md:py-10"
      id="reports"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Field Log
              <span className="ml-2 text-xs normal-case tracking-[0.16em] lg:hidden">
                swipe -&gt;
              </span>
              <span className="ml-2 hidden text-xs normal-case tracking-[0.16em] text-muted lg:inline">
                scroll field notes ↓
              </span>
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold text-parchment md:text-4xl">
              Latest reports, filed as unverified.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Showing the latest approved field notes. Older reports live in the
              Full Field Log, grouped into monthly sweeps.
            </p>
            {totalCount ? (
              <p className="mt-1 text-xs leading-5 text-muted">
                Showing latest {Math.min(reports.length, totalCount)} of{" "}
                {totalCount} approved reports.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/40 bg-signal-teal/15 px-4 py-2 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
                href="/field-log"
              >
                View Full Field Log
              </Link>
              <span className="text-xs leading-5 text-muted">
                Homepage is the preview. The Full Field Log keeps the rest.
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map((category) => {
            const active = category === activeCategory;

            return (
              <button
                className={`atlas-filter rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-signal-violet/60 bg-signal-violet/15 text-parchment"
                    : "border-night-800 bg-night-950/70 text-muted hover:border-signal-violet/40 hover:text-parchment"
                }`}
                key={category}
                onClick={() => changeCategory(category)}
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
          <div className="field-log-scroll-shell relative overflow-hidden rounded-lg border border-night-800 bg-night-850/45">
            <div className="field-log-list flex gap-3 overflow-x-auto p-2 lg:grid lg:max-h-[860px] lg:overflow-x-hidden lg:overflow-y-auto lg:pb-12 lg:pr-4">
              {visibleReports.length > 0 ? (
                visibleReports.map((report, index) => {
                  const selectedCard = selected?.id === report.id;
                  const compactLocationLabel = getCompactLocationLabel(
                    report.location,
                  );
                  const locationConfidenceLabel =
                    getLocationConfidenceBadge(report);

                  return (
                    <div
                      aria-pressed={selectedCard}
                      className={`report-card field-log-card group block w-full min-w-[18rem] rounded-lg border bg-night-850 p-3 text-left transition lg:min-w-0 ${
                        selectedCard
                          ? "border-signal-teal/60 shadow-glow"
                          : "border-night-800 hover:border-signal-teal/45"
                      }`}
                      key={report.id}
                      onClick={() => setSelectedId(report.id)}
                      onKeyDown={(event) => {
                        if (
                          event.target !== event.currentTarget ||
                          (event.key !== "Enter" && event.key !== " ")
                        ) {
                          return;
                        }

                        event.preventDefault();
                        setSelectedId(report.id);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3 border-b border-night-800/80 pb-2.5">
                        <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted">
                          Field note {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded border border-night-800 bg-night-950/60 px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          {getPublicReportDisplayBadge(report)}
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
                        {compactLocationLabel ? (
                          <span className={getLocationChipClass(report.location)}>
                            {compactLocationLabel}
                          </span>
                        ) : null}
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
                      <p className="field-log-summary mt-2.5 text-sm leading-6 text-muted">
                        {report.summary}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2 text-xs text-muted">
                          {report.sourceType} · {report.sourceName}
                        </span>
                        <Link
                          className="inline-flex items-center gap-2 rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-xs font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
                          href={getReportCasePath(report)}
                          onClick={(event) => event.stopPropagation()}
                        >
                          Open Case File
                        </Link>
                        <a
                          className="source-link inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold"
                          href={getSourceHref(report.sourceUrl)}
                          onClick={(event) => event.stopPropagation()}
                          rel={isExternalSource(report.sourceUrl) ? "noreferrer" : undefined}
                          target={isExternalSource(report.sourceUrl) ? "_blank" : undefined}
                        >
                          {report.sourceUrl
                            ? "View original source"
                            : "Source guidelines"}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-night-800 bg-night-850 p-5 text-sm text-muted">
                  No reports are listed for this filter yet.
                </div>
              )}
              <Link
                className="rounded-md border border-signal-teal/30 bg-signal-teal/10 px-3 py-2 text-xs font-semibold leading-5 text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
                href="/field-log"
              >
                Browse the Full Field Log →
              </Link>
            </div>
          </div>

          {selected ? (
            <ReportDetail reports={filteredReports} selected={selected} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReportDetail({
  reports,
  selected,
}: {
  reports: Report[];
  selected: Report;
}) {
  const selectedPosition = getReportPosition(selected);
  const sourceHref = getSourceHref(selected.sourceUrl);
  const external = isExternalSource(selected.sourceUrl);
  const metaLine = getLocationMetaLine(selected);
  const caseFacts = getCaseFacts(selected);
  const caseBadges = getCaseBadges(selected);

  return (
    <div className="space-y-4">
      <OddSkiesOracle />
      <aside className="field-card field-file-card overflow-hidden rounded-lg">
        <div className="border-b border-night-800 bg-night-850 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
              Open Case File
            </p>
            <h3 className="mt-2 line-clamp-3 text-2xl font-semibold text-parchment">
              {selected.title}
            </h3>
            {selected.originalTitle ? (
              <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-muted">
                Original title: {selected.originalTitle}
              </p>
            ) : null}
          </div>
          <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
            Unverified
          </span>
        </div>
        {metaLine ? <p className="mt-1 text-sm text-muted">{metaLine}</p> : null}
      </div>

      <AtlasMotionGuard className="atlas-grid detail-atlas relative min-h-[360px] overflow-hidden md:min-h-[430px] xl:min-h-[460px]">
        <WorldMapBase className="absolute inset-x-4 top-5 h-[82%] w-[calc(100%-2rem)] md:inset-x-5 md:h-[83%] md:w-[calc(100%-2.5rem)]" />
        <svg
          aria-hidden="true"
          className="atlas-route-lines absolute inset-x-7 top-8 h-[74%] w-[calc(100%-3.5rem)] md:inset-x-8 md:w-[calc(100%-4rem)]"
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
        <span
          aria-hidden="true"
          className="selected-atlas-focus absolute size-20"
          style={{
            left: `${selectedPosition.left}%`,
            top: `${selectedPosition.top}%`,
          }}
        />
        <span
          className="selected-atlas-callout absolute"
          style={{
            left: `${selectedPosition.left}%`,
            top: `${selectedPosition.top}%`,
          }}
        >
          {selected.shortLabel}
        </span>
        {reports.slice(0, 12).map((report, index) => {
          const position = getReportPosition(report);
          const active = report.id === selected.id;

          return (
            <span
              aria-label={report.shortLabel}
              className={`atlas-pin absolute rounded-full ${
                active ? "selected-atlas-pin size-5" : "size-2"
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

        <div className="absolute bottom-4 left-4 z-10 max-w-[min(24rem,calc(100%-2rem))] rounded-md border border-night-800 bg-night-950/88 px-3 py-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.38)] md:left-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`size-2.5 rounded-full ${selected.marker}`} />
            <span className="text-sm font-semibold text-parchment">
              {selected.shortLabel}
            </span>
            <span className="rounded border border-signal-amber/30 px-2 py-0.5 text-xs text-signal-amber">
              Unverified
            </span>
          </div>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
            Selected marker
          </p>
        </div>
      </AtlasMotionGuard>

      <div className="space-y-3 p-4 md:p-5">
        <div className="rounded-md border border-night-800 bg-night-950/55 p-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
            Report summary
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {selected.summary}
          </p>
        </div>

        <div className="rounded-md border border-night-800 bg-night-950/55 p-3.5">
          <div className="flex flex-wrap gap-2">
            {caseBadges.map((badge) => (
              <span
                className={`rounded border px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${badge.className}`}
                key={badge.label}
              >
                {badge.label}
              </span>
            ))}
          </div>

          <dl className="mt-3 grid gap-x-5 gap-y-3 border-t border-night-800/80 pt-3 text-sm sm:grid-cols-2">
            {caseFacts.map((fact) => (
              <div className={fact.wide ? "sm:col-span-2" : ""} key={fact.label}>
                <dt className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  {fact.label}
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold leading-5 text-parchment">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-md border border-signal-amber/25 bg-signal-amber/10 p-3.5">
            <p className="text-sm leading-6 text-signal-amber">
              OddSkies has not verified this report. It may be real, mistaken,
              AI-generated, staged, satire, folklore, or a joke. Check the
              original source when available.
            </p>
            {selected.oracleReady ? (
              <p className="mt-2 text-xs leading-5 text-muted">
                Oracle-ready means there is enough public context for a playful
                future reading. It does not mean the report is true.
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Link
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
              href={getReportCasePath(selected)}
            >
              Open Case File
            </Link>
            <a
              className="source-link inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
              href={sourceHref}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              {selected.sourceUrl ? "View original source" : "Source guidelines"}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <OracleReportPanel report={selected} />
      </div>
      </aside>
    </div>
  );
}

function getReportPosition(report: Report) {
  if (report.latitude !== null && report.longitude !== null) {
    return coordinateToAtlasPosition(report.latitude, report.longitude);
  }

  const anchor = regionAnchors[report.region];

  return coordinateToAtlasPosition(anchor.latitude, anchor.longitude);
}

function getLocationConfidenceLabel(report: Report) {
  const confidence = report.locationConfidence;
  const resolution = report.locationResolution;

  if (!confidence) {
    return "—";
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
  const tone = isMissingLocation(location)
    ? "border-night-800 bg-night-950/40 text-muted"
    : "border-night-800 bg-night-950/55 text-muted";

  return `rounded border px-2 py-1 ${tone}`;
}

function getCompactLocationLabel(location: string) {
  return isMissingLocation(location) ? "Loc: reviewing" : location;
}

function getDetailLocationLabel(location: string) {
  return isMissingLocation(location) ? "Location under review" : location;
}

function getLocationMetaLine(report: Report) {
  return [getDetailLocationLabel(report.location), report.region]
    .filter((value) => value && value !== "—" && value !== "Unknown")
    .join(" · ");
}

function getCaseFacts(report: Report) {
  const reviewTrail = [
    report.sourceQualityLabel ?? "Source-light",
    getLocationConfidenceLabel(report) !== "—"
      ? `location ${getLocationConfidenceLabel(report).toLowerCase()}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const sourceTrail = [report.sourceType, report.sourceName]
    .filter((value) => value && value !== "Unknown")
    .join(" · ");

  return [
    {
      label: "Where",
      value: getDetailLocationLabel(report.location),
    },
    ...(report.country
      ? [
          {
            label: "Country",
            value: report.country,
          },
        ]
      : []),
    {
      label: "Region",
      value: report.region,
    },
    {
      label: "When",
      value: getTimelineLabel(report),
    },
    {
      label: "Review trail",
      value: reviewTrail,
    },
    {
      label: "Source trail",
      value: sourceTrail,
      wide: true,
    },
  ].filter((fact) => fact.value && fact.value !== "Unknown");
}

function getCaseBadges(report: Report) {
  return [
    {
      className: "border-night-700 bg-night-950/70 text-parchment",
      label: report.category,
    },
    {
      className: "border-signal-amber/35 bg-signal-amber/10 text-signal-amber",
      label: report.verificationStatus,
    },
    {
      className: "border-signal-violet/35 bg-signal-violet/10 text-signal-violet",
      label: report.confidenceMood,
    },
  ];
}

function getTimelineLabel(report: Report) {
  if (report.eventDateTime === report.reportedDateTime) {
    return report.eventDateTime;
  }

  return `${report.eventDateTime} · reported ${report.reportedDateTime}`;
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

function isExternalSource(sourceUrl: string) {
  return getSourceHref(sourceUrl).startsWith("http");
}

function isMissingLocation(location: string) {
  const normalized = location.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    normalized === "location pending" ||
    normalized === "location not listed" ||
    normalized === "location under review" ||
    normalized === "unknown" ||
    normalized === "none"
  );
}

function toDisplayLabel(value: string) {
  const normalized = value.replace(/[_-]+/g, " ").trim().toLowerCase();

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
