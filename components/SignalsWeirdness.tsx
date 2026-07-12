import {
  regionFilters,
  type RegionFilter,
  type Report,
} from "@/lib/reports";
import Link from "next/link";
import {
  categoryLabel,
  localizedPath,
  regionLabel,
  type Locale,
} from "@/lib/i18n";

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

const recentActivityWeeks = 12;

const categoryMoods: Record<string, string> = {
  "Haunted Places": "Quietly haunted",
  "Local Legends": "Folklore warming up",
  Paranormal: "Explainable-ish",
  "Strange Lights": "Glowing suspiciously",
  UFO: "Sky is blinking",
  "UFO / UAP": "Sky is blinking",
  Unknown: "More eyes needed",
};

const regionMoods: Record<Exclude<RegionFilter, "All">, string> = {
  "East Asia": "Sky pulse detected",
  "Latin America": "Volcano watch",
  "North America": "Active skies",
  Oceania: "Outback signal",
  "UK & Ireland": "Quietly haunted",
  "Western Europe": "Old stones, odd signals",
};

export function SignalsWeirdness({
  locale = "en",
  reports,
}: {
  locale?: Locale;
  reports: Report[];
}) {
  const copy = getSignalsCopy(locale);
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
      className="border-y border-night-800 bg-night-900 px-5 py-7 md:py-9"
      id="signals"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-3.5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              {copy.kicker}
              <span className="ml-2 text-xs normal-case tracking-[0.16em] sm:hidden">
                {copy.swipe}
              </span>
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-parchment md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {copy.description}
            </p>
          </div>
          <p className="max-w-sm rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
            {copy.disclaimer}
          </p>
        </div>

        <SignalStrip
          copy={copy}
          latestSevenDays={latestSevenDays}
          locale={locale}
          mostActiveRegion={mostActiveRegion}
          oddCon={oddCon}
          peakWindow={peakWindow}
          reportsCount={reports.length}
          topCategory={topCategory}
          topCategoryCount={topCategoryItem?.count ?? 0}
          topRegion={topRegion}
        />

        <div className="mt-3">
          <WeirdnessGrid
            cells={heatmapCells}
            copy={copy}
            locale={locale}
            totalReports={reports.length}
          />
        </div>
      </div>
    </section>
  );
}

