"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categoryFilters,
  filterReportsByCategory,
  getPublicReportDisplayBadge,
  regionFilters,
  type CategoryFilter,
  type RegionFilter,
  type Report,
} from "@/lib/reports";
import { OracleReportPanel } from "@/components/OracleReportPanel";

const allSourceTypes = "All source types";
const allSourceQualities = "All source quality";
const allLocationConfidences = "All location confidence";
const pageSize = 12;

const fieldLogSortOptions = [
  "Newest first",
  "Oldest first",
  "Source-rich first",
  "Maybe-weird first",
] as const;

type FieldLogSort = (typeof fieldLogSortOptions)[number];

export type FieldLogInitialFilters = {
  category?: string;
  date?: string;
  from?: string;
  query?: string;
  region?: string;
  locationConfidence?: string;
  sourceQuality?: string;
  sourceType?: string;
  sort?: string;
  to?: string;
};

export function FieldLogBrowser({
  initialFilters = {},
  reports,
}: {
  initialFilters?: FieldLogInitialFilters;
  reports: Report[];
}) {
  const [query, setQuery] = useState(initialFilters.query ?? "");
  const [activeRegion, setActiveRegion] = useState<RegionFilter>(
    getInitialRegion(initialFilters.region),
  );
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>(getInitialCategory(initialFilters.category));
  const [activeSourceType, setActiveSourceType] = useState(
    initialFilters.sourceType ?? allSourceTypes,
  );
  const [activeSourceQuality, setActiveSourceQuality] =
    useState(initialFilters.sourceQuality ?? allSourceQualities);
  const [activeLocationConfidence, setActiveLocationConfidence] = useState(
    getInitialLocationConfidence(initialFilters.locationConfidence),
  );
  const [activeSort, setActiveSort] = useState<FieldLogSort>(
    getInitialSort(initialFilters.sort),
  );
  const [fromDate, setFromDate] = useState(
    getInitialDate(initialFilters.from ?? initialFilters.date),
  );
  const [toDate, setToDate] = useState(
    getInitialDate(initialFilters.to ?? initialFilters.date),
  );
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");

  const sourceTypes = useMemo(
    () => [allSourceTypes, ...getUniqueValues(reports, "sourceType")],
    [reports],
  );
  const sourceQualities = useMemo(
    () => [
      allSourceQualities,
      ...getUniqueValues(reports, "sourceQualityLabel"),
    ],
    [reports],
  );
  const locationConfidences = useMemo(
    () => [
      allLocationConfidences,
      ...getUniqueValues(reports, "locationConfidence").map(toDisplayLabel),
    ],
    [reports],
  );

  const filteredReports = useMemo(
    () => {
      const filtered = reports.filter((report) => {
        if (activeRegion !== "All" && report.region !== activeRegion) {
          return false;
        }

        if (
          activeCategory !== "All categories" &&
          filterReportsByCategory([report], activeCategory).length === 0
        ) {
          return false;
        }

        if (
          activeSourceType !== allSourceTypes &&
          report.sourceType !== activeSourceType
        ) {
          return false;
        }

        if (
          activeSourceQuality !== allSourceQualities &&
          report.sourceQualityLabel !== activeSourceQuality
        ) {
          return false;
        }

        if (
          activeLocationConfidence !== allLocationConfidences &&
          toDisplayLabel(report.locationConfidence ?? "") !==
            activeLocationConfidence
        ) {
          return false;
        }

        if (!isWithinDateRange(report, fromDate, toDate)) {
          return false;
        }

        return matchesSearch(report, query);
      });

      return sortFieldLogReports(filtered, activeSort);
    },
    [
      activeCategory,
      activeLocationConfidence,
      activeRegion,
      activeSort,
      activeSourceQuality,
      activeSourceType,
      fromDate,
      query,
      reports,
      toDate,
    ],
  );

  const visibleReports = filteredReports.slice(0, visibleCount);
  const selected =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0] ??
    reports[0];
  const monthlySweeps = useMemo(
    () => groupReportsByMonth(visibleReports),
    [visibleReports],
  );

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [
    activeCategory,
    activeLocationConfidence,
    activeRegion,
    activeSort,
    activeSourceQuality,
    activeSourceType,
    fromDate,
    query,
    toDate,
  ]);

  useEffect(() => {
    setSelectedId(filteredReports[0]?.id ?? reports[0]?.id ?? "");
  }, [filteredReports, reports]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.55fr)] lg:items-start">
      <section className="space-y-4">
        <div className="field-card p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))]">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Search
              <input
                className="min-h-11 rounded-md border border-night-800 bg-night-950 px-3 text-sm font-medium normal-case tracking-normal text-parchment outline-none transition placeholder:text-muted/70 focus:border-signal-teal/60"
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Title, summary, location, source"
                type="search"
                value={query}
              />
            </label>
            <FieldLogSelect
              label="Region"
              onChange={(value) => setActiveRegion(value as RegionFilter)}
              options={regionFilters}
              value={activeRegion}
            />
            <FieldLogSelect
              label="Category"
              onChange={(value) => setActiveCategory(value as CategoryFilter)}
              options={categoryFilters}
              value={activeCategory}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <FieldLogSelect
              label="Source type"
              onChange={setActiveSourceType}
              options={sourceTypes}
              value={activeSourceType}
            />
            <FieldLogSelect
              label="Source quality"
              onChange={setActiveSourceQuality}
              options={sourceQualities}
              value={activeSourceQuality}
            />
            <FieldLogSelect
              label="Location confidence"
              onChange={setActiveLocationConfidence}
              options={locationConfidences}
              value={activeLocationConfidence}
            />
            <FieldLogSelect
              label="Sort"
              onChange={(value) => setActiveSort(getInitialSort(value))}
              options={fieldLogSortOptions}
              value={activeSort}
            />
            <FieldLogDate
              label="From"
              onChange={setFromDate}
              value={fromDate}
            />
            <FieldLogDate label="To" onChange={setToDate} value={toDate} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-signal-teal">
              Monthly Sweeps
            </p>
            <p className="mt-1 text-sm text-muted">
              Showing {visibleReports.length} of {filteredReports.length} field
              notes. Older reports stay here instead of disappearing from the
              map preview.
            </p>
          </div>
          <button
            className="rounded-md border border-night-800 bg-night-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted transition hover:border-signal-teal/40 hover:text-parchment"
            onClick={() => {
              setActiveRegion("All");
              setActiveCategory("All categories");
              setActiveSourceType(allSourceTypes);
              setActiveSourceQuality(allSourceQualities);
              setActiveLocationConfidence(allLocationConfidences);
              setActiveSort("Newest first");
              setFromDate("");
              setToDate("");
              setQuery("");
            }}
            type="button"
          >
            Reset filters
          </button>
        </div>

        {monthlySweeps.length > 0 ? (
          <div className="space-y-4">
            {monthlySweeps.map((sweep) => (
              <section className="space-y-2" key={sweep.label}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-night-800 pb-2">
                  <h2 className="text-xl font-semibold text-parchment">
                    {sweep.label}
                  </h2>
                  <span className="rounded-md border border-night-800 bg-night-900 px-2.5 py-1 text-xs font-semibold text-muted">
                    {sweep.reports.length} field notes
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {sweep.reports.map((report) => (
                    <FieldLogCard
                      key={report.id}
                      onSelect={() => setSelectedId(report.id)}
                      report={report}
                      selected={selected?.id === report.id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="field-card p-5">
            <p className="text-sm font-semibold text-parchment">
              No signals found.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Those filters did not match the public Field Log. Widen the scan
              and the archive will try again.
            </p>
            <button
              className="mt-4 rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
              onClick={() => {
                setActiveRegion("All");
                setActiveCategory("All categories");
                setActiveSourceType(allSourceTypes);
                setActiveSourceQuality(allSourceQualities);
                setActiveLocationConfidence(allLocationConfidences);
                setActiveSort("Newest first");
                setFromDate("");
                setToDate("");
                setQuery("");
              }}
              type="button"
            >
              Clear scan
            </button>
          </div>
        )}

        {filteredReports.length > visibleReports.length ? (
          <button
            className="min-h-12 w-full rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-3 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            type="button"
          >
            Load more field notes
          </button>
        ) : null}
      </section>

      {selected ? <FieldLogCaseFile report={selected} sticky /> : null}
    </div>
  );
}

function FieldLogCard({
  onSelect,
  report,
  selected,
}: {
  onSelect: () => void;
  report: Report;
  selected: boolean;
}) {
  return (
    <button
      className={`field-log-card report-card group min-h-[17rem] rounded-lg border bg-night-850 p-3 text-left transition ${
        selected
          ? "border-signal-teal/60 shadow-glow"
          : "border-night-800 hover:border-signal-teal/45"
      }`}
      onClick={onSelect}
      type="button"
    >
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
      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-parchment transition group-hover:text-signal-teal">
        {report.title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
          {getLocationLabel(report.location)}
        </span>
        <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
          {report.eventDateTime}
        </span>
        <span className="rounded border border-signal-violet/25 bg-signal-violet/10 px-2 py-1 text-signal-violet">
          {report.confidenceMood}
        </span>
        {report.locationConfidence ? (
          <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
            Location {toDisplayLabel(report.locationConfidence)}
          </span>
        ) : null}
      </div>
      <p className="field-log-summary mt-2.5 line-clamp-3 text-sm leading-6 text-muted">
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
    </button>
  );
}

export function FieldLogCaseFile({
  report,
  sticky = false,
}: {
  report: Report;
  sticky?: boolean;
}) {
  const sourceHref = getSourceHref(report.sourceUrl);
  const external = sourceHref.startsWith("http");
  const locationConfidence = getLocationConfidenceLabel(report);
  const locationResolution = report.locationResolution
    ? toDisplayLabel(report.locationResolution)
    : "";
  const reportedDateTime =
    report.reportedDateTime && report.reportedDateTime !== "Date not listed"
      ? report.reportedDateTime
      : "";
  const originalTitle =
    report.originalTitle && report.originalTitle !== report.title
      ? report.originalTitle
      : "";

  return (
    <aside
      className={`field-card overflow-hidden rounded-lg ${
        sticky ? "lg:sticky lg:top-4" : ""
      }`}
    >
      <div className="border-b border-night-800 bg-night-850 px-4 py-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
          Open Case File
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-8 text-parchment">
          {report.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
            Unverified
          </span>
          <span className="rounded-md border border-night-800 bg-night-950/70 px-2 py-1 text-xs text-muted">
            {report.region}
          </span>
          <span className="rounded-md border border-night-800 bg-night-950/70 px-2 py-1 text-xs text-muted">
            {report.category}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="rounded-md border border-night-800 bg-night-950/55 p-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
            Report summary
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">{report.summary}</p>
          {originalTitle ? (
            <p className="mt-3 rounded border border-night-800 bg-night-950/60 px-2.5 py-2 text-xs leading-5 text-muted">
              Original title: {originalTitle}
            </p>
          ) : null}
        </div>

        <dl className="grid gap-3 rounded-md border border-night-800 bg-night-950/55 p-3.5 text-sm sm:grid-cols-2">
          {[
            ["Where", getLocationLabel(report.location)],
            ["When", report.eventDateTime],
            ...(reportedDateTime ? [["Reported", reportedDateTime]] : []),
            ...(locationConfidence
              ? [["Location confidence", locationConfidence]]
              : []),
            ...(locationResolution ? [["Location resolution", locationResolution]] : []),
            ["Source", `${report.sourceType} · ${report.sourceName}`],
            ["Quality", report.sourceQualityLabel ?? "Source-light"],
          ].map(([label, value]) => (
            <div className={label === "Source" ? "sm:col-span-2" : ""} key={label}>
              <dt className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
                {label}
              </dt>
              <dd className="mt-1 break-words font-semibold leading-5 text-parchment">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {report.sourceQualityReasons?.length ? (
          <div className="rounded-md border border-night-800 bg-night-950/55 p-3.5">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
              Source quality notes
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-muted">
              {report.sourceQualityReasons.slice(0, 4).map((reason) => (
                <li key={reason}>- {reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            href={`/field-log/${encodeURIComponent(report.id)}`}
          >
            Share this case file
          </Link>
          <a
            className="source-link inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
            href={sourceHref}
            rel={external ? "noreferrer" : undefined}
            target={external ? "_blank" : undefined}
          >
            {report.sourceUrl ? "Open source" : "Source link placeholder"}
            <span aria-hidden="true">↗</span>
          </a>
          <p className="rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
            OddSkies has not verified this report. The Oracle can compare
            context, but it cannot confirm the claim.
          </p>
          <p className="rounded-md border border-night-800 bg-night-950/60 px-3 py-2 text-xs leading-5 text-muted">
            {getSourceModeExplanation(report)}
          </p>
        </div>

        <OracleReportPanel report={report} />
      </div>
    </aside>
  );
}

function FieldLogSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
      {label}
      <select
        className="min-h-11 rounded-md border border-night-800 bg-night-950 px-3 text-sm font-medium normal-case tracking-normal text-parchment outline-none transition focus:border-signal-teal/60"
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldLogDate({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
      {label}
      <input
        className="min-h-11 rounded-md border border-night-800 bg-night-950 px-3 text-sm font-medium normal-case tracking-normal text-parchment outline-none transition focus:border-signal-teal/60"
        onChange={(event) => onChange(event.currentTarget.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

function getUniqueValues(reports: Report[], key: keyof Report) {
  return [...new Set(reports.map((report) => report[key]))]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

function getInitialRegion(value?: string): RegionFilter {
  return regionFilters.find((region) => region === value) ?? "All";
}

function getInitialCategory(value?: string): CategoryFilter {
  return categoryFilters.find((category) => category === value) ?? "All categories";
}

function getInitialSort(value?: string): FieldLogSort {
  return (
    fieldLogSortOptions.find((option) => option === value) ?? "Newest first"
  );
}

function getInitialLocationConfidence(value?: string) {
  if (!value || value === allLocationConfidences) {
    return allLocationConfidences;
  }

  return toDisplayLabel(value);
}

function getInitialDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  return value;
}

function groupReportsByMonth(reports: Report[]) {
  const groups = new Map<string, { label: string; reports: Report[] }>();

  for (const report of reports) {
    const date = getReportDate(report);
    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const label = monthFormatter.format(date);
    const group = groups.get(key) ?? { label, reports: [] };

    group.reports.push(report);
    groups.set(key, group);
  }

  return [...groups.values()];
}

function matchesSearch(report: Report, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    report.title,
    report.summary,
    report.location,
    report.region,
    report.sourceName,
    report.sourceType,
    report.sourceQualityLabel ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function isWithinDateRange(report: Report, fromDate: string, toDate: string) {
  const time = getReportDate(report).getTime();
  const fromTime = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).getTime() : 0;
  const toTime = toDate
    ? new Date(`${toDate}T23:59:59.999Z`).getTime()
    : Number.POSITIVE_INFINITY;

  return time >= fromTime && time <= toTime;
}

function sortFieldLogReports(reports: Report[], sort: FieldLogSort) {
  return [...reports].sort((a, b) => {
    if (sort === "Oldest first") {
      return getReportDate(a).getTime() - getReportDate(b).getTime();
    }

    if (sort === "Source-rich first") {
      return (
        getSourceRichScore(b) - getSourceRichScore(a) ||
        getReportDate(b).getTime() - getReportDate(a).getTime()
      );
    }

    if (sort === "Maybe-weird first") {
      return (
        getMaybeWeirdScore(b) - getMaybeWeirdScore(a) ||
        getSourceRichScore(b) - getSourceRichScore(a) ||
        getReportDate(b).getTime() - getReportDate(a).getTime()
      );
    }

    return getReportDate(b).getTime() - getReportDate(a).getTime();
  });
}

function getSourceRichScore(report: Report) {
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const sourceText = [
    sourceQuality,
    report.sourceType,
    report.sourceName,
    report.sourceUrl,
    report.originalTitle,
    report.originalSummary,
    ...(report.sourceQualityReasons ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;

  if (report.sourceUrl && report.sourceUrl !== "#source-guidelines") {
    score += 4;
  }

  if (sourceQuality.includes("context-rich")) {
    score += 5;
  }

  if (sourceQuality.includes("linked trail")) {
    score += 3;
  }

  if (report.hasMediaHint) {
    score += 2;
  }

  if (report.hasTime) {
    score += 1;
  }

  if (report.locationConfidence === "high") {
    score += 2;
  } else if (report.locationConfidence === "medium") {
    score += 1;
  }

  if (sourceText.includes("source-light") || sourceText.includes("low context")) {
    score -= 2;
  }

  return score + Math.min(report.sourceQualityReasons?.length ?? 0, 3);
}

function getMaybeWeirdScore(report: Report) {
  const text = [
    report.title,
    report.summary,
    report.confidenceMood,
    report.curationLabel,
    report.sourceQualityLabel,
    ...(report.sourceQualityReasons ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = report.displayPriority ?? 0;

  if (text.includes("suspiciously interesting")) {
    score += 8;
  }

  if (text.includes("active watch")) {
    score += 5;
  }

  if (text.includes("mildly odd")) {
    score += 3;
  }

  if (report.oracleReady) {
    score += 2;
  }

  if (text.includes("low context") || text.includes("source-light")) {
    score -= 2;
  }

  return score;
}

function getReportDate(report: Report) {
  const eventDate = new Date(report.eventDateTimeRaw);

  if (Number.isFinite(eventDate.getTime())) {
    return eventDate;
  }

  const createdDate = new Date(report.createdAtRaw ?? "");

  return Number.isFinite(createdDate.getTime()) ? createdDate : new Date(0);
}

function getLocationConfidenceLabel(report: Report) {
  if (!report.locationConfidence) {
    return "";
  }

  const confidence = toDisplayLabel(report.locationConfidence);

  return report.locationResolution
    ? `${confidence} / ${toDisplayLabel(report.locationResolution)}`
    : confidence;
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

function toDisplayLabel(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSourceModeExplanation(report: Report) {
  const sourceText = [
    report.sourceQualityLabel,
    report.sourceType,
    report.sourceName,
    report.curationLabel,
    ...(report.sourceQualityReasons ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (report.isDemo || sourceText.includes("demo seed")) {
    return "Demo seed file: sample content for testing the atlas, not a live claim.";
  }

  if (
    sourceText.includes("low context") ||
    sourceText.includes("low-context") ||
    sourceText.includes("unscored")
  ) {
    return "Low-context collector test: staged material with a thin trail, still under review.";
  }

  if (
    sourceText.includes("collector test") ||
    sourceText.includes("collector-test") ||
    sourceText.includes("staged")
  ) {
    return "Collector test file: staged collector output, reviewed before it appears publicly.";
  }

  return "Public report file: included for review and curiosity, still unverified.";
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

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});
