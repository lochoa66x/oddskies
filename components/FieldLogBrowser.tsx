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
import {
  categoryLabel,
  localizedReportCasePath,
  regionLabel,
  sortLabel,
  uiLabel,
  type Locale,
} from "@/lib/i18n";
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
  locale = "en",
  reports,
}: {
  initialFilters?: FieldLogInitialFilters;
  locale?: Locale;
  reports: Report[];
}) {
  const copy = getFieldLogCopy(locale);
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
    () => groupReportsByMonth(visibleReports, locale),
    [locale, visibleReports],
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
              {copy.search}
              <input
                className="min-h-11 rounded-md border border-night-800 bg-night-950 px-3 text-sm font-medium normal-case tracking-normal text-parchment outline-none transition placeholder:text-muted/70 focus:border-signal-teal/60"
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={copy.searchPlaceholder}
                type="search"
                value={query}
              />
            </label>
            <FieldLogSelect
              formatOption={(value) => regionLabel(value, locale)}
              label={copy.region}
              onChange={(value) => setActiveRegion(value as RegionFilter)}
              options={regionFilters}
              value={activeRegion}
            />
            <FieldLogSelect
              formatOption={(value) => categoryLabel(value, locale)}
              label={copy.category}
              onChange={(value) => setActiveCategory(value as CategoryFilter)}
              options={categoryFilters}
              value={activeCategory}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <FieldLogSelect
              formatOption={(value) =>
                value === allSourceTypes ? copy.allSourceTypes : uiLabel(value, locale)
              }
              label={copy.sourceType}
              onChange={setActiveSourceType}
              options={sourceTypes}
              value={activeSourceType}
            />
            <FieldLogSelect
              formatOption={(value) =>
                value === allSourceQualities
                  ? copy.allSourceQualities
                  : uiLabel(value, locale)
              }
              label={copy.sourceQuality}
              onChange={setActiveSourceQuality}
              options={sourceQualities}
              value={activeSourceQuality}
            />
            <FieldLogSelect
              formatOption={(value) =>
                value === allLocationConfidences
                  ? copy.allLocationConfidences
                  : uiLabel(value, locale)
              }
              label={copy.locationConfidence}
              onChange={setActiveLocationConfidence}
              options={locationConfidences}
              value={activeLocationConfidence}
            />
            <FieldLogSelect
              formatOption={(value) => sortLabel(value, locale)}
              label={copy.sort}
              onChange={(value) => setActiveSort(getInitialSort(value))}
              options={fieldLogSortOptions}
              value={activeSort}
            />
            <FieldLogDate
              label={copy.from}
              onChange={setFromDate}
              value={fromDate}
            />
            <FieldLogDate label={copy.to} onChange={setToDate} value={toDate} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-signal-teal">
              {copy.monthlySweeps}
            </p>
            <p className="mt-1 text-sm text-muted">
              {copy.showing(visibleReports.length, filteredReports.length)}
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
            {copy.resetFilters}
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
                    {copy.fieldNotes(sweep.reports.length)}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {sweep.reports.map((report) => (
                    <FieldLogCard
                      locale={locale}
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
              {copy.noSignals}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {copy.noSignalsDescription}
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
              {copy.clearScan}
            </button>
          </div>
        )}

        {filteredReports.length > visibleReports.length ? (
          <button
            className="min-h-12 w-full rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-3 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            type="button"
          >
            {copy.loadMore}
          </button>
        ) : null}
      </section>

      {selected ? (
        <FieldLogCaseFile locale={locale} report={selected} sticky />
      ) : null}
    </div>
  );
}

