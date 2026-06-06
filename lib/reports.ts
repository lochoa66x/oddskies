export const regionFilters = [
  "All",
  "North America",
  "Latin America",
  "UK & Ireland",
  "Western Europe",
  "East Asia",
  "Oceania",
] as const;

export type RegionFilter = (typeof regionFilters)[number];
export type AtlasRegion = Exclude<RegionFilter, "All">;

export const categoryFilters = [
  "All categories",
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Unknown",
] as const;

export type CategoryFilter = (typeof categoryFilters)[number];

export type Report = {
  category: string;
  confidenceMood: string;
  createdAtRaw?: string;
  curationLabel?: string;
  displayPriority?: number;
  eventDateTime: string;
  eventDateTimeRaw: string;
  hasLocation?: boolean;
  hasMediaHint?: boolean;
  hasSourceLink?: boolean;
  hasTime?: boolean;
  id: string;
  isArchived?: boolean;
  isDemo?: boolean;
  isFeatured?: boolean;
  isHidden?: boolean;
  latitude: number | null;
  location: string;
  locationConfidence?: string;
  locationResolution?: string;
  longitude: number | null;
  marker: string;
  oracleReady?: boolean;
  originalSummary?: string;
  originalTitle?: string;
  publicStatus?: string;
  region: AtlasRegion;
  reportedDateTime: string;
  shortLabel: string;
  sourceName: string;
  sourceQualityLabel?: string;
  sourceQualityReasons?: string[];
  sourceType: string;
  sourceUrl: string;
  summary: string;
  title: string;
  verificationStatus: string;
};

type SupabaseReportRow = Record<string, unknown>;
type Tone = "teal" | "amber" | "violet" | "ember" | "muted";
type ReportDisplayType = "culture_note" | "field_report" | "signal_shelf";

export const regionAnchors: Record<
  AtlasRegion,
  { latitude: number; longitude: number }
> = {
  "North America": { latitude: 42, longitude: -98 },
  "Latin America": { latitude: -11, longitude: -67 },
  "UK & Ireland": { latitude: 54, longitude: -5 },
  "Western Europe": { latitude: 48, longitude: 8 },
  "East Asia": { latitude: 36, longitude: 139 },
  Oceania: { latitude: -31, longitude: 145 },
};