function SignalStrip({
  copy,
  latestSevenDays,
  locale,
  mostActiveRegion,
  oddCon,
  peakWindow,
  reportsCount,
  topCategory,
  topCategoryCount,
  topRegion,
}: {
  copy: ReturnType<typeof getSignalsCopy>;
  latestSevenDays: number;
  locale: Locale;
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
      meter: oddCon.level === 3 ? 3 : Math.max(1, 6 - oddCon.level),
      note: copy.latestWindowReports(latestSevenDays),
      value: `${oddCon.level} — ${getOddConName(oddCon.name, locale)}`,
    },
    {
      accent: "text-signal-teal",
      label: copy.categoryPulse,
      meter: Math.min(4, Math.max(1, topCategoryCount)),
      note: getCategoryMood(topCategory, locale),
      value: `${topCategoryCount} ${categoryLabel(topCategory, locale)}`,
    },
    {
      accent: "text-signal-violet",
      label: copy.regionPulse,
      meter: Math.min(4, Math.max(1, topRegion?.count ?? 0)),
      note: topRegion?.topCategory
        ? categoryLabel(topRegion.topCategory, locale)
        : copy.noSignalYet,
      value: `${topRegion?.count ?? 0} ${regionLabel(
        topRegion?.label ?? mostActiveRegion,
        locale,
      )}`,
    },
    {
      accent: "text-signal-ember",
      label: copy.peakWindow,
      meter: 2,
      note: copy.whenReportsGetLouder,
      value: peakWindow,
    },
    {
      accent: "text-muted",
      label: copy.indexed,
      meter: Math.min(4, Math.max(1, Math.ceil(reportsCount / 8))),
      note: copy.approvedPublicActivity,
      value: copy.reportsIndexed(reportsCount),
    },
  ];

  return (
    <div className="signal-strip flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5">
      {cards.map((card, index) => (
        <article
          className="field-card signal-artifact relative min-h-24 min-w-[13rem] overflow-hidden rounded-lg p-3 sm:min-w-0"
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
              <p className={`text-base font-semibold leading-6 ${card.accent}`}>
                {card.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">{card.note}</p>
              <div className="mt-3 flex gap-1" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, meterIndex) => (
                  <span
                    className={`h-1.5 flex-1 rounded-full border ${
                      meterIndex < card.meter
                        ? getSignalMeterClass(index)
                        : "border-night-800 bg-night-950"
                    }`}
                    key={meterIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function WeirdnessGrid({
  cells,
  copy,
  locale,
  totalReports,
}: {
  cells: GridCell[];
  copy: ReturnType<typeof getSignalsCopy>;
  locale: Locale;
  totalReports: number;
}) {
  const activeDays = cells.filter((cell) => cell.count > 0);
  const displayedDays = activeDays.slice(-8);
  const quietDays = cells.length - activeDays.length;

  return (
    <article className="field-card min-w-0 rounded-lg p-3.5 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-teal">
            {copy.activityKicker}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-parchment md:text-2xl">
            {copy.activityTitle}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {copy.activityDescription}
          </p>
        </div>
        <div className="flex w-fit flex-wrap gap-2">
          <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs font-semibold text-muted">
            {copy.weeksScanned(recentActivityWeeks)}
          </span>
          <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs font-semibold text-muted">
            {copy.activeDays(activeDays.length)}
          </span>
          <span className="rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs font-semibold text-muted">
            {copy.reportsIndexed(totalReports)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {displayedDays.length > 0 ? (
            displayedDays.map((cell) => (
              <Link
                className="rounded-md border border-night-800 bg-night-950/80 p-2.5"
                href={localizedPath(locale, `/field-log?date=${toDateKey(cell.date)}`)}
                key={toDateKey(cell.date)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      {formatActivityDate(cell.date, locale)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-parchment">
                      {copy.reportsIndexed(cell.count)}
                    </p>
                  </div>
                  <span
                    className={`size-2 rounded-full ${getSignalDotClass(
                      cell.intensity,
                    )}`}
                  />
                </div>
                <div className="mt-2.5 grid grid-cols-6 gap-1" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <span
                      className={`h-2 rounded-full border ${
                        index < Math.min(cell.count, 6)
                          ? getHeatCellClass(cell.intensity)
                          : "border-night-800 bg-night-950"
                      }`}
                      key={index}
                    />
                  ))}
                </div>
                <p className="mt-2.5 text-xs leading-5 text-muted">
                  {getActivityMood(cell.count, locale)}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-md border border-night-800 bg-night-950/80 p-4 text-sm leading-6 text-muted sm:col-span-2 xl:col-span-4">
              {copy.noActiveDays}
            </div>
          )}
        </div>

        <aside className="rounded-md border border-night-800 bg-night-950/70 p-3 text-xs leading-5 text-muted">
          <p className="font-semibold uppercase tracking-[0.16em] text-parchment">
            {copy.signalKey}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span>{copy.quiet}</span>
            {[0, 1, 2, 3, 4].map((intensity) => (
              <span
                className={`size-3 rounded-[0.18rem] border ${getHeatCellClass(
                  intensity,
                )}`}
                key={intensity}
              />
            ))}
            <span>{copy.spicy}</span>
          </div>
          <p className="mt-3">
            {copy.quietDays(quietDays)}
          </p>
          <p className="mt-2 text-signal-amber">
            {copy.countsDisclaimer}
          </p>
        </aside>
      </div>
    </article>
  );
}

function getSignalsCopy(locale: Locale) {
  if (locale === "es") {
    return {
      activeDays: (count: number) =>
        count === 1 ? "1 día activo" : `${count} días activos`,
      activityDescription:
        "Días activos de reportes sin verificar. Los días tranquilos se esconden hasta que el mapa tenga más señales.",
      activityKicker: "Actividad rara",
      activityTitle: "Cinta reciente de señales.",
      approvedPublicActivity: "Actividad pública aprobada",
      categoryPulse: "Pulso de categoría",
      countsDisclaimer: "Los conteos son reales. Las conclusiones no.",
      description:
        "Patrones pequeños de reportes sin verificar. No es ciencia. Sigue siendo útil.",
      disclaimer:
        "Estas estadísticas se basan en reportes públicos sin verificar. Son para curiosidad y entretenimiento, no confirmación.",
      indexed: "Indexado",
      kicker: "Tira de señales",
      latestWindowReports: (count: number) =>
        count === 1
          ? "1 reporte en la ventana reciente"
          : `${count} reportes en la ventana reciente`,
      noActiveDays:
        "No hay días activos en el escaneo reciente. Cielos tranquilos, al menos para el registro público.",
      noSignalYet: "Sin señal todavía",
      peakWindow: "Ventana pico",
      quiet: "Tranquilo",
      quietDays: (count: number) =>
        `${count} días tranquilos ocultos del escaneo reciente. Basado en fechas de evento cuando existen.`,
      regionPulse: "Pulso regional",
      reportsIndexed: (count: number) =>
        count === 1 ? "1 reporte" : `${count} reportes`,
      signalKey: "Clave de señal",
      spicy: "Intenso",
      swipe: "desliza ->",
      title: "Señales y rarezas",
      weeksScanned: (count: number) =>
        count === 1 ? "1 semana escaneada" : `${count} semanas escaneadas`,
      whenReportsGetLouder: "Cuando los reportes suben de volumen",
    };
  }

  return {
    activeDays: (count: number) =>
      count === 1 ? "1 active day" : `${count} active days`,
    activityDescription:
      "Active days from unverified reports. Quiet days stay tucked away until the map gets more snacks.",
    activityKicker: "Weirdness Activity",
    activityTitle: "Recent signal tape.",
    approvedPublicActivity: "Approved public activity",
    categoryPulse: "Category Pulse",
    countsDisclaimer: "Counts are real. Conclusions are not.",
    description:
      "Tiny patterns from unverified reports. Not science. Still fun.",
    disclaimer:
      "These stats are based on unverified public reports. They are for curiosity and entertainment, not confirmation.",
    indexed: "Indexed",
    kicker: "Signal Strip",
    latestWindowReports: (count: number) =>
      `${count} latest-window ${count === 1 ? "report" : "reports"}`,
    noActiveDays:
      "No active days in the recent scan. Quiet skies, at least for the public log.",
    noSignalYet: "No signal yet",
    peakWindow: "Peak Window",
    quiet: "Quiet",
    quietDays: (count: number) =>
      `${count} quiet days hidden from the recent scan. Based on event dates when available.`,
    regionPulse: "Region Pulse",
    reportsIndexed: (count: number) =>
      count === 1 ? "1 report" : `${count} reports`,
    signalKey: "Signal key",
    spicy: "Spicy",
    swipe: "swipe ->",
    title: "Signals & Weirdness",
    weeksScanned: (count: number) =>
      count === 1 ? "1 week scanned" : `${count} weeks scanned`,
    whenReportsGetLouder: "When reports get louder",
  };
}

function getOddConName(name: string, locale: Locale) {
  if (locale !== "es") {
    return name;
  }

  const labels: Record<string, string> = {
    "Definitely Not an Invasion": "Definitivamente no es una invasión",
    "Mildly Weird": "Medianamente raro",
    "Quiet Skies": "Cielos tranquilos",
    "Sky Is Spicy": "El cielo está intenso",
    "Suspiciously Interesting": "Sospechosamente interesante",
  };

  return labels[name] ?? name;
}

function getCategoryMood(category: string, locale: Locale) {
  if (locale !== "es") {
    return categoryMoods[category] ?? "Signal unclear";
  }

  const labels: Record<string, string> = {
    "Haunted Places": "Tranquilamente embrujado",
    "Local Legends": "Folclore calentando",
    Paranormal: "Más o menos explicable",
    "Strange Lights": "Brillando con sospecha",
    UFO: "El cielo parpadea",
    "UFO / UAP": "El cielo parpadea",
    Unknown: "Hacen falta más ojos",
  };

  return labels[category] ?? "Señal poco clara";
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
  const weeksToShow = recentActivityWeeks;

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

function getSignalMeterClass(index: number) {
  return [
    "border-signal-amber/30 bg-signal-amber/80 shadow-[0_0_12px_rgba(246,180,75,0.35)]",
    "border-signal-teal/30 bg-signal-teal/70 shadow-[0_0_12px_rgba(72,224,194,0.32)]",
    "border-signal-violet/30 bg-signal-violet/70 shadow-[0_0_12px_rgba(139,92,246,0.32)]",
    "border-signal-ember/30 bg-signal-ember/75 shadow-[0_0_12px_rgba(249,115,91,0.32)]",
    "border-parchment/20 bg-parchment/55 shadow-[0_0_12px_rgba(243,240,232,0.18)]",
    "border-muted/20 bg-muted/55 shadow-[0_0_12px_rgba(167,173,188,0.16)]",
  ][index % 6];
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatActivityDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getActivityMood(count: number, locale: Locale) {
  if (locale === "es") {
    if (count >= 4) {
      return "El cielo anda intenso.";
    }

    if (count >= 3) {
      return "El mapa tuvo señales.";
    }

    if (count >= 2) {
      return "Pequeño grupo raro.";
    }

    return "Un solo ping extraño.";
  }

  if (count >= 4) {
    return "Sky is spicy.";
  }

  if (count >= 3) {
    return "Map had snacks.";
  }

  if (count >= 2) {
    return "Odd little cluster.";
  }

  return "Single weird ping.";
}
