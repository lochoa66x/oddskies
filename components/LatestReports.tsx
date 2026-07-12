"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categoryFilters,
  filterReportsByCategory,
  filterReportsByRegion,
  getPublicReportDisplayBadge,
  isCategoryFilter,
  regionFilters,
  type CategoryFilter,
  type RegionFilter,
  type Report,
} from "@/lib/reports";
import {
  categoryLabel,
  localizedPath,
  localizedReportCasePath,
  regionLabel,
  uiLabel,
  type Locale,
} from "@/lib/i18n";
import { OracleReportPanel } from "@/components/OracleReportPanel";

const ALL_CATEGORIES_PREVIEW_LIMIT = 5;
const CATEGORY_PREVIEW_LIMIT = 3;

export function LatestReports({
  locale = "en",
  reports,
  totalCount,
}: {
  locale?: Locale;
  reports: Report[];
  totalCount?: number;
}) {
  const copy = getLatestReportsCopy(locale);
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
  const previewLimit =
    activeCategory === "All categories"
      ? ALL_CATEGORIES_PREVIEW_LIMIT
      : CATEGORY_PREVIEW_LIMIT;
  const visibleReports = filteredReports.slice(0, previewLimit);
  const matchingCount = filteredReports.length;
  const visibleCount = Math.min(previewLimit, matchingCount);
  const countLabel =
    activeCategory === "All categories" && activeRegion === "All"
      ? copy.approvedCount(visibleCount, totalCount ?? reports.length)
      : copy.matchingCount(visibleCount, matchingCount);
  const selected =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0];

  function changeRegion(region: RegionFilter) {
    const nextReports = filterReportsByCategory(
      filterReportsByRegion(reports, region),
      activeCategory,
    );

    setActiveRegion(region);
    setSelectedId(nextReports[0]?.id ?? "");
  }

  function changeCategory(category: CategoryFilter) {
    const nextReports = filterReportsByCategory(
      filterReportsByRegion(reports, activeRegion),
      category,
    );

    setActiveCategory(category);
    setSelectedId(nextReports[0]?.id ?? "");
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
      setSelectedId(nextReports[0]?.id ?? "");
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
              {copy.kicker}
              <span className="ml-2 text-xs normal-case tracking-[0.16em] lg:hidden">
                {copy.swipe}
              </span>
              <span className="ml-2 hidden text-xs normal-case tracking-[0.16em] text-muted lg:inline">
                {copy.scroll}
              </span>
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-semibold text-parchment md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              {copy.description}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">{countLabel}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/40 bg-signal-teal/15 px-4 py-2 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
                href={localizedPath(locale, "/field-log")}
              >
                {copy.fullLog}
              </Link>
              <span className="text-xs leading-5 text-muted">
                {copy.previewNote}
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
                {regionLabel(region, locale)}
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
                {categoryLabel(category, locale)}
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
                    locale,
                  );
                  const locationConfidenceLabel =
                    getLocationConfidenceBadge(report, locale);

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
                          {uiLabel(getPublicReportDisplayBadge(report), locale)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`size-2.5 shrink-0 rounded-full ${report.marker}`}
                          />
                          <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-parchment">
                            {categoryLabel(report.category, locale)}
                          </p>
                        </div>
                        <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
                          {uiLabel("Unverified", locale)}
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
                          {uiLabel(report.confidenceMood, locale)}
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
                          {uiLabel(report.sourceType, locale)} · {report.sourceName}
                        </span>
                        <Link
                          className="inline-flex items-center gap-2 rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-xs font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
                          href={localizedReportCasePath(report, locale)}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {copy.openCase}
                        </Link>
                        <a
                          className="source-link inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold"
                          href={getSourceHref(report.sourceUrl)}
                          onClick={(event) => event.stopPropagation()}
                          rel={isExternalSource(report.sourceUrl) ? "noreferrer" : undefined}
                          target={isExternalSource(report.sourceUrl) ? "_blank" : undefined}
                        >
                          {report.sourceUrl
                            ? copy.originalSource
                            : copy.sourceGuidelines}
                          <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-night-800 bg-night-850 p-5 text-sm text-muted">
                  {copy.empty}
                </div>
              )}
              <Link
                className="rounded-md border border-signal-teal/30 bg-signal-teal/10 px-3 py-2 text-xs font-semibold leading-5 text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
                href={localizedPath(locale, "/field-log")}
              >
                {copy.browseFullLog}
              </Link>
            </div>
          </div>

          {selected ? (
            <ReportDetail locale={locale} selected={selected} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReportDetail({
  locale,
  selected,
}: {
  locale: Locale;
  selected: Report;
}) {
  const copy = getLatestReportsCopy(locale);
  const sourceHref = getSourceHref(selected.sourceUrl);
  const external = isExternalSource(selected.sourceUrl);
  const metaLine = getLocationMetaLine(selected, locale);
  const caseFacts = getCaseFacts(selected, locale);
  const caseBadges = getCaseBadges(selected);

  return (
    <aside className="field-card field-file-card overflow-hidden rounded-lg">
      <div className="border-b border-night-800 bg-night-850 px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
              {copy.openCaseHeading}
            </p>
            <h3 className="mt-2 line-clamp-3 text-2xl font-semibold text-parchment">
              {selected.title}
            </h3>
            {selected.originalTitle ? (
              <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-muted">
                {copy.originalTitle}: {selected.originalTitle}
              </p>
            ) : null}
          </div>
          <span className="rounded-md border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs font-bold uppercase text-signal-amber">
            {uiLabel("Unverified", locale)}
          </span>
        </div>
        {metaLine ? <p className="mt-1 text-sm text-muted">{metaLine}</p> : null}
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <OracleReportPanel locale={locale} report={selected} />

        <div className="rounded-md border border-night-800 bg-night-950/55 p-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
            {copy.reportSummary}
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
                {categoryLabel(uiLabel(badge.label, locale), locale)}
              </span>
            ))}
          </div>

          <dl className="mt-3 grid gap-x-5 gap-y-3 border-t border-night-800/80 pt-3 text-sm sm:grid-cols-2">
            {caseFacts.map((fact) => (
              <div className={fact.wide ? "sm:col-span-2" : ""} key={fact.label}>
                <dt className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  {copy.factLabels[fact.label] ?? fact.label}
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
              {copy.unverifiedNote}
            </p>
            {selected.oracleReady ? (
              <p className="mt-2 text-xs leading-5 text-muted">
                {copy.oracleReadyNote}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Link
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-3 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
              href={localizedReportCasePath(selected, locale)}
            >
              {copy.openCase}
            </Link>
            <a
              className="source-link inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
              href={sourceHref}
              rel={external ? "noreferrer" : undefined}
              target={external ? "_blank" : undefined}
            >
              {selected.sourceUrl ? copy.originalSource : copy.sourceGuidelines}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

function getLocationConfidenceLabel(report: Report, locale: Locale = "en") {
  const confidence = report.locationConfidence;
  const resolution = report.locationResolution;

  if (!confidence) {
    return "—";
  }

  return resolution
    ? `${uiLabel(confidence, locale)} / ${uiLabel(resolution, locale)}`
    : uiLabel(confidence, locale);
}

function getLocationConfidenceBadge(report: Report, locale: Locale = "en") {
  if (!report.locationConfidence) {
    return undefined;
  }

  return locale === "es"
    ? `Ubicación ${uiLabel(report.locationConfidence, locale).toLowerCase()}`
    : `Location ${toDisplayLabel(report.locationConfidence)}`;
}

function getLocationChipClass(location: string) {
  const tone = isMissingLocation(location)
    ? "border-night-800 bg-night-950/40 text-muted"
    : "border-night-800 bg-night-950/55 text-muted";

  return `rounded border px-2 py-1 ${tone}`;
}

function getCompactLocationLabel(location: string, locale: Locale = "en") {
  if (!isMissingLocation(location)) {
    return location;
  }

  return locale === "es" ? "Ubicación: revisión" : "Loc: reviewing";
}

function getDetailLocationLabel(location: string, locale: Locale = "en") {
  if (!isMissingLocation(location)) {
    return location;
  }

  return locale === "es" ? "Ubicación en revisión" : "Location under review";
}

function getLocationMetaLine(report: Report, locale: Locale) {
  return [getDetailLocationLabel(report.location, locale), regionLabel(report.region, locale)]
    .filter((value) => value && value !== "—" && value !== "Unknown")
    .join(" · ");
}

function getCaseFacts(report: Report, locale: Locale) {
  const reviewTrail = [
    uiLabel(report.sourceQualityLabel ?? "Source-light", locale),
    getLocationConfidenceLabel(report, locale) !== "—"
      ? `${locale === "es" ? "ubicación" : "location"} ${getLocationConfidenceLabel(report, locale).toLowerCase()}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const sourceTrail = [uiLabel(report.sourceType, locale), report.sourceName]
    .filter((value) => value && value !== "Unknown")
    .join(" · ");

  return [
    {
      label: "Where",
      value: getDetailLocationLabel(report.location, locale),
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
      value: regionLabel(report.region, locale),
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

function getLatestReportsCopy(locale: Locale) {
  if (locale === "es") {
    return {
      approvedCount: (visible: number, total: number) =>
        `Mostrando los ${visible} más recientes de ${total} reportes aprobados.`,
      browseFullLog: "Explorar el Registro completo →",
      description:
        "Mostrando las notas de campo aprobadas más recientes. Los reportes anteriores viven en el Registro completo, agrupados por barridos mensuales.",
      empty: "Aún no hay reportes para este filtro.",
      factLabels: {
        Country: "País",
        Region: "Región",
        "Review trail": "Ruta de revisión",
        "Source trail": "Ruta de fuente",
        When: "Cuándo",
        Where: "Dónde",
      } as Record<string, string>,
      fullLog: "Ver Registro completo",
      kicker: "Registro de campo",
      matchingCount: (visible: number, total: number) =>
        `Mostrando los ${visible} más recientes de ${total} reportes coincidentes.`,
      openCase: "Abrir expediente",
      openCaseHeading: "Expediente abierto",
      oracleReadyNote:
        "Listo para el Oráculo significa que hay suficiente contexto público para una lectura juguetona. No significa que el reporte sea verdadero.",
      originalSource: "Ver fuente original",
      originalTitle: "Título original",
      previewNote:
        "La portada es la vista previa. El Registro completo guarda el resto.",
      reportSummary: "Resumen del reporte",
      scroll: "desplaza notas ↓",
      sourceGuidelines: "Guía de fuentes",
      swipe: "desliza ->",
      title: "Reportes recientes, archivados como sin verificar.",
      unverifiedNote:
        "OddSkies no ha verificado este reporte. Puede ser real, equivocado, generado por IA, montado, sátira, folclore o una broma. Revisa la fuente original cuando esté disponible.",
    };
  }

  return {
    approvedCount: (visible: number, total: number) =>
      `Showing latest ${visible} of ${total} approved reports.`,
    browseFullLog: "Browse the Full Field Log →",
    description:
      "Showing the latest approved field notes. Older reports live in the Full Field Log, grouped into monthly sweeps.",
    empty: "No reports are listed for this filter yet.",
    factLabels: {} as Record<string, string>,
    fullLog: "View Full Field Log",
    kicker: "Field Log",
    matchingCount: (visible: number, total: number) =>
      `Showing latest ${visible} of ${total} matching reports.`,
    openCase: "Open Case File",
    openCaseHeading: "Open Case File",
    oracleReadyNote:
      "Oracle-ready means there is enough public context for a playful future reading. It does not mean the report is true.",
    originalSource: "View original source",
    originalTitle: "Original title",
    previewNote: "Homepage is the preview. The Full Field Log keeps the rest.",
    reportSummary: "Report summary",
    scroll: "scroll field notes ↓",
    sourceGuidelines: "Source guidelines",
    swipe: "swipe ->",
    title: "Latest reports, filed as unverified.",
    unverifiedNote:
      "OddSkies has not verified this report. It may be real, mistaken, AI-generated, staged, satire, folklore, or a joke. Check the original source when available.",
  };
}