const demoReports: Report[] = [
  {
    category: "UFO / UAP",
    confidenceMood: "Mildly Odd",
    eventDateTime: "May 30, 2026 / 11:09 PM",
    eventDateTimeRaw: "2026-05-31T03:09:00.000Z",
    id: "demo-montreal-orb",
    isDemo: true,
    latitude: 45.5019,
    location: "Montreal, Canada",
    longitude: -73.5674,
    marker: "bg-signal-teal",
    region: "North America",
    reportedDateTime: "May 31, 2026 / 8:12 AM",
    shortLabel: "Montreal Orb",
    sourceName: "Public skywatch thread",
    sourceType: "Social thread",
    sourceUrl: "/source-guidelines",
    summary:
      "Round teal-white object described hovering above a low cloud shelf before fading.",
    title: "Montreal Orb above low cloud shelf",
    verificationStatus: "Unverified",
  },
  {
    category: "UFO / UAP",
    confidenceMood: "Mildly Odd",
    eventDateTime: "May 29, 2026 / 10:42 PM",
    eventDateTimeRaw: "2026-05-30T02:42:00.000Z",
    id: "demo-sedona-triangle",
    isDemo: true,
    latitude: 34.8697,
    location: "Sedona, Arizona",
    longitude: -111.761,
    marker: "bg-signal-teal",
    region: "North America",
    reportedDateTime: "May 30, 2026 / 8:16 AM",
    shortLabel: "Sedona Triangle",
    sourceName: "Public sighting post",
    sourceType: "Social thread",
    sourceUrl: "/source-guidelines",
    summary:
      "Silent triangular light formation reported moving against wind direction.",
    title: "Sedona Triangle over ridge line",
    verificationStatus: "Unverified",
  },
  {
    category: "Strange Lights",
    confidenceMood: "Active Watch",
    eventDateTime: "May 22, 2026 / 9:03 PM",
    eventDateTimeRaw: "2026-05-23T01:03:00.000Z",
    id: "demo-popocatepetl-watch",
    isDemo: true,
    latitude: 19.023,
    location: "Puebla, Mexico",
    longitude: -98.622,
    marker: "bg-signal-ember",
    region: "Latin America",
    reportedDateTime: "May 23, 2026 / 7:42 AM",
    shortLabel: "Popocatepetl Watch",
    sourceName: "Volcano watch clip thread",
    sourceType: "Public video post",
    sourceUrl: "/source-guidelines",
    summary:
      "Bright point described hovering near the Popocatepetl skyline before fading.",
    title: "Popocatepetl Watch light near skyline",
    verificationStatus: "Unverified",
  },
  {
    category: "UFO / UAP",
    confidenceMood: "Mildly Odd",
    eventDateTime: "May 19, 2026 / 1:04 AM",
    eventDateTimeRaw: "2026-05-19T05:04:00.000Z",
    id: "demo-sao-paulo-signal",
    isDemo: true,
    latitude: -23.5558,
    location: "Sao Paulo, Brazil",
    longitude: -46.6396,
    marker: "bg-signal-teal",
    region: "Latin America",
    reportedDateTime: "May 19, 2026 / 8:33 AM",
    shortLabel: "Sao Paulo Signal",
    sourceName: "City skywatch thread",
    sourceType: "Social thread",
    sourceUrl: "/source-guidelines",
    summary:
      "Small cluster of pale green lights reported drifting above high-rise rooftops.",
    title: "Sao Paulo Signal above rooftop line",
    verificationStatus: "Unverified",
  },
  {
    category: "Haunted Place",
    confidenceMood: "Eerie but Thin",
    eventDateTime: "May 23, 2026 / 11:15 PM",
    eventDateTimeRaw: "2026-05-24T03:15:00.000Z",
    id: "demo-dublin-whisper-house",
    isDemo: true,
    latitude: 53.3498,
    location: "Dublin, Ireland",
    longitude: -6.2603,
    marker: "bg-signal-violet",
    region: "UK & Ireland",
    reportedDateTime: "May 24, 2026 / 10:21 AM",
    shortLabel: "Dublin Whisper House",
    sourceName: "Neighborhood history thread",
    sourceType: "Public forum post",
    sourceUrl: "/source-guidelines",
    summary:
      "Residents trade stories about knocks, cold windows, and a stairwell voice.",
    title: "Dublin Whisper House thread resurfaces",
    verificationStatus: "Unverified",
  },
  {
    category: "Haunted Place",
    confidenceMood: "Eerie but Thin",
    eventDateTime: "May 16, 2026 / 12:48 AM",
    eventDateTimeRaw: "2026-05-16T04:48:00.000Z",
    id: "demo-scottish-castle-echo",
    isDemo: true,
    latitude: 56.49,
    location: "Highlands, Scotland",
    longitude: -4.2,
    marker: "bg-signal-violet",
    region: "UK & Ireland",
    reportedDateTime: "May 16, 2026 / 9:28 AM",
    shortLabel: "Scottish Castle Echo",
    sourceName: "Local history post",
    sourceType: "Public forum post",
    sourceUrl: "/source-guidelines",
    summary:
      "Late-night footsteps and a repeating knock described near a closed castle wing.",
    title: "Scottish Castle Echo near closed wing",
    verificationStatus: "Unverified",
  },
  {
    category: "Paranormal",
    confidenceMood: "Eerie but Thin",
    eventDateTime: "May 12, 2026 / 2:11 AM",
    eventDateTimeRaw: "2026-05-12T06:11:00.000Z",
    id: "demo-transylvania-shadow",
    isDemo: true,
    latitude: 46.77,
    location: "Transylvania, Romania",
    longitude: 23.59,
    marker: "bg-signal-violet",
    region: "Western Europe",
    reportedDateTime: "May 12, 2026 / 11:39 AM",
    shortLabel: "Transylvania Shadow",
    sourceName: "Regional mystery board",
    sourceType: "Community post",
    sourceUrl: "/source-guidelines",
    summary:
      "Travelers describe a shadow crossing an empty road near a forest trail marker.",
    title: "Transylvania Shadow near forest road",
    verificationStatus: "Unverified",
  },
  {
    category: "Unknown",
    confidenceMood: "Low Context",
    eventDateTime: "May 18, 2026 / 12:27 AM",
    eventDateTimeRaw: "2026-05-18T04:27:00.000Z",
    id: "demo-tokyo-sky-pulse",
    isDemo: true,
    latitude: 35.6762,
    location: "Tokyo, Japan",
    longitude: 139.6503,
    marker: "bg-muted",
    region: "East Asia",
    reportedDateTime: "May 18, 2026 / 6:18 AM",
    shortLabel: "Tokyo Sky Pulse",
    sourceName: "Late-night sky post",
    sourceType: "Social post",
    sourceUrl: "/source-guidelines",
    summary:
      "Blue-white pulse captured between buildings with little location context.",
    title: "Tokyo Sky Pulse between towers",
    verificationStatus: "Unverified",
  },
  {
    category: "Local Legends",
    confidenceMood: "Folklore Signal",
    eventDateTime: "May 14, 2026 / 10:58 PM",
    eventDateTimeRaw: "2026-05-15T02:58:00.000Z",
    id: "demo-outback-fire-disc",
    isDemo: true,
    latitude: -23.698,
    location: "Northern Territory, Australia",
    longitude: 133.8807,
    marker: "bg-signal-amber",
    region: "Oceania",
    reportedDateTime: "May 15, 2026 / 4:02 PM",
    shortLabel: "Outback Fire Disc",
    sourceName: "Outback travel log",
    sourceType: "Public blog post",
    sourceUrl: "/source-guidelines",
    summary:
      "Orange disc-like glow described low over a distant ridgeline after sundown.",
    title: "Outback Fire Disc near remote ridge",
    verificationStatus: "Unverified",
  },
  {
    category: "Strange Lights",
    confidenceMood: "Suspiciously Interesting",
    eventDateTime: "May 10, 2026 / 9:41 PM",
    eventDateTimeRaw: "2026-05-11T01:41:00.000Z",
    id: "demo-wellington-harbor-lights",
    isDemo: true,
    latitude: -41.2865,
    location: "Wellington, New Zealand",
    longitude: 174.7762,
    marker: "bg-signal-amber",
    region: "Oceania",
    reportedDateTime: "May 11, 2026 / 7:55 AM",
    shortLabel: "Wellington Harbor Lights",
    sourceName: "Harbor watch thread",
    sourceType: "Community post",
    sourceUrl: "/source-guidelines",
    summary:
      "Three steady lights described moving over the harbor before separating.",
    title: "Wellington Harbor Lights split apart",
    verificationStatus: "Unverified",
  },
];