function FieldLogCard({
  locale,
  onSelect,
  report,
  selected,
}: {
  locale: Locale;
  onSelect: () => void;
  report: Report;
  selected: boolean;
}) {
  const copy = getFieldLogCopy(locale);
  const sourceHref = getSourceHref(report.sourceUrl);
  const external = sourceHref.startsWith("http");

  return (
    <article
      className={`field-log-card report-card group min-h-[17rem] rounded-lg border bg-night-850 p-3 text-left transition ${
        selected
          ? "border-signal-teal/60 shadow-glow"
          : "border-night-800 hover:border-signal-teal/45"
      }`}
    >
      <button className="block w-full text-left" onClick={onSelect} type="button">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-night-800/80 pb-2.5">
          <span className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted">
            {copy.fieldNote}
          </span>
          <span className="rounded border border-night-800 bg-night-950/60 px-2 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {uiLabel(getPublicReportDisplayBadge(report), locale)}
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`size-2.5 shrink-0 rounded-full ${report.marker}`} />
            <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-parchment">
              {categoryLabel(report.category, locale)}
            </p>
          </div>
          <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
            {uiLabel("Unverified", locale)}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-parchment transition group-hover:text-signal-teal">
          {report.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
            {getLocationLabel(report.location, locale)}
          </span>
          <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
            {report.eventDateTime}
          </span>
          <span className="rounded border border-signal-violet/25 bg-signal-violet/10 px-2 py-1 text-signal-violet">
            {uiLabel(report.confidenceMood, locale)}
          </span>
          {report.locationConfidence ? (
            <span className="rounded border border-night-800 bg-night-950/55 px-2 py-1">
              {copy.locationBadge(uiLabel(report.locationConfidence, locale))}
            </span>
          ) : null}
        </div>
        <p className="field-log-summary mt-2.5 line-clamp-3 text-sm leading-6 text-muted">
          {report.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2">
            {uiLabel(report.sourceType, locale)}
          </span>
          <span className="rounded-md border border-night-800 bg-night-950/70 px-3 py-2">
            {uiLabel(report.sourceQualityLabel ?? "Source-light", locale)}
          </span>
        </div>
      </button>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-xs font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
          href={localizedReportCasePath(report, locale)}
        >
          {copy.openCase}
        </Link>
        <a
          className="source-link inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold"
          href={sourceHref}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {report.sourceUrl ? copy.originalSource : copy.sourceGuidelines}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export function FieldLogCaseFile({
  locale = "en",
  report,
  sticky = false,
}: {
  locale?: Locale;
  report: Report;
  sticky?: boolean;
}) {
  const copy = getFieldLogCopy(locale);
  const sourceHref = getSourceHref(report.sourceUrl);
  const external = sourceHref.startsWith("http");
  const locationConfidence = getLocationConfidenceLabel(report, locale);
  const locationResolution = report.locationResolution
    ? uiLabel(report.locationResolution, locale)
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
          {copy.openCaseHeading}
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-8 text-parchment">
          {report.title}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
            {uiLabel("Unverified", locale)}
          </span>
          <span className="rounded-md border border-night-800 bg-night-950/70 px-2 py-1 text-xs text-muted">
            {regionLabel(report.region, locale)}
          </span>
          <span className="rounded-md border border-night-800 bg-night-950/70 px-2 py-1 text-xs text-muted">
            {categoryLabel(report.category, locale)}
          </span>
          <span className="rounded-md border border-signal-violet/25 bg-signal-violet/10 px-2 py-1 text-xs text-signal-violet">
            {uiLabel(report.confidenceMood, locale)}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="rounded-md border border-night-800 bg-night-950/55 p-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
            {copy.reportSummary}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">{report.summary}</p>
          {originalTitle ? (
            <p className="mt-3 rounded border border-night-800 bg-night-950/60 px-2.5 py-2 text-xs leading-5 text-muted">
              {copy.originalTitle}: {originalTitle}
            </p>
          ) : null}
        </div>

        <dl className="grid gap-3 rounded-md border border-night-800 bg-night-950/55 p-3.5 text-sm sm:grid-cols-2">
          {[
            [copy.where, getLocationLabel(report.location, locale)],
            ...(report.country ? [[copy.country, report.country]] : []),
            [copy.region, regionLabel(report.region, locale)],
            [copy.when, report.eventDateTime],
            ...(reportedDateTime ? [[copy.reported, reportedDateTime]] : []),
            ...(locationConfidence ? [[copy.locationConfidence, locationConfidence]] : []),
            ...(locationResolution ? [[copy.locationResolution, locationResolution]] : []),
            [
              copy.source,
              `${uiLabel(report.sourceType, locale)} · ${report.sourceName}`,
            ],
            [copy.quality, uiLabel(report.sourceQualityLabel ?? "Source-light", locale)],
          ].map(([label, value]) => (
            <div className={label === copy.source ? "sm:col-span-2" : ""} key={label}>
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
              {copy.sourceQualityNotes}
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
            href={localizedReportCasePath(report, locale)}
          >
            {copy.shareCase}
          </Link>
          <a
            className="source-link inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
            href={sourceHref}
            rel={external ? "noreferrer" : undefined}
            target={external ? "_blank" : undefined}
          >
            {report.sourceUrl ? copy.originalSource : copy.sourceGuidelines}
            <span aria-hidden="true">↗</span>
          </a>
          <p className="rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
            {copy.unverifiedNote}
          </p>
          <p className="rounded-md border border-night-800 bg-night-950/60 px-3 py-2 text-xs leading-5 text-muted">
            {getSourceModeExplanation(report, locale)}
          </p>
        </div>

        <OracleReportPanel locale={locale} report={report} />
      </div>
    </aside>
  );
}

function FieldLogSelect({
  formatOption = (option) => option,
  label,
  onChange,
  options,
  value,
}: {
  formatOption?: (option: string) => string;
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
            {formatOption(option)}
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

function groupReportsByMonth(reports: Report[], locale: Locale) {
  const groups = new Map<string, { label: string; reports: Report[] }>();
  const formatter = locale === "es" ? monthFormatterEs : monthFormatterEn;
  const filedLabel = locale === "es" ? "Archivado" : "Filed";

  for (const report of reports) {
    const date = getReportFiledDate(report);
    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const label = `${filedLabel} ${formatter.format(date)}`;
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
  const time = getReportFiledDate(report).getTime();
  const fromTime = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).getTime() : 0;
  const toTime = toDate
    ? new Date(`${toDate}T23:59:59.999Z`).getTime()
    : Number.POSITIVE_INFINITY;

  return time >= fromTime && time <= toTime;
}

function sortFieldLogReports(reports: Report[], sort: FieldLogSort) {
  return [...reports].sort((a, b) => {
    if (sort === "Oldest first") {
      return getReportFiledDate(a).getTime() - getReportFiledDate(b).getTime();
    }

    if (sort === "Source-rich first") {
      return (
        getSourceRichScore(b) - getSourceRichScore(a) ||
        getReportFiledDate(b).getTime() - getReportFiledDate(a).getTime()
      );
    }

    if (sort === "Maybe-weird first") {
      return (
        getMaybeWeirdScore(b) - getMaybeWeirdScore(a) ||
        getSourceRichScore(b) - getSourceRichScore(a) ||
        getReportFiledDate(b).getTime() - getReportFiledDate(a).getTime()
      );
    }

    return getReportFiledDate(b).getTime() - getReportFiledDate(a).getTime();
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

function getReportFiledDate(report: Report) {
  const createdDate = new Date(report.createdAtRaw ?? "");

  if (Number.isFinite(createdDate.getTime())) {
    return createdDate;
  }

  return getReportDate(report);
}

function getLocationConfidenceLabel(report: Report, locale: Locale) {
  if (!report.locationConfidence) {
    return "";
  }

  const confidence = uiLabel(report.locationConfidence, locale);

  return report.locationResolution
    ? `${confidence} / ${uiLabel(report.locationResolution, locale)}`
    : confidence;
}

function getLocationLabel(location: string, locale: Locale) {
  const normalized = location.trim().toLowerCase();

  if (
    !normalized ||
    normalized === "unknown" ||
    normalized === "location pending" ||
    normalized === "location not listed" ||
    normalized === "location under review"
  ) {
    return locale === "es" ? "Ubicación en revisión" : "Location under review";
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

function getSourceModeExplanation(report: Report, locale: Locale) {
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
    if (locale === "es") {
      return "Archivo demo: contenido de muestra para probar el atlas, no una afirmación en vivo.";
    }

    return "Demo seed file: sample content for testing the atlas, not a live claim.";
  }

  if (
    sourceText.includes("low context") ||
    sourceText.includes("low-context") ||
    sourceText.includes("unscored")
  ) {
    if (locale === "es") {
      return "Prueba de colector con poco contexto: material con rastro débil, aún en revisión.";
    }

    return "Low-context collector test: staged material with a thin trail, still under review.";
  }

  if (
    sourceText.includes("collector test") ||
    sourceText.includes("collector-test") ||
    sourceText.includes("staged")
  ) {
    if (locale === "es") {
      return "Archivo de prueba del colector: salida revisada antes de aparecer públicamente.";
    }

    return "Collector test file: staged collector output, reviewed before it appears publicly.";
  }

  if (locale === "es") {
    return "Archivo público: incluido para revisión y curiosidad; sigue sin verificarse.";
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

function getFieldLogCopy(locale: Locale) {
  if (locale === "es") {
    return {
      allLocationConfidences: "Toda confianza de ubicación",
      allSourceQualities: "Toda calidad de fuente",
      allSourceTypes: "Todos los tipos de fuente",
      category: "Categoría",
      clearScan: "Limpiar búsqueda",
      country: "País",
      fieldNote: "Nota de campo",
      fieldNotes: (count: number) =>
        count === 1 ? "1 nota de campo" : `${count} notas de campo`,
      from: "Desde",
      loadMore: "Cargar más notas de campo",
      locationBadge: (confidence: string) =>
        `Ubicación ${confidence.toLowerCase()}`,
      locationConfidence: "Confianza de ubicación",
      locationResolution: "Resolución de ubicación",
      monthlySweeps: "Barridos mensuales",
      noSignals: "No se encontraron señales.",
      noSignalsDescription:
        "Estos filtros no coinciden con el Registro público. Amplía la búsqueda y el Registro intentará otra vez.",
      openCase: "Abrir expediente",
      openCaseHeading: "Expediente abierto",
      originalSource: "Ver fuente original",
      originalTitle: "Título original",
      quality: "Calidad",
      region: "Región",
      reported: "Reportado",
      reportSummary: "Resumen del reporte",
      resetFilters: "Restablecer filtros",
      search: "Buscar",
      searchPlaceholder: "Título, resumen, ubicación, fuente",
      shareCase: "Compartir este expediente",
      showing: (visible: number, total: number) =>
        `Mostrando ${visible} de ${total} notas de campo. Los barridos se agrupan por cuándo los reportes entraron a OddSkies; las fechas del evento quedan dentro de cada expediente.`,
      sort: "Orden",
      source: "Fuente",
      sourceGuidelines: "Guía de fuentes",
      sourceQuality: "Calidad de fuente",
      sourceQualityNotes: "Notas de calidad de fuente",
      sourceType: "Tipo de fuente",
      to: "Hasta",
      unverifiedNote:
        "OddSkies no ha verificado este reporte. Puede ser real, equivocado, generado por IA, montado, sátira, folclore o una broma. Revisa la fuente original cuando esté disponible.",
      when: "Cuándo",
      where: "Dónde",
    };
  }

  return {
    allLocationConfidences,
    allSourceQualities,
    allSourceTypes,
    category: "Category",
    clearScan: "Clear scan",
    country: "Country",
    fieldNote: "Field note",
    fieldNotes: (count: number) =>
      count === 1 ? "1 field note" : `${count} field notes`,
    from: "From",
    loadMore: "Load more field notes",
    locationBadge: (confidence: string) => `Location ${confidence}`,
    locationConfidence: "Location confidence",
    locationResolution: "Location resolution",
    monthlySweeps: "Monthly Sweeps",
    noSignals: "No signals found.",
    noSignalsDescription:
      "Those filters did not match the public Field Log. Widen the scan and the Field Log will try again.",
    openCase: "Open Case File",
    openCaseHeading: "Open Case File",
    originalSource: "View original source",
    originalTitle: "Original title",
    quality: "Quality",
    region: "Region",
    reported: "Reported",
    reportSummary: "Report summary",
    resetFilters: "Reset filters",
    search: "Search",
    searchPlaceholder: "Title, summary, location, source",
    shareCase: "Share this case file",
    showing: (visible: number, total: number) =>
      `Showing ${visible} of ${total} field notes. Sweeps are grouped by when reports joined OddSkies, while event dates stay inside each case file.`,
    sort: "Sort",
    source: "Source",
    sourceGuidelines: "Source guidelines",
    sourceQuality: "Source quality",
    sourceQualityNotes: "Source quality notes",
    sourceType: "Source type",
    to: "To",
    unverifiedNote:
      "OddSkies has not verified this report. It may be real, mistaken, AI-generated, staged, satire, folklore, or a joke. Check the original source when available.",
    when: "When",
    where: "Where",
  };
}

const monthFormatterEn = new Intl.DateTimeFormat("en", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const monthFormatterEs = new Intl.DateTimeFormat("es", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});
