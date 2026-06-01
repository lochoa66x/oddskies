import {
  regionFilters,
  type RegionFilter,
  type Report,
} from "@/lib/reports";

type CountItem = {
  count: number;
  label: string;
};

type DatedReport = {
  eventDate: Date;
  report: Report;
};

type GridCell = {
  count: number;
  date: Date;
  dateLabel: string;
  intensity: number;
};

type OddConLevel = {
  footnote?: boolean;
  level: number;
  name: string;
};

type RegionSummary = CountItem & {
  mood: string;
  topCategory: string;
};

const categoryLabels = [
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Unknown",
];

const oddConLevels: OddConLevel[] = [
  { level: 5, name: "Quiet Skies" },
  { level: 4, name: "Mildly Weird" },
  { level: 3, name: "Suspiciously Interesting" },
  { level: 2, name: "Sky Is Spicy" },
  { footnote: true, level: 1, name: "Definitely Not an Invasion" },
];

const timeWindows = [
  { hours: [21, 22, 23, 0], label: "9 PM - 1 AM" },
  { hours: [1, 2, 3, 4], label: "1 AM - 5 AM" },
  { hours: [5, 6, 7, 8, 9, 10, 11], label: "5 AM - Noon" },
  { hours: [12, 13, 14, 15, 16, 17], label: "Noon - 6 PM" },
  { hours: [18, 19, 20], label: "6 PM - 9 PM" },
];

const weekdayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

const categoryMoods: Record<string, string> = {
  "Haunted Places": "Quietly haunted",
  "Local Legends": "Folklore warming up",
  Paranormal: "Explainable-ish",
  "Strange Lights": "Glowing suspiciously",
  UFO: "Sky is blinking",
  "UFO / UAP": "Sky is blinking",
  Unknown: "Needs more witnesses",
};

const regionMoods: Record<Exclude<RegionFilter, "All">, string> = {
  "East Asia": "Sky pulse detected",
  "Latin America": "Volcano watch",
  "North America": "Active skies",
  Oceania: "Outback signal",
  "UK & Ireland": "Quietly haunted",
  "Western Europe": "Old stones, odd signals",
};

export function SignalsWeirdness({ reports }: { reports: Report[] }) {
  const datedReports = reports
    .map((report) => ({ report, eventDate: parseReportDate(report) }))
    .filter(
      (entry): entry is DatedReport => entry.eventDate !== null,
    );
  const latestDate = getLatestDate(datedReports) ?? new Date();
  const latestSevenDays = countReportsSince(datedReports, latestDate, 7);
  const regionCounts = countRegions(reports);
  const regionSummaries = getRegionSummaries(reports);
  const categoryCounts = countCategories(reports);
  const heatmapCells = createWeirdnessGrid(datedReports, latestDate);
  const peakWindow = getPeakWindow(datedReports);
  const mostActiveRegion = getTopItem(regionCounts)?.label ?? "Region unclear";
  const topCategoryItem = getTopItem(categoryCounts);
  const topCategory = topCategoryItem?.label ?? "Unknown";
  const topRegion = getTopRegionSummary(regionSummaries);
  const oddCon = oddConLevels[2];

  return (
    <section
      className="border-y border-night-800 bg-night-900 px-5 py-9 md:py-12"
      id="signals"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Signal Strip
              <span className="ml-2 text-xs normal-case tracking-[0.16em] sm:hidden">
                swipe -&gt;
              </span>
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-parchment md:text-5xl">
              Signals & Weirdness
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              Tiny patterns from unverified reports. Not science. Still fun.
            </p>
          </div>
          <p className="max-w-md rounded-md border border-signal-amber/25 bg-signal-amber/10 px-4 py-3 text-sm leading-6 text-signal-amber">
            These stats are based on unverified reports and demo data. They are
            for curiosity and entertainment, not confirmation.
          </p>
        </div>

        <SignalStrip
          latestSevenDays={latestSevenDays}
          mostActiveRegion={mostActiveRegion}
          oddCon={oddCon}
          peakWindow={peakWindow}
          reportsCount={reports.length}
          topCategory={topCategory}
          topCategoryCount={topCategoryItem?.count ?? 0}
          topRegion={topRegion}
        />

        <div className="mt-4">
          <WeirdnessGrid cells={heatmapCells} totalReports={reports.length} />
        </div>
      </div>
    </section>
  );
}