export async function getReports(): Promise<Report[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return demoReports;
  }

  try {
    const endpoint = new URL("/rest/v1/reports", supabaseUrl);
    endpoint.searchParams.set("select", "*");
    endpoint.searchParams.set("order", "event_datetime.desc");

    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return demoReports;
    }

    const rows = (await response.json()) as SupabaseReportRow[];

    if (!Array.isArray(rows) || rows.length === 0) {
      return demoReports;
    }

    return rows.map(normalizeReport).filter(Boolean);
  } catch {
    return demoReports;
  }
}

export function getHomepageDisplayReports(reports: Report[]): Report[] {
  const publishableReports = reports.filter(isHomepageDisplayableReport);

  return publishableReports
    .map((report) => ({
      report,
      isDemoLike: isDemoLikeReport(report),
      score: getHomepageDisplayScore(report),
      isWeak: isWeakHomepageReport(report),
    }))
    .sort((a, b) => {
      if (a.isDemoLike !== b.isDemoLike) {
        return a.isDemoLike ? 1 : -1;
      }

      if (a.isWeak !== b.isWeak) {
        return a.isWeak ? 1 : -1;
      }

      const scoreDelta = b.score - a.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const timeDelta = getReportTime(b.report) - getReportTime(a.report);

      if (timeDelta !== 0) {
        return timeDelta;
      }

      return b.score - a.score;
    })
    .map(({ report }) => report)
    .slice(0, 48);
}

export function getFieldLogReports(reports: Report[]): Report[] {
  return reports.filter(isFieldLogDisplayableReport).sort(sortReportsNewestFirst);
}

export function getHomepageFieldLogReports(reports: Report[]): Report[] {
  const candidates = getFieldLogReports(reports)
    .filter(isHomepageFieldLogReport)
    .sort(compareHomepageFieldLogReports);
  const selected = candidates.slice(0, 5);

  if (selected.length >= 5) {
    return selected;
  }

  const selectedIds = new Set(selected.map((report) => report.id));
  const fallbackSeeds = getFieldLogReports(demoReports)
    .filter(isHomepageFieldLogReport)
    .filter((report) => !selectedIds.has(report.id))
    .sort(compareHomepageFieldLogReports)
    .slice(0, 5 - selected.length);

  return [...selected, ...fallbackSeeds];
}

export function getPublicReportDisplayBadge(report: Report) {
  const displayType = getReportDisplayType(report);

  if (displayType === "culture_note") {
    return "Culture note";
  }

  if (displayType === "signal_shelf") {
    return "Signal shelf";
  }

  if (!report.sourceQualityLabel || isLowContextDisplay(report)) {
    return "Reviewing";
  }

  return report.sourceQualityLabel;
}

export function filterReportsByRegion(
  reports: Report[],
  region: RegionFilter,
): Report[] {
  if (region === "All") {
    return reports;
  }

  return reports.filter((report) => report.region === region);
}

