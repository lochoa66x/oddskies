const CATEGORY_MOOD_LABELS = new Map([
  ["ufo / uap", "Sky is blinking"],
  ["strange lights", "Glowing suspiciously"],
  ["haunted place", "Quietly haunted"],
  ["haunted places", "Quietly haunted"],
  ["paranormal", "Explainable-ish"],
  ["local legends", "Folklore warming up"],
  ["unknown", "Needs more witnesses"],
]);

const LABEL_PATTERNS = [
  [/montreal/i, "Montreal Orb"],
  [/sedona|triangular|triangle/i, "Sedona Triangle"],
  [/popocat[eé]petl/i, "Popocatépetl Watch"],
  [/s[ãa]o paulo/i, "São Paulo Signal"],
  [/scottish|edinburgh|castle/i, "Scottish Castle Echo"],
  [/tokyo/i, "Tokyo Sky Pulse"],
  [/outback|northern territory/i, "Outback Fire Disc"],
  [/transylvania/i, "Transylvania Shadow"],
  [/dublin/i, "Dublin Whisper House"],
  [/erie/i, "Lake Erie Lights"],
  [/anoka/i, "Anoka UFO"],
  [/prague/i, "Prague Window Light"],
  [/kyoto/i, "Kyoto Lantern Road"],
];

export const REPORT_ENRICHMENT_COLUMNS = [
  "display_title",
  "display_summary",
  "short_label",
  "mood_label",
  "source_quality_label",
  "source_quality_reasons",
  "has_source_link",
  "has_location",
  "has_time",
  "has_media_hint",
  "oracle_ready",
  "oracle_prompt_seed",
  "enrichment_notes",
  "last_enriched_at",
];

export function enrichReportDraft(report, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const title = readString(report.title, report.display_title) ?? "";
  const summary = readString(report.summary, report.display_summary) ?? "";
  const sourceUrl = readString(report.source_url, report.sourceUrl);
  const locationName = readString(report.location_name, report.location, report.place);
  const region = readString(report.region);
  const country = readString(report.country);
  const category = normalizeCategory(readString(report.category) ?? "Unknown");
  const eventDatetime = readString(report.event_datetime, report.eventDateTime);
  const reportedDatetime = readString(
    report.reported_datetime,
    report.reportedDateTime,
  );
  const sourceName = readString(report.source_name, report.sourceName);
  const sourceType = readString(report.source_type, report.sourceType);
  const locationConfidence = readString(report.location_confidence);
  const locationResolution = readString(report.location_resolution);
  const displayTitle = buildDisplayTitle(report, title);
  const displaySummary = buildDisplaySummary(report, summary, displayTitle);
  const hasSourceLink = Boolean(sourceUrl);
  const hasLocation = hasUsableLocation(report, locationName, region, country);
  const hasTime = Boolean(eventDatetime || reportedDatetime);
  const hasMediaHint = Boolean(report.has_media || report.has_media_hint || report.media_url);
  const sourceQuality = getSourceQuality({
    displaySummary,
    displayTitle,
    hasLocation,
    hasMediaHint,
    hasSourceLink,
    hasTime,
    report,
    sourceUrl,
  });
  const moodLabel =
    readString(report.mood_label) ??
    CATEGORY_MOOD_LABELS.get(category.toLowerCase()) ??
    "Suspiciously Interesting";
  const shortLabel =
    readString(report.short_label, report.map_label) ??
    makeShortLabel({
      category,
      displayTitle,
      locationName,
      rawTitle: title,
      summary: displaySummary,
    });
  const oracleReady = Boolean(
    displayTitle &&
      displaySummary &&
      category &&
      category !== "Unknown" &&
      (hasLocation || hasTime),
  );
  const enrichmentNotes = buildEnrichmentNotes({
    displaySummary,
    displayTitle,
    hasLocation,
    hasSourceLink,
    hasTime,
    report,
    sourceQualityLabel: sourceQuality.label,
    sourceUrl,
    title,
  });

  return {
    display_title: displayTitle,
    display_summary: displaySummary,
    short_label: shortLabel,
    mood_label: moodLabel,
    source_quality_label: sourceQuality.label,
    source_quality_reasons: sourceQuality.reasons,
    has_source_link: hasSourceLink,
    has_location: hasLocation,
    has_time: hasTime,
    has_media_hint: hasMediaHint,
    oracle_ready: oracleReady,
    oracle_prompt_seed: oracleReady
      ? makeOraclePromptSeed({
          category,
          displaySummary,
          displayTitle,
          eventDatetime,
          locationConfidence,
          locationName,
          locationResolution,
          region,
          reportedDatetime,
          sourceName,
          sourceType,
          sourceUrl,
        })
      : null,
    enrichment_notes: enrichmentNotes,
    last_enriched_at: now,
  };
}

