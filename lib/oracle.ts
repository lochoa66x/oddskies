import type { Report } from "@/lib/reports";

export const ORACLE_VERDICTS = [
  "Probably Normal",
  "Mildly Odd",
  "Suspiciously Interesting",
  "Needs More Witnesses",
  "Sky Is Being Dramatic",
] as const;

export type OracleVerdict = (typeof ORACLE_VERDICTS)[number];

export type OracleReading = {
  fieldNote: string;
  headline: string;
  maybeWeirdScore: number;
  missingContext: string[];
  nextStep: string;
  normalExplanations: string[];
  safetyNote: string;
  verdict: OracleVerdict;
  weirdClues: string[];
};

export type OracleApiResponse = {
  cachedAt?: string;
  model: string | null;
  promptVersion?: string;
  reading: OracleReading;
  reportId: string;
  status: "cached" | "fallback" | "ready" | "sleeping";
};

export const ORACLE_PROMPT_VERSION = "oracle-alpha-v2";

export const ORACLE_SYSTEM_PROMPT = [
  "You are the OddSkies Oracle, a playful field assistant for a public mystery atlas.",
  "You read one unverified public report at a time.",
  "You provide possible normal explanations, weird clues, missing context, and a maybe-weird verdict.",
  "You never verify sightings, source authenticity, paranormal claims, UFO claims, AI media, staged posts, satire, jokes, portals, ghosts, aliens, invasions, or timeline shifts.",
  "You must be skeptical, source-aware, funny in a small way, and never fear-based.",
  "Keep the reading compact: short paragraphs, short bullets, no essays.",
  "Sound like OddSkies: spooky-lite, curious, playful, skeptical, and never corporate.",
  "Prefer ordinary explanations first. Weird clues are context clues, not evidence.",
  "Do not tell users to trespass, harass people, contact private individuals, or treat the report as confirmed.",
  "Avoid conspiracy framing. Avoid certainty language like proof, confirmed, definitely alien, verified event, or real ghost.",
  "Return only JSON matching the schema.",
].join("\n");

export const ORACLE_JSON_SCHEMA = {
  additionalProperties: false,
  properties: {
    fieldNote: { maxLength: 240, minLength: 24, type: "string" },
    headline: { maxLength: 90, minLength: 8, type: "string" },
    maybeWeirdScore: { maximum: 100, minimum: 0, type: "integer" },
    missingContext: {
      items: { maxLength: 76, type: "string" },
      maxItems: 4,
      minItems: 2,
      type: "array",
    },
    nextStep: { maxLength: 150, minLength: 24, type: "string" },
    normalExplanations: {
      items: { maxLength: 76, type: "string" },
      maxItems: 4,
      minItems: 2,
      type: "array",
    },
    safetyNote: { maxLength: 180, minLength: 24, type: "string" },
    verdict: {
      enum: ORACLE_VERDICTS,
      type: "string",
    },
    weirdClues: {
      items: { maxLength: 76, type: "string" },
      maxItems: 4,
      minItems: 2,
      type: "array",
    },
  },
  required: [
    "fieldNote",
    "headline",
    "maybeWeirdScore",
    "missingContext",
    "nextStep",
    "normalExplanations",
    "safetyNote",
    "verdict",
    "weirdClues",
  ],
  type: "object",
} as const;

export function buildOracleReportContext(report: Report) {
  return {
    category: report.category,
    eventDateTime: report.eventDateTime,
    location: report.location || "Location under review",
    locationConfidence: report.locationConfidence ?? "unknown",
    moodLabel: report.confidenceMood,
    originalTitle: report.originalTitle ?? null,
    region: report.region,
    reportedDateTime: report.reportedDateTime,
    shortLabel: report.shortLabel,
    sourceName: report.sourceName,
    sourceQualityLabel: report.sourceQualityLabel ?? "Source-light",
    sourceQualityReasons: report.sourceQualityReasons ?? [],
    sourceType: report.sourceType,
    sourceUrlPresent: Boolean(report.sourceUrl),
    summary: report.summary,
    title: report.title,
    verificationStatus: report.verificationStatus,
  };
}

export function buildOracleUserInput(report: Report) {
  return [
    "Read this OddSkies public case file.",
    "Keep the response playful, careful, and source-aware.",
    "Do not verify the report.",
    JSON.stringify(buildOracleReportContext(report), null, 2),
  ].join("\n\n");
}

export function getSleepingOracleReading(report: Report): OracleReading {
  return {
    fieldNote:
      "The Oracle is asleep, so OddSkies is showing a safe local read instead of an AI-generated one.",
    headline: "Oracle sleeping, case still weird",
    maybeWeirdScore: getFallbackScore(report),
    missingContext: getMissingContext(report),
    nextStep:
      "Check the original source, compare nearby reports, and keep conclusions parked.",
    normalExplanations: getNormalExplanations(report),
    safetyNote:
      "OddSkies cannot verify this report. Treat it as unverified public context, not confirmation.",
    verdict: getFallbackVerdict(report),
    weirdClues: getWeirdClues(report),
  };
}