export function filterReportsByCategory(
  reports: Report[],
  category: CategoryFilter,
): Report[] {
  if (category === "All categories") {
    return reports;
  }

  return reports.filter(
    (report) => normalizeCategoryFilter(report.category) === category,
  );
}

export function isCategoryFilter(value: string | undefined): value is CategoryFilter {
  return categoryFilters.some((category) => category === value);
}

export function coordinateToAtlasPosition(
  latitude: number | null,
  longitude: number | null,
): { left: number; top: number } {
  if (latitude === null || longitude === null) {
    return { left: 50, top: 50 };
  }

  const left = 7 + ((longitude + 180) / 360) * 86;
  const top = 12 + ((90 - latitude) / 180) * 58;

  return {
    left: clamp(left, 7, 93),
    top: clamp(top, 12, 70),
  };
}

export function getCategoryTone(category: string): Tone {
  const normalized = category.toLowerCase();

  if (normalized.includes("light")) {
    return "amber";
  }

  if (normalized.includes("haunt") || normalized.includes("paranormal")) {
    return "violet";
  }

  if (normalized.includes("legend") || normalized.includes("unknown")) {
    return "ember";
  }

  return "teal";
}

function normalizeReport(row: SupabaseReportRow, index: number): Report {
  const latitude = readNumber(row, "latitude", "lat");
  const longitude = readNumber(row, "longitude", "lng", "lon");
  const category = normalizeCategory(
    readString(row, "category", "report_category", "type") ?? "Unknown",
  );
  const displayTitle = readString(row, "display_title");
  const originalTitle = readString(row, "title", "report_title", "name", "label");
  const rawTitle =
    displayTitle && !looksPreTruncated(displayTitle)
      ? displayTitle
      : originalTitle ?? displayTitle ?? "Untitled strange report";
  const cleanedTitle = cleanPublicText(rawTitle) || "Untitled strange report";
  const title = truncateAtNaturalBoundary(cleanedTitle, 88);
  const displaySummary = readString(row, "display_summary");
  const originalSummary = readString(row, "summary", "description", "body");
  const rawSummary =
    displaySummary && !looksPreTruncated(displaySummary)
      ? displaySummary
      : originalSummary ?? displaySummary ?? "No summary is available yet.";
  const cleanedSummary =
    cleanPublicText(rawSummary) || "No summary is available yet.";
  const summary = truncateAtNaturalBoundary(cleanedSummary, 280);
  const eventRaw =
    readString(row, "event_datetime", "event_at", "event_date") ?? "";
  const reportedRaw =
    readString(row, "reported_datetime", "reported_at", "created_at") ?? "";
  const createdRaw = readString(row, "created_at", "updated_at", "published_at");
  const rawLocation = readString(row, "location", "place", "location_name");
  const location = formatPublicLocation(rawLocation);
  const hasUsableLocation = !isPlaceholderLocation(rawLocation);
  const locationConfidence = formatPublicLocationConfidence(
    readString(row, "location_confidence"),
  );
  const region = normalizeRegion(
    readString(row, "region", "report_region", "region_label"),
    latitude,
    longitude,
  );

  return {
    category,
    confidenceMood:
      readString(
        row,
        "mood_label",
        "confidence_mood",
        "mood",
        "confidence_label",
      ) ??
      "Suspiciously Interesting",
    createdAtRaw: createdRaw,
    curationLabel: readString(row, "curation_label", "review_label"),
    displayPriority: readNumber(row, "display_priority") ?? 0,
    eventDateTime: formatDateTime(eventRaw),
    eventDateTimeRaw: eventRaw,
    hasLocation: Boolean(
      (readBoolean(row, "has_location") ?? hasUsableLocation) &&
        hasUsableLocation,
    ),
    hasMediaHint: readBoolean(row, "has_media_hint") ?? readBoolean(row, "has_media"),
    hasSourceLink:
      readBoolean(row, "has_source_link") ??
      Boolean(readString(row, "source_url", "url", "link")),
    hasTime: readBoolean(row, "has_time") ?? Boolean(eventRaw || reportedRaw),
    id:
      readString(row, "id", "slug", "report_id") ??
      `${slugify(rawTitle)}-${index}`,
    isArchived:
      normalizePublicStatus(readString(row, "public_status")) === "archived" ||
      Boolean(readString(row, "archived_at")),
    latitude,
    isFeatured:
      readBoolean(row, "is_featured") ??
      normalizePublicStatus(readString(row, "public_status")) === "featured",
    isHidden:
      normalizePublicStatus(readString(row, "public_status")) === "hidden" ||
      Boolean(readString(row, "hidden_at")),
    location,
    locationConfidence,
    locationResolution: readString(row, "location_resolution"),
    longitude,
    marker: getMarkerClass(category),
    oracleReady: readBoolean(row, "oracle_ready") ?? false,
    originalSummary: originalSummary && originalSummary !== summary ? originalSummary : undefined,
    originalTitle: originalTitle && originalTitle !== title ? originalTitle : undefined,
    publicStatus: normalizePublicStatus(readString(row, "public_status")),
    region,
    reportedDateTime: formatDateTime(reportedRaw),
    shortLabel: makePublicShortLabel(
      readString(row, "short_label", "map_label"),
      title,
      rawLocation,
    ),
    sourceName:
      readString(row, "source_name", "source", "publisher") ??
      "Source not listed",
    sourceQualityLabel:
      readString(row, "source_quality_label") ??
      (readString(row, "source_url", "url", "link") ? "Linked trail" : "Source-light"),
    sourceQualityReasons: readStringArray(row, "source_quality_reasons"),
    sourceType:
      readString(row, "source_type", "source_kind") ?? "Public source",
    sourceUrl: readString(row, "source_url", "url", "link") ?? "",
    summary,
    title,
    verificationStatus:
      readString(row, "verification_status", "status") ?? "Unverified",
  };
}

