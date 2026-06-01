import {
  regionFilters,
  type RegionFilter,
  type Report,
} from "@/lib/reports";

type CountItem = {
  count: number;
  label: string;
};

type OddConLevel = {
  footnote?: boolean;
  level: number;
  name: string;
  range: string;
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
  { level: 5, name: "Quiet Skies", range: "0 recent" },
  { level: 4, name: "Mildly Weird", range: "1-2 recent" },
  { level: 3, name: "Suspiciously Interesting", range: "3-5 recent" },
  { level: 2, name: "Sky Is Spicy", range: "6-9 recent" },
  { footnote: true, level: 1, name: "Definitely Not an Invasion", range: "10+" },
];

const timeWindows = [
  { hours: [21, 22, 23, 0], label: "9 PM - 1 AM" },
  { hours: [1, 2, 3, 4], label: "1 AM - 5 AM" },
  { hours: [5, 6, 7, 8, 9, 10, 11], label: "5 AM - Noon" },
  { hours: [12, 13, 14, 15, 16, 17], label: "Noon - 6 PM" },
  { hours: [18, 19, 20], label: "6 PM - 9 PM" },
];

export function SignalsWeirdness({ reports }: { reports: Report[] }) {
  const datedReports = reports
    .map((report) => ({ report, eventDate: parseReportDate(report) }))
    .filter(
      (entry): entry is { report: Report; eventDate: Date } =>
        entry.eventDate !== null,
    );
  const now = new Date();
  const lastSevenDays = datedReports.filter(
    ({ eventDate }) => now.getTime() - eventDate.getTime() <= 7 * 24 * 60 * 60 * 1000,
  ).length;
  const regionCounts = countRegions(reports);
  const categoryCounts = countCategories(reports);
  const activityOverTime = countByDay(datedReports);
  const mostActiveRegion = getTopItem(regionCounts)?.label ?? "Region unclear";
  const topCategory = getTopItem(categoryCounts)?.label ?? "Unknown";
  const peakWindow = getPeakWindow(datedReports);
  const oddCon = getOddConLevel(lastSevenDays);

  const stats = [
    { label: "Total reports", value: reports.length.toString() },
    { label: "Last 7 days", value: lastSevenDays.toString() },
    { label: "Most active region", value: mostActiveRegion },
    { label: "Top category", value: topCategory },
    { label: "Peak weirdness window", value: peakWindow },
    {
      label: "OddSkies activity level",
      value: `OddCon ${oddCon.level}`,
      subvalue: oddCon.name,
    },
  ];

  return (
    <section
      className="border-y border-night-800 bg-night-900 px-5 py-14 md:py-20"
      id="signals"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Field Patterns
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <article
              className="field-card rounded-lg p-4"
              key={stat.label}
            >
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold text-parchment">
                {stat.value}
              </p>
              {stat.subvalue ? (
                <p className="mt-1 text-sm font-semibold text-signal-amber">
                  {stat.subvalue}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <ChartCard
            items={activityOverTime}
            note="Based on unverified public/demo reports."
            title="Report activity over time"
          />
          <ChartCard
            items={categoryCounts}
            title="Report mix by category"
            variant="category"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ChartCard
            items={regionCounts}
            title="Featured mystery regions"
            variant="region"
          />
          <OddConPanel oddCon={oddCon} recentCount={lastSevenDays} />
        </div>
      </div>
    </section>
  );
}

function ChartCard({
  items,
  note,
  title,
  variant = "time",
}: {
  items: CountItem[];
  note?: string;
  title: string;
  variant?: "category" | "region" | "time";
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <article className="field-card rounded-lg p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-parchment">{title}</h3>
          {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
        </div>
        <span className="w-fit rounded-md border border-night-800 bg-night-950 px-3 py-2 text-xs text-muted">
          Unverified inputs
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => {
          const width = `${Math.max((item.count / max) * 100, item.count > 0 ? 9 : 0)}%`;

          return (
            <div key={`${variant}-${item.label}`}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted">{item.label}</span>
                <span className="font-semibold text-parchment">
                  {item.count}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-night-800 bg-night-950">
                <div
                  className={`h-full rounded-full ${getBarClass(variant, index)}`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function OddConPanel({
  oddCon,
  recentCount,
}: {
  oddCon: OddConLevel;
  recentCount: number;
}) {
  return (
    <article className="field-card rounded-lg p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
            OddSkies Activity Level
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-parchment">
            OddCon {oddCon.level}
          </h3>
          <p className="mt-2 text-lg font-semibold text-signal-amber">
            {oddCon.name}
            {oddCon.footnote ? "*" : ""}
          </p>
        </div>
        <span className="rounded-md border border-signal-teal/25 bg-signal-teal/10 px-3 py-2 text-sm text-signal-teal">
          {recentCount} recent report{recentCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-5">
        {oddConLevels.map((level) => {
          const active = level.level === oddCon.level;

          return (
            <div
              className={`rounded-md border p-3 ${
                active
                  ? "border-signal-amber/50 bg-signal-amber/10"
                  : "border-night-800 bg-night-950/55"
              }`}
              key={level.level}
            >
              <p className="text-sm font-semibold text-parchment">
                OddCon {level.level}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {level.name}
                {level.footnote ? "*" : ""}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-6 text-muted">
        Current level is based on reports from the last 7 days. Quiet feed,
        quiet skies. Busy feed, spicy skies.
      </p>
      <p className="mt-3 text-xs leading-5 text-muted">
        *Probably. OddSkies does not confirm invasions, hauntings, saucers,
        portals, ghosts, or suspiciously dramatic clouds.
      </p>
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

function countByDay(
  datedReports: { eventDate: Date; report: Report }[],
): CountItem[] {
  const grouped = new Map<string, { count: number; date: Date }>();

  for (const { eventDate } of datedReports) {
    const key = eventDate.toISOString().slice(0, 10);
    const current = grouped.get(key);

    grouped.set(key, {
      count: (current?.count ?? 0) + 1,
      date: eventDate,
    });
  }

  const items = Array.from(grouped.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-8)
    .map(({ count, date }) => ({
      count,
      label: new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
      }).format(date),
    }));

  if (items.length > 0) {
    return items;
  }

  return [{ count: 0, label: "No dated reports" }];
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

function getPeakWindow(datedReports: { eventDate: Date; report: Report }[]) {
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

function getOddConLevel(recentCount: number) {
  if (recentCount >= 10) {
    return oddConLevels[4];
  }

  if (recentCount >= 6) {
    return oddConLevels[3];
  }

  if (recentCount >= 3) {
    return oddConLevels[2];
  }

  if (recentCount >= 1) {
    return oddConLevels[1];
  }

  return oddConLevels[0];
}

function getBarClass(variant: "category" | "region" | "time", index: number) {
  if (variant === "category") {
    return [
      "bg-signal-teal",
      "bg-signal-amber",
      "bg-signal-violet",
      "bg-signal-ember",
      "bg-parchment/70",
      "bg-muted",
    ][index % 6];
  }

  if (variant === "region") {
    return index % 2 === 0
      ? "bg-gradient-to-r from-signal-teal/50 to-signal-teal"
      : "bg-gradient-to-r from-signal-violet/55 to-signal-amber";
  }

  return "bg-gradient-to-r from-signal-teal via-signal-amber to-signal-ember";
}
