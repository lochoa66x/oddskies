import {
  filterReportsByCategory,
  type AtlasRegion,
  type CategoryFilter,
  type Report,
} from "@/lib/reports";

export type TaxonomyKind = "category" | "region";

export type CategoryDefinition = {
  description: string;
  label: string;
  shortLabel: string;
  slug: string;
  trustLine: string;
};

export type RegionDefinition = {
  atlasRegion?: AtlasRegion;
  description: string;
  label: string;
  shortLabel: string;
  slug: string;
  trustLine: string;
};

export const categoryDefinitions: CategoryDefinition[] = [
  {
    description:
      "UFO / UAP field notes, skywatch threads, and source-linked public reports filed without confirmation.",
    label: "UFO / UAP",
    shortLabel: "Sky objects",
    slug: "ufo-uap",
    trustLine:
      "Filed for browsing only. OddSkies has not confirmed any craft, origin, or event.",
  },
  {
    description:
      "Strange lights, glowing clusters, pulses, and night-sky reports kept in source-aware order.",
    label: "Strange Lights",
    shortLabel: "Light reports",
    slug: "strange-lights",
    trustLine:
      "Light reports can be aircraft, weather, cameras, edits, or something else. Nothing here is confirmed.",
  },
  {
    description:
      "Haunted places, cold rooms, footsteps, whisper houses, and public local threads with a spooky trail.",
    label: "Haunted Places",
    shortLabel: "Places",
    slug: "haunted-places",
    trustLine:
      "OddSkies keeps the story trail visible. It does not verify hauntings.",
  },
  {
    description:
      "Paranormal reports that do not fit neatly elsewhere, kept careful, weird, and visibly unverified.",
    label: "Paranormal",
    shortLabel: "Odd files",
    slug: "paranormal",
    trustLine:
      "Paranormal is a filing label, not a verdict. Source context still comes first.",
  },
  {
    description:
      "Local legends, folklore signals, road stories, and public place-based mysteries.",
    label: "Local Legends",
    shortLabel: "Folklore",
    slug: "local-legends",
    trustLine:
      "Legends are cultural trails, not confirmed events. Read them with snacks and skepticism.",
  },
  {
    description:
      "Memory glitches, reality-weirdness, and culture notes only when an approved report actually fits the shelf.",
    label: "Mandela / Reality Weirdness",
    shortLabel: "Reality shelf",
    slug: "mandela-reality-weirdness",
    trustLine:
      "OddSkies jokes about reality getting strange. It does not claim timelines changed.",
  },
  {
    description:
      "Reports that are still hard to classify, parked here until the trail gets clearer.",
    label: "Unknown",
    shortLabel: "Unsorted",
    slug: "unknown",
    trustLine:
      "Unknown means not enough clean context yet. It does not mean more mysterious or more true.",
  },
];

export const regionDefinitions: RegionDefinition[] = [
  {
    atlasRegion: "North America",
    description:
      "Approved public field notes filed around North America, newest first and still unverified.",
    label: "North America",
    shortLabel: "North America",
    slug: "north-america",
    trustLine:
      "Regional browsing does not confirm location, witnesses, or cause. It only keeps the trail organized.",
  },
  {
    atlasRegion: "Latin America",
    description:
      "Approved public reports from Latin America, including skywatch, light, folklore, and odd local notes.",
    label: "Latin America",
    shortLabel: "Latin America",
    slug: "latin-america",
    trustLine:
      "OddSkies maps the public trail. It does not verify the event or the source.",
  },
  {
    atlasRegion: "UK & Ireland",
    description:
      "Field notes from the UK and Ireland, from sky reports to local legends and old-house weirdness.",
    label: "UK & Ireland",
    shortLabel: "UK & Ireland",
    slug: "uk-ireland",
    trustLine:
      "A region label helps browsing. It is not proof that a report happened as described.",
  },
  {
    atlasRegion: "Western Europe",
    description:
      "Approved public field notes across Western Europe, organized by latest report activity.",
    label: "Western Europe",
    shortLabel: "Western Europe",
    slug: "western-europe",
    trustLine:
      "Reports remain unverified even when the location trail looks tidy.",
  },
  {
    atlasRegion: "East Asia",
    description:
      "Approved public field notes from East Asia, kept source-linked where possible and never confirmed.",
    label: "East Asia",
    shortLabel: "East Asia",
    slug: "east-asia",
    trustLine:
      "OddSkies is a public report index, not a confirmation machine.",
  },
  {
    atlasRegion: "Oceania",
    description:
      "Approved public field notes from Oceania, including sky reports, local legends, and strange light trails.",
    label: "Oceania",
    shortLabel: "Oceania",
    slug: "oceania",
    trustLine:
      "Counts are real. Conclusions are not. Every report stays unverified.",
  },
  {
    description:
      "Approved public field notes with incomplete or uncertain location context.",
    label: "Unknown Region",
    shortLabel: "Unknown",
    slug: "unknown",
    trustLine:
      "Unknown region means the location trail is thin. It does not make the report stronger.",
  },
];

export function getCategoryDefinition(slug: string) {
  return categoryDefinitions.find((category) => category.slug === slug);
}

export function getRegionDefinition(slug: string) {
  return regionDefinitions.find((region) => region.slug === slug);
}

export function getReportsForCategory(
  reports: Report[],
  category: CategoryDefinition,
) {
  if (category.slug === "mandela-reality-weirdness") {
    return reports.filter(hasRealityWeirdnessSignal);
  }

  return filterReportsByCategory(reports, category.label as CategoryFilter);
}

export function getReportsForRegion(
  reports: Report[],
  region: RegionDefinition,
) {
  if (!region.atlasRegion) {
    return reports.filter(hasUnknownRegionSignal);
  }

  return reports.filter(
    (report) =>
      report.region === region.atlasRegion && !hasUnknownRegionSignal(report),
  );
}

export function getCategoryCounts(reports: Report[]) {
  return new Map(
    categoryDefinitions.map((category) => [
      category.slug,
      getReportsForCategory(reports, category).length,
    ]),
  );
}

export function getRegionCounts(reports: Report[]) {
  return new Map(
    regionDefinitions.map((region) => [
      region.slug,
      getReportsForRegion(reports, region).length,
    ]),
  );
}

export function getTaxonomyPageDescription(
  kind: TaxonomyKind,
  label: string,
  count: number,
) {
  const noun = count === 1 ? "field note" : "field notes";
  const scope = kind === "category" ? `filed under ${label}` : `from ${label}`;

  return `${count} approved public ${noun} ${scope}. Source-linked where possible, never confirmed.`;
}

function hasRealityWeirdnessSignal(report: Report) {
  const text = [
    report.category,
    report.title,
    report.summary,
    report.originalTitle,
    report.originalSummary,
    report.sourceName,
    report.sourceType,
    report.sourceQualityLabel,
    report.curationLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /mandela|memory glitch|false memory|reality|timeline|collider|cern|large hadron|glitch in the matrix/.test(
    text,
  );
}

function hasUnknownRegionSignal(report: Report) {
  const location = report.location.trim().toLowerCase();
  const confidence = report.locationConfidence?.trim().toLowerCase() ?? "";
  const resolution = report.locationResolution?.trim().toLowerCase() ?? "";

  return (
    report.hasLocation === false ||
    !location ||
    location === "unknown" ||
    location.includes("under review") ||
    location.includes("not listed") ||
    location.includes("pending") ||
    confidence.includes("unknown") ||
    confidence.includes("low") ||
    resolution.includes("unknown")
  );
}