function cleanPublicText(value: string) {
  return value
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "")
    .replace(/(^|[\s([{])#[^\s#]+/gu, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function getHomepageDisplayScore(report: Report) {
  let score = report.displayPriority ?? 0;
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const curationLabel = report.curationLabel?.toLowerCase() ?? "";

  if (report.isFeatured || report.publicStatus === "featured") {
    score += 10;
  }

  if (isDemoLikeReport(report)) {
    score -= 6;
  } else {
    score += 7;
  }

  if (sourceQuality.includes("context-rich")) {
    score += 5;
  }

  if (sourceQuality.includes("linked trail")) {
    score += 4;
  }

  if (curationLabel.includes("strong")) {
    score += 5;
  } else if (curationLabel.includes("good")) {
    score += 4;
  } else if (curationLabel.includes("review")) {
    score += 2;
  }

  if (report.hasSourceLink || report.sourceUrl) {
    score += 3;
  }

  if (report.hasLocation || !isMissingReportLocation(report.location)) {
    score += 2;
  }

  if (report.hasTime && report.eventDateTime !== "Date not listed") {
    score += 2;
  }

  if (report.hasMediaHint) {
    score += 1;
  }

  if (report.oracleReady) {
    score += 1;
  }

  if (report.title.length >= 22) {
    score += 1;
  }

  if (report.summary.length >= 90) {
    score += 2;
  }

  if (sourceQuality.includes("source-light")) {
    score -= 3;
  }

  if (isLowContextDisplay(report)) {
    score -= 8;
  }

  if (isMissingReportLocation(report.location)) {
    score -= 3;
  }

  if (!report.hasTime || report.eventDateTime === "Date not listed") {
    score -= 2;
  }

  if (report.category === "Unknown" && !isFeaturedHomepageReport(report)) {
    score -= 7;
  }

  if (hasObviousLocationCategoryMismatch(report)) {
    score -= 6;
  }

  if (isCultureNoteReport(report)) {
    score -= 5;
  }

  return score;
}

function isHomepageDisplayableReport(report: Report) {
  if (!isPubliclyListedReport(report)) {
    return false;
  }

  if (isRejectedLike(report) || hasPrivateOrSensitiveSignal(report)) {
    return false;
  }

  if (looksPromotionalOrOffTopic(getReportDisplayText(report))) {
    return false;
  }

  if (
    report.category === "Unknown" &&
    isDemoLikeReport(report) &&
    !isFeaturedHomepageReport(report)
  ) {
    return false;
  }

  if (hasObviousLocationCategoryMismatch(report) && !isFeaturedHomepageReport(report)) {
    return false;
  }

  return true;
}

function isHomepageFieldLogReport(report: Report) {
  const status = normalizePublicStatus(report.publicStatus);
  const displayType = getReportDisplayType(report);
  const featured = isFeaturedHomepageReport(report);

  if (!isHomepageDisplayableReport(report)) {
    return false;
  }

  if (report.isArchived || status === "archived") {
    return false;
  }

  if (displayType !== "field_report" && !featured) {
    return false;
  }

  if (isWeakHomepageReport(report) && !featured) {
    return false;
  }

  return true;
}

function compareHomepageFieldLogReports(a: Report, b: Report) {
  const aDisplayType = getReportDisplayType(a);
  const bDisplayType = getReportDisplayType(b);
  const aFieldReport = aDisplayType === "field_report";
  const bFieldReport = bDisplayType === "field_report";

  if (aFieldReport !== bFieldReport) {
    return aFieldReport ? -1 : 1;
  }

  const aDemoLike = isDemoLikeReport(a);
  const bDemoLike = isDemoLikeReport(b);

  if (aDemoLike !== bDemoLike) {
    return aDemoLike ? 1 : -1;
  }

  const scoreDelta = getHomepageDisplayScore(b) - getHomepageDisplayScore(a);

  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return getReportTime(b) - getReportTime(a);
}

function isFieldLogDisplayableReport(report: Report) {
  const status = normalizePublicStatus(report.publicStatus);

  if (report.isHidden) {
    return false;
  }

  if (isRejectedLike(report) || hasPrivateOrSensitiveSignal(report)) {
    return false;
  }

  if (looksPromotionalOrOffTopic(getReportDisplayText(report))) {
    return false;
  }

  return (
    !status ||
    status === "published" ||
    status === "featured" ||
    status === "archived" ||
    report.isArchived
  );
}

function isWeakHomepageReport(report: Report) {
  return (
    isLowContextDisplay(report) ||
    isCultureNoteReport(report) ||
    hasObviousLocationCategoryMismatch(report) ||
    report.category === "Unknown" ||
    isMissingReportLocation(report.location) ||
    !report.hasTime ||
    report.eventDateTime === "Date not listed"
  );
}

function isFeaturedHomepageReport(report: Report) {
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const curationLabel = report.curationLabel?.toLowerCase() ?? "";

  return (
    report.isFeatured ||
    report.publicStatus === "featured" ||
    sourceQuality.includes("context-rich") ||
    curationLabel.includes("strong") ||
    curationLabel.includes("good")
  );
}

function isDemoLikeReport(report: Report) {
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";

  return report.isDemo || sourceQuality.includes("demo seed");
}

function isPubliclyListedReport(report: Report) {
  const status = normalizePublicStatus(report.publicStatus);

  if (report.isArchived || report.isHidden) {
    return false;
  }

  return !status || status === "published" || status === "featured";
}

function isLowContextDisplay(report: Report) {
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const curationLabel = report.curationLabel?.toLowerCase() ?? "";

  return (
    sourceQuality.includes("needs more context") ||
    sourceQuality.includes("low context") ||
    sourceQuality.includes("low-context") ||
    sourceQuality.includes("unscored") ||
    curationLabel.includes("low context") ||
    curationLabel.includes("low-context") ||
    report.confidenceMood.toLowerCase().includes("low context")
  );
}

function isMissingReportLocation(location: string) {
  const normalized = location.trim().toLowerCase();

  return (
    !normalized ||
    normalized === "unknown" ||
    normalized === "loc: reviewing" ||
    normalized === "location pending" ||
    normalized === "location under review"
  );
}

function isRejectedLike(report: Report) {
  const status = report.verificationStatus.toLowerCase().replace(/[_-]+/g, " ");

  return (
    status.includes("rejected") ||
    status.includes("duplicate") ||
    status.includes("private") ||
    status.includes("sensitive")
  );
}

function hasPrivateOrSensitiveSignal(report: Report) {
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const curationLabel = report.curationLabel?.toLowerCase() ?? "";
  const reasons = report.sourceQualityReasons?.join(" ").toLowerCase() ?? "";

  return (
    sourceQuality.includes("private") ||
    sourceQuality.includes("sensitive") ||
    curationLabel.includes("private") ||
    curationLabel.includes("sensitive") ||
    reasons.includes("private") ||
    reasons.includes("sensitive")
  );
}

function looksPromotionalOrOffTopic(value: string) {
  return /amazon\.com|\/dp\/|kindle|buy now|coupon|discount|\.shop\b|survival kit|group chat|teaser|trailer|movie|film|cinematic survival kit|product link|available now/i.test(
    value,
  );
}

function isCultureNoteReport(report: Report) {
  const text = getReportDisplayText(report);
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const sourceRich =
    report.isDemo ||
    Boolean(report.sourceUrl) ||
    sourceQuality.includes("context-rich") ||
    sourceQuality.includes("linked trail");

  return (
    sourceRich &&
    /fairytaletuesday|fabled event|mandela|movie quote|memory glitch|internet weirdness|folklore note|culture note|mythology/i.test(
      text,
    )
  );
}

function getReportDisplayType(report: Report): ReportDisplayType {
  const text = getReportDisplayText(report);
  const sourceType = report.sourceType.toLowerCase();
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";
  const curationLabel = report.curationLabel?.toLowerCase() ?? "";
  const displayText = `${text} ${sourceType} ${sourceQuality} ${curationLabel}`;

  if (
    /signal shelf|rabbit hole|link roundup|link collection|resource list|watch list/i.test(
      displayText,
    )
  ) {
    return "signal_shelf";
  }

  if (
    isCultureNoteReport(report) ||
    /debunk|commentary|explainer|opinion|essay|video drop|new video|podcast|ufo news|weird culture|folklore discussion|mandela effect/i.test(
      displayText,
    )
  ) {
    return "culture_note";
  }

  return "field_report";
}

function hasObviousLocationCategoryMismatch(report: Report) {
  const text = getReportDisplayText(report).toLowerCase();
  const location = report.location.toLowerCase();

  if (
    report.region === "Latin America" &&
    /japan|kitsune|kyoto|tokyo|fox's wedding/.test(text)
  ) {
    return true;
  }

  if (location.includes("rio") && /japan|kitsune|fox's wedding/.test(text)) {
    return true;
  }

  return false;
}

function getReportDisplayText(report: Report) {
  return `${report.title} ${report.summary} ${report.originalTitle ?? ""} ${
    report.originalSummary ?? ""
  }`;
}

function getReportTime(report: Report) {
  const createdTime = new Date(report.createdAtRaw ?? "").getTime();

  if (Number.isFinite(createdTime)) {
    return createdTime;
  }

  const time = new Date(report.eventDateTimeRaw).getTime();

  return Number.isFinite(time) ? time : 0;
}

function sortReportsNewestFirst(a: Report, b: Report) {
  return getReportTime(b) - getReportTime(a);
}

function looksPreTruncated(value: string) {
  return /(\.\.\.|…)$/u.test(value.trim());
}

function truncateAtNaturalBoundary(value: string, maxLength: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const cutoff = Math.max(0, maxLength - 1);
  const slice = cleaned.slice(0, cutoff).trimEnd();
  const punctuationMatches = [...slice.matchAll(/[.!?]/g)];
  const lastPunctuation = punctuationMatches.at(-1)?.index;

  if (
    lastPunctuation !== undefined &&
    lastPunctuation > Math.floor(maxLength * 0.45)
  ) {
    return `${slice.slice(0, lastPunctuation + 1).trim()}…`;
  }

  const lastSpace = slice.lastIndexOf(" ");
  const boundary =
    lastSpace > Math.floor(maxLength * 0.45) ? slice.slice(0, lastSpace) : slice;

  return `${boundary.replace(/[,:;-]+$/g, "").trim()}…`;
}

function formatPublicLocation(value?: string) {
  if (isPlaceholderLocation(value)) {
    return "";
  }

  return cleanPublicText(value ?? "");
}

function isPlaceholderLocation(value?: string) {
  const normalized = cleanPublicText(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  return (
    normalized.length === 0 ||
    normalized === "unknown" ||
    normalized === "none" ||
    normalized === "no location" ||
    normalized === "location none" ||
    normalized === "location pending" ||
    normalized === "location not listed" ||
    normalized === "location under review" ||
    normalized === "not listed"
  );
}

function hasPlaceholderLocationText(value: string) {
  return /location\s+(under review|pending|not listed|none)|\bloc\s+(none|unknown|pending)\b/i.test(
    value,
  );
}

function formatPublicLocationConfidence(value?: string) {
  const normalized = cleanPublicText(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (
    !normalized ||
    normalized === "none" ||
    normalized === "unknown" ||
    normalized === "pending" ||
    normalized === "not listed"
  ) {
    return undefined;
  }

  return normalized;
}

function normalizePublicStatus(value?: string) {
  const normalized = cleanPublicText(value ?? "")
    .toLowerCase()
    .replace(/[_\s-]+/g, "_");

  if (
    normalized === "published" ||
    normalized === "featured" ||
    normalized === "archived" ||
    normalized === "hidden"
  ) {
    return normalized;
  }

  return undefined;
}

function makePublicShortLabel(
  label: string | undefined,
  title: string,
  location?: string,
) {
  const cleanedLabel = cleanPublicText(label ?? "");

  if (cleanedLabel && !hasPlaceholderLocationText(cleanedLabel)) {
    return truncateAtNaturalBoundary(cleanedLabel, 34);
  }

  return makeShortLabel(
    title,
    isPlaceholderLocation(location) ? undefined : location,
  );
}

function readString(row: SupabaseReportRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function readNumber(row: SupabaseReportRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readBoolean(row: SupabaseReportRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") {
        return true;
      }

      if (normalized === "false") {
        return false;
      }
    }
  }

  return undefined;
}

function readStringArray(row: SupabaseReportRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeCategory(category: string) {
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

  if (normalized.includes("legend") || normalized.includes("folklore")) {
    return "Local Legends";
  }

  if (normalized.includes("paranormal")) {
    return "Paranormal";
  }

  if (normalized.includes("unknown")) {
    return "Unknown";
  }

  return category;
}

function normalizeCategoryFilter(category: string): CategoryFilter {
  const normalized = normalizeCategory(category);

  if (isCategoryFilter(normalized)) {
    return normalized;
  }

  return "Unknown";
}

function normalizeRegion(
  region: string | undefined,
  latitude: number | null,
  longitude: number | null,
): AtlasRegion {
  const normalized = region?.toLowerCase() ?? "";

  if (
    normalized.includes("uk") ||
    normalized.includes("ireland") ||
    normalized.includes("scotland") ||
    normalized.includes("england") ||
    normalized.includes("wales")
  ) {
    return "UK & Ireland";
  }

  if (
    normalized.includes("latin") ||
    normalized.includes("mexico") ||
    normalized.includes("brazil") ||
    normalized.includes("south america")
  ) {
    return "Latin America";
  }

  if (
    normalized.includes("europe") ||
    normalized.includes("germany") ||
    normalized.includes("france") ||
    normalized.includes("romania") ||
    normalized.includes("spain")
  ) {
    return "Western Europe";
  }

  if (
    normalized.includes("asia") ||
    normalized.includes("japan") ||
    normalized.includes("tokyo")
  ) {
    return "East Asia";
  }

  if (
    normalized.includes("oceania") ||
    normalized.includes("australia") ||
    normalized.includes("zealand")
  ) {
    return "Oceania";
  }

  if (
    normalized.includes("north america") ||
    normalized.includes("canada") ||
    normalized.includes("united states") ||
    normalized.includes("usa")
  ) {
    return "North America";
  }

  return regionFromCoordinates(latitude, longitude);
}

function regionFromCoordinates(
  latitude: number | null,
  longitude: number | null,
): AtlasRegion {
  if (latitude === null || longitude === null) {
    return "North America";
  }

  if (latitude >= 14 && latitude <= 33 && longitude >= -118 && longitude <= -86) {
    return "Latin America";
  }

  if (latitude >= -60 && latitude <= 15 && longitude >= -90 && longitude <= -30) {
    return "Latin America";
  }

  if (latitude >= 49 && latitude <= 61 && longitude >= -12 && longitude <= 3) {
    return "UK & Ireland";
  }

  if (latitude >= 35 && latitude <= 61 && longitude >= -12 && longitude <= 35) {
    return "Western Europe";
  }

  if (latitude >= 18 && latitude <= 50 && longitude >= 100 && longitude <= 150) {
    return "East Asia";
  }

  if (latitude >= -50 && latitude <= -5 && longitude >= 110 && longitude <= 180) {
    return "Oceania";
  }

  if (latitude >= 25 && latitude <= 72 && longitude >= -170 && longitude <= -52) {
    return "North America";
  }

  return "North America";
}

function getMarkerClass(category: string) {
  switch (getCategoryTone(category)) {
    case "amber":
      return "bg-signal-amber";
    case "ember":
      return "bg-signal-ember";
    case "muted":
      return "bg-muted";
    case "violet":
      return "bg-signal-violet";
    case "teal":
    default:
      return "bg-signal-teal";
  }
}

function makeShortLabel(title: string, location?: string) {
  const source = `${title} ${location ?? ""}`.toLowerCase();

  if (source.includes("montreal")) {
    return "Montreal Orb";
  }

  if (source.includes("sedona")) {
    return "Sedona Triangle";
  }

  if (source.includes("popocatepetl") || source.includes("popocat")) {
    return "Popocatepetl Watch";
  }

  if (source.includes("sao paulo") || source.includes("sao")) {
    return "Sao Paulo Signal";
  }

  if (source.includes("scottish") || source.includes("scotland")) {
    return "Scottish Castle Echo";
  }

  if (source.includes("tokyo")) {
    return "Tokyo Sky Pulse";
  }

  if (source.includes("outback") || source.includes("northern territory")) {
    return "Outback Fire Disc";
  }

  if (source.includes("transylvania")) {
    return "Transylvania Shadow";
  }

  const cleaned = title
    .replace(/\s+(above|near|over|thread|resurfaces).*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 24) {
    return cleaned;
  }

  return `${cleaned.slice(0, 21).trim()}...`;
}

function formatDateTime(value: string) {
  if (!value) {
    return "Date not listed";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatted = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const lastComma = formatted.lastIndexOf(",");

  if (lastComma === -1) {
    return formatted;
  }

  return `${formatted.slice(0, lastComma)} /${formatted.slice(lastComma + 1)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