export function pickReportEnrichmentColumns(enrichment) {
  const picked = {};

  for (const column of REPORT_ENRICHMENT_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(enrichment, column)) {
      picked[column] = enrichment[column];
    }
  }

  return picked;
}

function buildDisplayTitle(report, fallbackTitle) {
  const existing = readString(report.display_title);

  if (existing) {
    return existing;
  }

  const cleaned = stripUrls(fallbackTitle)
    .replace(/\s+[|:-]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return truncateText(cleaned || "Untitled strange report", 88);
}

function buildDisplaySummary(report, fallbackSummary, displayTitle) {
  const existing = readString(report.display_summary);

  if (existing) {
    return existing;
  }

  const cleaned = stripUrls(fallbackSummary)
    .replace(/\s+/g, " ")
    .trim();
  const summary =
    cleaned ||
    `A public source was staged for OddSkies review under "${displayTitle}".`;

  return truncateText(summary, 320);
}

function getSourceQuality({
  displaySummary,
  displayTitle,
  hasLocation,
  hasMediaHint,
  hasSourceLink,
  hasTime,
  report,
  sourceUrl,
}) {
  const reasons = [];
  const isDemo =
    Boolean(report.is_demo || report.isDemo) ||
    /source-guidelines|demo|seed|concept/i.test(sourceUrl ?? "") ||
    /demo|seed|concept/i.test(readString(report.source_type, report.sourceType) ?? "");

  if (isDemo) {
    reasons.push("Demo or seed context");
  }

  if (hasSourceLink) {
    reasons.push("Source link present");
  } else {
    reasons.push("No source link captured");
  }

  if (hasLocation) {
    reasons.push("Public location context present");
  } else {
    reasons.push("Location context missing");
  }

  if (hasTime) {
    reasons.push("Time context present");
  } else {
    reasons.push("Time context missing");
  }

  if (hasMediaHint) {
    reasons.push("Media hint present");
  }

  const contextCount = [
    hasSourceLink,
    hasLocation,
    hasTime,
    displayTitle.length > 10,
    displaySummary.length > 80,
  ].filter(Boolean).length;

  if (isDemo) {
    return { label: "Demo seed", reasons };
  }

  if (contextCount <= 2) {
    return { label: "Needs more context", reasons };
  }

  if (hasSourceLink && hasLocation && hasTime && displaySummary.length > 120) {
    return { label: "Context-rich", reasons };
  }

  if (!hasSourceLink) {
    return { label: "Source-light", reasons };
  }

  return { label: "Linked trail", reasons };
}

function makeShortLabel({ category, displayTitle, locationName, rawTitle, summary }) {
  const haystack = `${displayTitle} ${rawTitle ?? ""} ${locationName ?? ""} ${summary}`;

  for (const [pattern, label] of LABEL_PATTERNS) {
    if (pattern.test(haystack)) {
      return label;
    }
  }

  const place = shortPlaceName(locationName);
  const normalized = haystack.toLowerCase();

  if (place) {
    if (normalized.includes("orb")) {
      return truncateText(`${place} Orb`, 34);
    }

    if (normalized.includes("triangle") || normalized.includes("triangular")) {
      return truncateText(`${place} Triangle`, 34);
    }

    if (normalized.includes("light")) {
      return truncateText(`${place} Lights`, 34);
    }

    if (normalized.includes("signal")) {
      return truncateText(`${place} Signal`, 34);
    }

    if (normalized.includes("shadow")) {
      return truncateText(`${place} Shadow`, 34);
    }

    if (normalized.includes("whisper") || normalized.includes("voice")) {
      return truncateText(`${place} Whisper`, 34);
    }

    if (normalized.includes("disc") || normalized.includes("disk")) {
      return truncateText(`${place} Disc`, 34);
    }

    if (normalized.includes("ufo") || normalized.includes("uap")) {
      return truncateText(`${place} UFO`, 34);
    }

    if (category === "Haunted Place" || category === "Haunted Places") {
      return truncateText(`${place} Haunting`, 34);
    }
  }

  return truncateText(displayTitle, 34);
}

function makeOraclePromptSeed({
  category,
  displaySummary,
  displayTitle,
  eventDatetime,
  locationConfidence,
  locationName,
  locationResolution,
  region,
  reportedDatetime,
  sourceName,
  sourceType,
  sourceUrl,
}) {
  const parts = [
    "OddSkies Oracle preview seed.",
    "Use this only for playful possible explanations and weird clues.",
    "Do not verify the report or claim it is real.",
    `Title: ${displayTitle}`,
    `Category: ${category}`,
    locationName ? `Location: ${locationName}` : "",
    region ? `Region: ${region}` : "",
    eventDatetime ? `Event time: ${eventDatetime}` : "",
    reportedDatetime ? `Reported time: ${reportedDatetime}` : "",
    sourceName ? `Source: ${sourceName}` : "",
    sourceType ? `Source type: ${sourceType}` : "",
    sourceUrl ? `Source URL: ${sourceUrl}` : "",
    locationConfidence ? `Location confidence: ${locationConfidence}` : "",
    locationResolution ? `Location resolution: ${locationResolution}` : "",
    `Summary: ${displaySummary}`,
  ];

  return truncateText(parts.filter(Boolean).join("\n"), 1400);
}

function buildEnrichmentNotes({
  displaySummary,
  displayTitle,
  hasLocation,
  hasSourceLink,
  hasTime,
  report,
  sourceQualityLabel,
  sourceUrl,
  title,
}) {
  const notes = ["Deterministic enrichment only. Not verification."];

  if (displayTitle !== title) {
    notes.push("Display title cleaned or shortened.");
  }

  if (displaySummary.length < 90) {
    notes.push("Summary is short.");
  }

  if (!hasSourceLink) {
    notes.push("No source URL captured.");
  }

  if (/source-guidelines/i.test(sourceUrl ?? "")) {
    notes.push("Source URL appears to be a placeholder.");
  }

  if (!hasLocation) {
    notes.push("No public location context.");
  }

  if (!hasTime) {
    notes.push("No time context.");
  }

  if (report.location_resolution === "private_or_sensitive") {
    notes.push("Location resolution is private_or_sensitive.");
  }

  notes.push(`Source quality: ${sourceQualityLabel}.`);

  return notes;
}

function hasUsableLocation(report, locationName, region, country) {
  if (Number.isFinite(Number(report.latitude)) && Number.isFinite(Number(report.longitude))) {
    return true;
  }

  const combined = `${locationName ?? ""} ${region ?? ""} ${country ?? ""}`.toLowerCase();

  return Boolean(
    combined.trim() &&
      !combined.includes("under review") &&
      !combined.includes("unknown") &&
      !combined.includes("not listed"),
  );
}

function normalizeCategory(category) {
  const normalized = category.toLowerCase();

  if (normalized.includes("ufo") || normalized.includes("uap")) {
    return "UFO / UAP";
  }

  if (normalized.includes("light")) {
    return "Strange Lights";
  }

  if (normalized.includes("haunt")) {
    return "Haunted Place";
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

function stripUrls(value) {
  return String(value ?? "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "");
}

function shortPlaceName(locationName) {
  const value = readString(locationName);

  if (!value) {
    return "";
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[0]
    .replace(/\b(city|county|province|state)\b/gi, "")
    .trim();
}

function truncateText(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function readString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}
