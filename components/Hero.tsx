"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  coordinateToAtlasPosition,
  filterReportsByRegion,
  getCategoryTone,
  regionAnchors,
  regionFilters,
  type AtlasRegion,
  type RegionFilter,
  type Report,
} from "@/lib/reports";

const heroTags = ["UFO / UAP", "Strange Lights", "Haunted Places", "Unknown"];

type ClusterStyle = CSSProperties & { "--cluster-size": string };
type LabelSide = "above" | "left" | "right";

export function Hero({ reports }: { reports: Report[] }) {
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("All");
  const filteredReports = useMemo(
    () => filterReportsByRegion(reports, activeRegion),
    [activeRegion, reports],
  );
  const markerReports = filteredReports.slice(0, 16);
  const labeledReportIds = useMemo(
    () => new Set(pickLabelIds(markerReports)),
    [markerReports],
  );
  const plottedCount = reports.filter(
    (report) => report.latitude !== null && report.longitude !== null,
  ).length;
  const regionGlows = useMemo(() => {
    const regions = regionFilters.filter(
      (region): region is AtlasRegion => region !== "All",
    );

    return regions
      .map((region) => ({
        count: filteredReports.filter((report) => report.region === region)
          .length,
        region,
      }))
      .filter((entry) => entry.count > 0);
  }, [filteredReports]);

  return (
    <section className="hero-shell relative overflow-hidden border-b border-night-800 bg-night-950">
      <div className="absolute inset-0 bg-star-field opacity-80" />
      <div className="paranormal-haze absolute inset-0" />
      <div className="sky-noise absolute inset-0" />
      <div className="ufo-beam absolute right-[9%] top-14 hidden h-[34rem] w-[24rem] md:block" />
      <div className="saucer-silhouette absolute right-[22%] top-16 hidden md:block" />
      <div className="haunted-horizon absolute bottom-0 left-[44%] hidden h-52 w-[34rem] lg:block" />
      <div className="terrain-silhouette absolute inset-x-0 bottom-0 h-36" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-teal/50 to-transparent" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a className="flex items-center gap-3" href="#">
          <span className="grid size-10 place-items-center rounded-md border border-signal-teal/40 bg-signal-teal/10 text-sm font-black text-signal-teal shadow-glow">
            OS
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-parchment">
              OddSkies
            </span>
            <span className="block text-xs text-muted">oddskies.com</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-md border border-night-800 bg-night-900/80 p-1 text-sm text-muted md:flex">
          {["Map", "Reports", "Oracle", "About"].map((item) => (
            <a
              className="rounded px-3 py-2 transition hover:bg-night-850 hover:text-parchment"
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-5 lg:min-h-[calc(100svh-76px)] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-10 lg:pb-14 lg:pt-4">
        <div>
          <p className="inline-flex rounded-md border border-signal-amber/30 bg-signal-amber/10 px-3 py-2 text-sm font-semibold text-signal-amber">
            Mystery Atlas / Phase 1 Preview
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.95] text-parchment sm:text-6xl lg:text-7xl">
            Explore the weird side of the map.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
            OddSkies organizes strange, unverified public reports — from UFOs
            and strange lights to haunted places and local legends — by time,
            place, category, and source.
          </p>
          <p className="mt-5 max-w-xl rounded-md border border-night-800 bg-night-900/80 px-4 py-3 text-sm font-semibold text-parchment">
            Verified? No. Interesting? Maybe. Source-linked? Always.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              className="hero-cta hero-cta-primary inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-signal-teal px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-parchment"
              href="#map"
            >
              <span aria-hidden="true" className="cta-glyph cta-glyph-map" />
              Explore the Map
            </a>
            <a
              className="hero-cta hero-cta-secondary inline-flex min-h-14 items-center justify-center gap-3 rounded-md border border-signal-violet/40 bg-signal-violet/[0.12] px-5 py-3 text-sm font-bold text-parchment transition hover:border-signal-teal/60 hover:bg-signal-teal/10"
              href="#oracle"
            >
              <span aria-hidden="true" className="cta-glyph cta-glyph-oracle" />
              Ask the Oracle
            </a>
          </div>
        </div>

        <div className="field-card relative overflow-hidden rounded-lg" id="map">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-night-800 bg-night-850 px-5 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-teal">
                Live Atlas Preview
              </p>
              <p className="mt-1 text-sm text-muted">
                Public report activity, not verified events.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs text-muted">
                Phase 1 density layer
              </span>
              <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs text-muted">
                Global preview / {plottedCount} plotted
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-night-800 bg-night-900/70 px-5 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
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
                    onClick={() => setActiveRegion(region)}
                    type="button"
                  >
                    {region}
                  </button>
                );
              })}
            </div>
            <p className="text-xs leading-5 text-muted">
              Global seed reports are concept data for Phase 2. Live collectors
              are not connected yet.
            </p>
          </div>

          <div className="atlas-grid relative min-h-[360px] overflow-hidden lg:min-h-[410px]">
            <div className="atlas-map-texture absolute inset-0" />
            <div className="scan-line absolute left-0 top-20 h-px w-full" />
            <svg
              aria-hidden="true"
              className="atlas-map-base absolute inset-x-5 top-9 h-[70%] w-[calc(100%-2.5rem)]"
              viewBox="0 0 1000 500"
            >
              <path d="M57 142c23-30 58-50 96-55 42-5 75 7 107 27 29 18 42 46 75 56 32 10 62 31 63 65 1 33-31 50-60 56-27 6-48 6-68 26-19 19-36 52-66 45-24-6-31-38-51-53-25-19-56-17-77-42-21-26-36-68-19-125Z" />
              <path d="M171 82c38-20 81-16 118 0 19 8 42 11 61 1 9 22-12 39-35 43-40 7-83-3-122 12-27 11-53-14-22-56Z" />
              <path d="M305 285c38 15 70 45 84 84 15 42 0 82-28 114-31-17-48-50-62-84-12-29-39-74 6-114Z" />
              <path d="M462 146c33-18 72-16 104-3 24 10 49 15 75 10 2 28-27 45-54 44-28-1-48 18-75 22-31 5-61-12-74-38-8-16 6-27 24-35Z" />
              <path d="M494 221c36-18 82-5 104 29 23 34 31 77 18 119-14 45-43 72-81 78-31-40-44-86-42-136 1-35-22-68 1-90Z" />
              <path d="M590 134c44-20 95-20 140-4 49 17 84 49 132 66 39 14 76 43 70 87-5 41-48 65-89 58-45-7-77-39-121-36-48 4-91 38-139 16-38-17-55-55-37-92 15-30 2-73 44-95Z" />
              <path d="M697 344c45-19 101-11 139 18 35 26 62 51 56 96-50 16-111 4-154-29-35-27-64-52-41-85Z" />
              <path d="M863 185c26-8 55-1 75 15 22 17 27 43 9 63-26-4-54-15-74-34-14-13-31-32-10-44Z" />
              <path d="M944 391c17-8 34-1 45 12 4 18-9 31-27 32-17 1-30-7-35-22 2-10 8-17 17-22Z" />
              <path className="atlas-coastline" d="M86 159c36 10 74 7 115-7 33-12 65 1 94 38 16 21 42 26 77 16" />
              <path className="atlas-coastline" d="M522 156c18 26 33 57 45 93 10 32 6 70-12 114" />
              <path className="atlas-coastline" d="M627 171c40 25 73 55 99 91 31-4 67 3 108 21" />
              <path className="atlas-coastline" d="M724 371c37 6 78 7 124 2" />
            </svg>
            <svg
              aria-hidden="true"
              className="atlas-route-lines absolute inset-x-8 top-12 h-[61%] w-[calc(100%-4rem)]"
              viewBox="0 0 1000 430"
            >
              <path d="M176 206c119-73 238-60 356 38 103 86 210 84 322-8" />
              <path d="M252 256c104-33 203-19 298 43 86 57 174 48 264-27" />
              <path d="M318 330c51 27 95 69 132 127" />
              <path d="M608 180c74 61 133 139 176 234" />
              <path d="M661 226c66-17 131-5 196 36" />
            </svg>
            {regionGlows.map(({ count, region }, index) => {
              const anchor = regionAnchors[region];
              const position = coordinateToAtlasPosition(
                anchor.latitude,
                anchor.longitude,
              );
              const size = Math.min(82, 40 + count * 8);
              const style: ClusterStyle = {
                "--cluster-size": `${size}px`,
                left: `${position.left}%`,
                top: `${position.top}%`,
              };

              return (
                <span
                  aria-hidden="true"
                  className="atlas-region-glow absolute rounded-full"
                  key={region}
                  style={{
                    ...style,
                    animationDelay: `${index * 0.55}s`,
                  }}
                />
              );
            })}

            <div className="absolute left-5 top-5 rounded-md border border-night-800 bg-night-950/80 px-3 py-2 text-xs text-muted">
              Field layer: public report density
            </div>
            <div className="absolute right-5 top-5 rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs font-semibold text-signal-amber">
              Not confirmed events
            </div>

            {markerReports.map((report, index) => {
              const position = getReportPosition(report);
              const size = index < 8 ? 36 : 28;
              const labelSide = getLabelSide(report, position.left);

              return (
                <div
                  className={`atlas-report-point atlas-report-point-${getCategoryTone(
                    report.category,
                  )}`}
                  key={report.id}
                  style={{
                    height: size,
                    left: `${position.left}%`,
                    top: `${position.top}%`,
                    width: size,
                  }}
                >
                  <span
                    aria-label={`${report.shortLabel}, ${report.region}`}
                    className="heat-cluster absolute inset-0 block rounded-full"
                    style={{ animationDelay: `${index * 0.34}s` }}
                  >
                    <span className="absolute inset-[34%] rounded-full bg-signal-amber shadow-[0_0_30px_rgba(246,180,75,0.9)]" />
                    <span className="absolute inset-[44%] rounded-full bg-parchment/90" />
                  </span>
                  {labeledReportIds.has(report.id) ? (
                    <span
                      className={`atlas-point-label atlas-point-label-${labelSide}`}
                    >
                      <span>{report.shortLabel}</span>
                      <small>{report.region}</small>
                    </span>
                  ) : null}
                </div>
              );
            })}

            {markerReports.length === 0 ? (
              <div className="absolute left-5 right-5 top-24 rounded-md border border-night-800 bg-night-950/85 p-4 text-sm text-muted">
                No plotted reports in this region yet.
              </div>
            ) : null}

            <div className="absolute right-5 bottom-24 hidden rounded-md border border-night-800 bg-night-950/80 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted md:block">
              Sweep 03 / anomalous cluster watch
            </div>

            <div className="atlas-control absolute right-5 top-16 hidden rounded-md border border-night-800 bg-night-950/80 p-2 text-xs text-muted 2xl:flex">
              <span>Density</span>
              <span>Source links</span>
              <span>48h</span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {heroTags.map((tag) => (
                  <span
                    className="rounded-md border border-night-800 bg-night-950/80 px-3 py-2 text-xs text-parchment"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex max-w-sm items-center gap-3 rounded-md border border-night-800 bg-night-950/85 px-3 py-2 text-xs text-muted">
                <span>Fewer reports</span>
                <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-signal-teal/35 via-signal-amber to-signal-ember" />
                <span>More reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getReportPosition(report: Report) {
  if (report.latitude !== null && report.longitude !== null) {
    return coordinateToAtlasPosition(report.latitude, report.longitude);
  }

  const anchor = regionAnchors[report.region];

  return coordinateToAtlasPosition(anchor.latitude, anchor.longitude);
}

function pickLabelIds(reports: Report[]) {
  const caps: Record<AtlasRegion, number> = {
    "East Asia": 1,
    "Latin America": 1,
    "North America": 1,
    Oceania: 1,
    "UK & Ireland": 1,
    "Western Europe": 1,
  };
  const counts: Partial<Record<AtlasRegion, number>> = {};
  const labels: string[] = [];

  for (const report of reports) {
    const current = counts[report.region] ?? 0;

    if (current < caps[report.region]) {
      labels.push(report.id);
      counts[report.region] = current + 1;
    }

    if (labels.length >= 8) {
      break;
    }
  }

  return labels;
}

function getLabelSide(report: Report, left: number): LabelSide {
  if (
    report.region === "East Asia" ||
    report.region === "Oceania" ||
    left > 72
  ) {
    return "left";
  }

  if (report.region === "UK & Ireland") {
    return "above";
  }

  if (report.region === "Western Europe") {
    return "right";
  }

  if (left < 30) {
    return "right";
  }

  return "above";
}