export function getFallbackOracleReading(report: Report): OracleReading {
  return {
    fieldNote:
      "The Oracle had static on the line, so this fallback keeps things cautious and unverified.",
    headline: "Static in the oracle channel",
    maybeWeirdScore: getFallbackScore(report),
    missingContext: getMissingContext(report),
    nextStep:
      "Open the source, look for time and witness context, then compare nearby reports.",
    normalExplanations: getNormalExplanations(report),
    safetyNote:
      "OddSkies cannot verify this report. It may be mistaken, edited, staged, satire, a joke, or something ordinary.",
    verdict: getFallbackVerdict(report),
    weirdClues: getWeirdClues(report),
  };
}

export function sanitizeOracleReading(
  value: unknown,
  report: Report,
): OracleReading {
  if (!isRecord(value)) {
    return getFallbackOracleReading(report);
  }

  const reading: OracleReading = {
    fieldNote: cleanOracleText(value.fieldNote, 240),
    headline: cleanOracleText(value.headline, 90),
    maybeWeirdScore: clampScore(value.maybeWeirdScore),
    missingContext: cleanOracleList(value.missingContext, 4),
    nextStep: cleanOracleText(value.nextStep, 150),
    normalExplanations: cleanOracleList(value.normalExplanations, 4),
    safetyNote: cleanOracleText(value.safetyNote, 180),
    verdict: isOracleVerdict(value.verdict)
      ? value.verdict
      : getFallbackVerdict(report),
    weirdClues: cleanOracleList(value.weirdClues, 4),
  };

  if (
    !reading.fieldNote ||
    !reading.headline ||
    !reading.nextStep ||
    !reading.safetyNote ||
    reading.missingContext.length < 2 ||
    reading.normalExplanations.length < 2 ||
    reading.weirdClues.length < 2 ||
    containsUnsafeCertainty(reading)
  ) {
    return getFallbackOracleReading(report);
  }

  if (!/cannot verify|does not verify|unverified/i.test(reading.safetyNote)) {
    reading.safetyNote = `${reading.safetyNote} OddSkies cannot verify this report.`;
  }

  return reading;
}

function getFallbackVerdict(report: Report): OracleVerdict {
  const mood = report.confidenceMood.toLowerCase();

  if (mood.includes("low") || report.category === "Unknown") {
    return "Needs More Witnesses";
  }

  if (mood.includes("odd") || mood.includes("interesting")) {
    return "Suspiciously Interesting";
  }

  if (report.category === "Strange Lights") {
    return "Sky Is Being Dramatic";
  }

  return "Mildly Odd";
}

function getFallbackScore(report: Report) {
  let score = 42;

  if (report.hasSourceLink || report.sourceUrl) {
    score += 9;
  }

  if (report.hasLocation || report.location) {
    score += 8;
  }

  if (report.hasTime && report.eventDateTime !== "Date not listed") {
    score += 7;
  }

  if (report.category === "Unknown") {
    score -= 10;
  }

  return Math.min(Math.max(score, 18), 78);
}

function getNormalExplanations(report: Report) {
  const category = report.category.toLowerCase();

  if (category.includes("light") || category.includes("ufo")) {
    return [
      "Aircraft, drones, satellites, balloons, or distant lights",
      "Camera exposure, reflection, compression, or edited media",
    ];
  }

  if (category.includes("haunt") || category.includes("paranormal")) {
    return [
      "Old-building sounds, drafts, wildlife, or nearby activity",
      "Memory, suggestion, lighting, or a story gaining extra seasoning",
    ];
  }

  return [
    "Missing context, mistaken identity, or normal activity nearby",
    "A joke, repost, staged clip, edited media, or incomplete source trail",
  ];
}

function getWeirdClues(report: Report) {
  return [
    `${report.category} report filed in ${report.region}`,
    report.sourceUrl ? "A source trail exists for review" : "The source trail is thin",
  ];
}

function getMissingContext(report: Report) {
  const missing = [];

  if (!report.hasLocation && !report.location) {
    missing.push("Precise public location context");
  }

  if (!report.hasTime || report.eventDateTime === "Date not listed") {
    missing.push("Clear event time");
  }

  if (!report.sourceUrl) {
    missing.push("Original public source link");
  }

  if (!report.hasMediaHint) {
    missing.push("Independent media or witness context");
  }

  return missing.length >= 2
    ? missing.slice(0, 4)
    : [...missing, "Independent corroboration"].slice(0, 4);
}

function cleanOracleList(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => cleanOracleText(item, 76))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanOracleText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

function clampScore(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 50;
  }

  return Math.min(Math.max(Math.round(value), 0), 100);
}

function isOracleVerdict(value: unknown): value is OracleVerdict {
  return ORACLE_VERDICTS.some((verdict) => verdict === value);
}

function containsUnsafeCertainty(reading: OracleReading) {
  const text = [
    reading.fieldNote,
    reading.headline,
    reading.nextStep,
    reading.safetyNote,
    reading.verdict,
    ...reading.missingContext,
    ...reading.normalExplanations,
    ...reading.weirdClues,
  ]
    .join(" ")
    .toLowerCase();

  return /confirmed|verified event|proof of|definitely alien|real ghost|100% real|invasion confirmed|portal confirmed/.test(
    text,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