function SignalStrip({
  latestSevenDays,
  mostActiveRegion,
  oddCon,
  peakWindow,
  reportsCount,
  topCategory,
  topCategoryCount,
  topRegion,
}: {
  latestSevenDays: number;
  mostActiveRegion: string;
  oddCon: OddConLevel;
  peakWindow: string;
  reportsCount: number;
  topCategory: string;
  topCategoryCount: number;
  topRegion?: RegionSummary;
}) {
  const cards = [
    {
      accent: "text-signal-amber",
      label: "OddCon",
      note: `${latestSevenDays} latest-window reports`,
      value: `${oddCon.level} — ${oddCon.name}`,
    },
    {
      accent: "text-signal-teal",
      label: "Top Category",
      note: categoryMoods[topCategory] ?? "Signal unclear",
      value: `${topCategoryCount} ${topCategory}`,
    },
    {
      accent: "text-signal-violet",
      label: "Top Region",
      note: topRegion?.topCategory ?? "No signal yet",
      value: `${topRegion?.count ?? 0} ${topRegion?.label ?? mostActiveRegion}`,
    },
    {
      accent: "text-signal-ember",
      label: "Peak Window",
      note: "When reports get louder",
      value: peakWindow,
    },
    {
      accent: "text-muted",
      label: "Indexed",
      note: "Seed/demo activity",
      value: `${reportsCount} reports`,
    },
  ];

  return (
    <div className="signal-strip flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5">
      {cards.map((card, index) => (
        <article
          className="field-card relative min-h-32 min-w-[14rem] overflow-hidden rounded-lg p-3.5 sm:min-w-0"
          key={card.label}
        >
          <span
            aria-hidden="true"
            className={`absolute -right-7 -top-7 size-20 rounded-full blur-2xl ${getSignalGlowClass(
              index,
            )}`}
          />
          <div className="relative flex h-full flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {card.label}
              </p>
              <span
                className={`size-2 rounded-full ${getSignalDotClass(index)}`}
              />
            </div>
            <div>
              <p className={`text-lg font-semibold leading-6 ${card.accent}`}>
                {card.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">{card.note}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function WeirdnessGrid({
  cells,
  totalReports,
}: {
  cells: GridCell[];
  totalReports: number;
}) {
  const weeks = groupCellsByWeek(cells);
  const monthLabels = getHeatmapMonthLabels(weeks);
  const gridMinWidth = `${4 + weeks.length * 1.125}rem`;

  return (
    <article className="field-card min-w-0 rounded-lg p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-teal">
            Weirdness Activity
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-parchment">
            Last 365 days of unverified weird.
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tiny squares from unverified reports. Quiet cells are asleep.
            Bright cells mean the map had snacks.
          </p>
        </div>
        <span className="w-fit rounded-md border border-night-800 bg-night-950 px-3 py-2 text-sm text-muted">
          {totalReports} reports indexed
        </span>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div style={{ minWidth: gridMinWidth }}>
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `3rem repeat(${weeks.length}, 0.875rem)`,
            }}
          >
            <span aria-hidden="true" />
            {monthLabels.map((label, index) => (
              <span
                className="h-4 text-[0.62rem] uppercase tracking-[0.12em] text-muted"
                key={`month-${index}`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-[3rem_1fr] gap-1">
            <div className="grid grid-rows-7 gap-1 text-xs leading-none text-muted">
              {weekdayLabels.map((label, index) => (
                <span
                  className="flex h-3.5 items-center"
                  key={`${label}-${index}`}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="grid grid-flow-col grid-rows-7 auto-cols-[0.875rem] gap-1">
              {weeks.flat().map((cell) => (
                <span
                  aria-label={`${cell.dateLabel}: ${cell.count} report${
                    cell.count === 1 ? "" : "s"
                  }`}
                  className={`size-3.5 rounded-[0.18rem] border ${getHeatCellClass(
                    cell.intensity,
                  )}`}
                  key={toDateKey(cell.date)}
                  title={`${cell.dateLabel}: ${cell.count} report${
                    cell.count === 1 ? "" : "s"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>Based on event dates when available.</span>
        <div className="flex items-center gap-2">
          <span>Quiet</span>
          {[0, 1, 2, 3, 4].map((intensity) => (
            <span
              className={`size-3 rounded-[0.18rem] border ${getHeatCellClass(
                intensity,
              )}`}
              key={intensity}
            />
          ))}
          <span>Sky is spicy</span>
        </div>
      </div>
    </article>
  );
}

function parseReportDate(report: Report) {
  if (!report.eventDateTimeRaw) {
    return null;
  }

  const date = new Date(report.eventDateTimeRaw);

  return Number.isNaN(date.getTime()) ? null : date;
}

function countCategories(reports: Report[]) {
  return categoryLabels.map((label) => ({
    count: reports.filter((report) => getCategoryLabel(report.category) === label)
      .length,
    label,
  }));
}

function countRegions(reports: Report[]) {
  return regionFilters
    .filter((region): region is Exclude<RegionFilter, "All"> => region !== "All")
    .map((region) => ({
      count: reports.filter((report) => report.region === region).length,
      label: region,
    }));
}

function getRegionSummaries(reports: Report[]): RegionSummary[] {
  return regionFilters
    .filter((region): region is Exclude<RegionFilter, "All"> => region !== "All")
    .map((region) => {
      const regionReports = reports.filter((report) => report.region === region);
      const topCategory =
        getTopItem(countCategories(regionReports).filter((item) => item.count > 0))
          ?.label ?? "No signal yet";

      return {
        count: regionReports.length,
        label: region,
        mood: regionMoods[region],
        topCategory,
      };
    });
}

function getTopRegionSummary(regions: RegionSummary[]) {
  return [...regions].sort((a, b) => b.count - a.count)[0];
}

function createWeirdnessGrid(
  datedReports: DatedReport[],
  latestDate: Date,
): GridCell[] {
  const counts = new Map<string, number>();
  const weeksToShow = 52;

  for (const { eventDate } of datedReports) {
    const key = toDateKey(eventDate);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const endDate = getEndOfWeek(latestDate);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - weeksToShow * 7 + 1);

  return Array.from({ length: weeksToShow * 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = toDateKey(date);
    const count = counts.get(key) ?? 0;

    return {
      count,
      date,
      dateLabel: new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date),
      intensity: getHeatIntensity(count),
    };
  });
}

function groupCellsByWeek(cells: GridCell[]) {
  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}

function getHeatmapMonthLabels(weeks: GridCell[][]) {
  return weeks.map((week, index) => {
    const monthStart = week.find((cell) => cell.date.getDate() === 1);

    if (monthStart) {
      return formatMonth(monthStart.date);
    }

    if (index === 0 && week[0]) {
      return formatMonth(week[0].date);
    }

    return "";
  });
}

function getEndOfWeek(date: Date) {
  const endDate = new Date(date);
  endDate.setHours(12, 0, 0, 0);
  endDate.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7));

  return endDate;
}

function getLatestDate(datedReports: DatedReport[]) {
  if (datedReports.length === 0) {
    return null;
  }

  return new Date(
    Math.max(...datedReports.map(({ eventDate }) => eventDate.getTime())),
  );
}

function countReportsSince(
  datedReports: DatedReport[],
  latestDate: Date,
  days: number,
) {
  const start = new Date(latestDate);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(latestDate);
  end.setHours(23, 59, 59, 999);

  return datedReports.filter(
    ({ eventDate }) => eventDate >= start && eventDate <= end,
  ).length;
}

function getCategoryLabel(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("ufo") || normalized.includes("uap")) {
    return "UFO / UAP";
  }

  if (normalized.includes("light")) {
    return "Strange Lights";
  }

  if (normalized.includes("haunt")) {
    return "Haunted Places";
  }

  if (normalized.includes("paranormal")) {
    return "Paranormal";
  }

  if (normalized.includes("legend")) {
    return "Local Legends";
  }

  return "Unknown";
}

function getPeakWindow(datedReports: DatedReport[]) {
  const counts = timeWindows.map((window) => ({
    count: datedReports.filter(({ eventDate }) =>
      window.hours.includes(eventDate.getHours()),
    ).length,
    label: window.label,
  }));

  return getTopItem(counts)?.label ?? "Time unclear";
}

function getTopItem(items: CountItem[]) {
  return [...items].sort((a, b) => b.count - a.count)[0];
}

function getHeatIntensity(count: number) {
  if (count >= 4) {
    return 4;
  }

  if (count >= 3) {
    return 3;
  }

  if (count >= 2) {
    return 2;
  }

  if (count >= 1) {
    return 1;
  }

  return 0;
}

function getHeatCellClass(intensity: number) {
  return [
    "border-night-800 bg-night-950",
    "border-signal-teal/20 bg-signal-teal/25",
    "border-signal-teal/35 bg-signal-teal/55",
    "border-signal-amber/45 bg-signal-amber/75",
    "border-signal-ember/55 bg-signal-ember",
  ][intensity];
}

function getSignalDotClass(index: number) {
  return [
    "bg-signal-teal shadow-[0_0_18px_rgba(72,224,194,0.55)]",
    "bg-signal-amber shadow-[0_0_18px_rgba(246,180,75,0.5)]",
    "bg-signal-violet shadow-[0_0_18px_rgba(139,92,246,0.5)]",
    "bg-signal-ember shadow-[0_0_18px_rgba(249,115,91,0.5)]",
    "bg-parchment/80 shadow-[0_0_18px_rgba(243,240,232,0.24)]",
    "bg-muted shadow-[0_0_18px_rgba(167,173,188,0.28)]",
  ][index % 6];
}

function getSignalGlowClass(index: number) {
  return [
    "bg-signal-teal/20",
    "bg-signal-amber/20",
    "bg-signal-violet/20",
    "bg-signal-ember/20",
    "bg-parchment/10",
    "bg-muted/15",
  ][index % 6];
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}
