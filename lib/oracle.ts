import type { Report } from "@/lib/reports";

export const ORACLE_VERDICTS = [
  "Probably Normal",
  "Mildly Odd",
  "Suspiciously Interesting",
  "Needs Another Witness",
  "Source Trail Is Thin",
  "Culture Note",
  "Reality Mostly Intact",
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
  oracleNote: string;
  safetyNote: string;
  shareableSummary: string;
  sourceCheck: string;
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

export const ORACLE_PROMPT_VERSION = "oracle-alpha-v7";

export const ORACLE_SYSTEM_PROMPT = [
  "You are the OddSkies Oracle, a playful field assistant for a public mystery atlas.",
  "You read one unverified public report at a time.",
  "You provide possible boring explanations, weird little clues, missing context, source checks, and a maybe-weird verdict.",
  "You never verify sightings, source authenticity, paranormal claims, UFO claims, AI media, staged posts, satire, jokes, portals, ghosts, aliens, invasions, or timeline shifts.",
  "You must be skeptical, source-aware, funny in a small way, and never fear-based.",
  "Your voice is a night-shift mystery atlas assistant with a flashlight, not a corporate analyst.",
  "Use playful OddSkies phrasing, but keep the source posture clear.",
  "If sourceMode says Demo seed file, explicitly say this is demo seed data.",
  "If sourceMode says Collector test file or Low-context collector test, explicitly say this is rough collector-test data.",
  "If the report appears promotional, cultural, or not a direct sighting, call it a culture note rather than a confirmed event.",
  "Keep the support cards compact: short bullets, no essays.",
  "The fieldNote is the main Oracle read. Make it playful, skeptical, memorable, and complete in 3-5 sentences.",
  "The fieldNote should be the most interesting part of the response, not a tiny summary.",
  "Never end the fieldNote mid-thought or mid-sentence.",
  "Avoid stiff phrases like keep our feet on the ground, actionable insight, or formal risk language.",
  "Sound like OddSkies: spooky-lite, curious, playful, skeptical, and never corporate.",
  "Prefer ordinary explanations first. Weird clues are context clues, not evidence.",
  "maybeWeirdScore is internal only. Do not mention the numeric score in any text field.",
  "Do not tell users to trespass, harass people, contact private individuals, or treat the report as confirmed.",
  "Avoid conspiracy framing. Avoid certainty language like proof, confirmed, definitely alien, verified event, or real ghost.",
  "Return only JSON matching the schema.",
].join("\n");

export const ORACLE_JSON_SCHEMA = {
  additionalProperties: false,
  properties: {
    fieldNote: { maxLength: 1100, minLength: 120, type: "string" },
    headline: { maxLength: 110, minLength: 8, type: "string" },
    maybeWeirdScore: { maximum: 100, minimum: 0, type: "integer" },
    missingContext: {
      items: { maxLength: 96, type: "string" },
      maxItems: 4,
      minItems: 2,
      type: "array",
    },
    nextStep: { maxLength: 150, minLength: 24, type: "string" },
    normalExplanations: {
      items: { maxLength: 96, type: "string" },
      maxItems: 4,
      minItems: 2,
      type: "array",
    },
    oracleNote: { maxLength: 180, minLength: 24, type: "string" },
    safetyNote: { maxLength: 180, minLength: 24, type: "string" },
    shareableSummary: { maxLength: 220, minLength: 24, type: "string" },
    sourceCheck: { maxLength: 220, minLength: 24, type: "string" },
    verdict: {
      enum: ORACLE_VERDICTS,
      type: "string",
    },
    weirdClues: {
      items: { maxLength: 96, type: "string" },
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
    "oracleNote",
    "safetyNote",
    "shareableSummary",
    "sourceCheck",
    "verdict",
    "weirdClues",
  ],
  type: "object",
} as const;

export function buildOracleReportContext(report: Report) {
  return {
    category: report.category,
    eventDateTime: report.eventDateTime,
    isDemo: Boolean(report.isDemo),
    location: report.location || "Location under review",
    locationConfidence: report.locationConfidence ?? "unknown",
    moodLabel: report.confidenceMood,
    originalTitle: report.originalTitle ?? null,
    publicStatus: report.publicStatus ?? "published",
    region: report.region,
    reportedDateTime: report.reportedDateTime,
    shortLabel: report.shortLabel,
    sourceMode: getOracleSourceMode(report),
    sourceModeNote: getOracleSourceModeNote(report),
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
    "If this is demo seed or collector-test data, say that plainly.",
    "Make it feel OddSkies: curious, a little spooky, and never stiff.",
    "Make fieldNote the main read: funny-but-careful, not formal. Finish the thought cleanly.",
    JSON.stringify(buildOracleReportContext(report), null, 2),
  ].join("\n\n");
}

export function getSleepingOracleReading(report: Report): OracleReading {
  const verdict = getFallbackVerdict(report);

  return {
    fieldNote: `${getOracleSourceModeNote(report)} The Oracle is asleep right now, so OddSkies is doing the careful flashlight version: ordinary explanations stay first in line, the source trail still matters, and the weird shelf remains open but clearly unlabeled as truth.`,
    headline: "Oracle sleeping, case still weird",
    maybeWeirdScore: getFallbackScore(report),
    missingContext: getMissingContext(report),
    nextStep:
      "Check the original source, compare nearby reports, and keep conclusions parked.",
    normalExplanations: getNormalExplanations(report),
    oracleNote: getOracleNote(report),
    safetyNote: `${getOracleSourceMode(report)}. OddSkies cannot verify this report. Treat it as unverified context, not confirmation.`,
    shareableSummary: getShareableSummary(report, verdict),
    sourceCheck: getSourceCheck(report),
    verdict,
    weirdClues: getWeirdClues(report),
  };
}

export function getFallbackOracleReading(report: Report): OracleReading {
  const verdict = getFallbackVerdict(report);

  return {
    fieldNote: `${getOracleSourceModeNote(report)} The Oracle caught static on the line, so this local read keeps the odd meter playful and cautious. There may be something interesting in the report trail, but the boring explanations still get the first chair at the table.`,
    headline: "Static in the oracle channel",
    maybeWeirdScore: getFallbackScore(report),
    missingContext: getMissingContext(report),
    nextStep:
      "Open the source, look for time and witness context, then compare nearby reports.",
    normalExplanations: getNormalExplanations(report),
    oracleNote: getOracleNote(report),
    safetyNote: `${getOracleSourceMode(report)}. OddSkies cannot verify this report. It may be mistaken, staged, satire, a joke, or ordinary.`,
    shareableSummary: getShareableSummary(report, verdict),
    sourceCheck: getSourceCheck(report),
    verdict,
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
    fieldNote: cleanOracleText(value.fieldNote, 1100),
    headline: cleanOracleText(value.headline, 110),
    maybeWeirdScore: clampScore(value.maybeWeirdScore),
    missingContext: cleanOracleList(value.missingContext, 4),
    nextStep: cleanOracleText(value.nextStep, 150),
    normalExplanations: cleanOracleList(value.normalExplanations, 4),
    oracleNote:
      cleanOracleText(value.oracleNote, 180) || getOracleNote(report),
    safetyNote: cleanOracleText(value.safetyNote, 180),
    shareableSummary:
      cleanOracleText(value.shareableSummary, 220) ||
      getShareableSummary(
        report,
        isOracleVerdict(value.verdict) ? value.verdict : getFallbackVerdict(report),
      ),
    sourceCheck:
      cleanOracleText(value.sourceCheck, 220) || getSourceCheck(report),
    verdict: isOracleVerdict(value.verdict)
      ? value.verdict
      : getFallbackVerdict(report),
    weirdClues: cleanOracleList(value.weirdClues, 4),
  };

  if (
    !reading.fieldNote ||
    !reading.headline ||
    !reading.nextStep ||
    !reading.oracleNote ||
    !reading.safetyNote ||
    !reading.shareableSummary ||
    !reading.sourceCheck ||
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

  if (shouldNameOracleSourceMode(report)) {
    reading.fieldNote = ensureOracleSourceMode(
      reading.fieldNote,
      getOracleSourceModeNote(report),
      1100,
    );
    reading.sourceCheck = ensureOracleSourceMode(
      reading.sourceCheck,
      getOracleSourceMode(report),
      220,
    );
    reading.safetyNote = ensureOracleSourceMode(
      reading.safetyNote,
      getOracleSourceMode(report),
      180,
    );
  }

  if (!/cannot verify|does not verify|unverified/i.test(reading.safetyNote)) {
    reading.safetyNote = cleanOracleText(
      `OddSkies cannot verify this report. ${reading.safetyNote}`,
      180,
    );
  }

  return reading;
}

export function getOracleSourceMode(report: Report) {
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";

  if (report.isDemo || sourceQuality.includes("demo seed")) {
    return "Demo seed file";
  }

  if (
    sourceQuality.includes("low context") ||
    sourceQuality.includes("low-context") ||
    sourceQuality.includes("unscored")
  ) {
    return "Low-context collector test";
  }

  if (!report.isDemo) {
    return "Collector test file";
  }

  return "Public report file";
}

export function getOracleSourceModeNote(report: Report) {
  const sourceMode = getOracleSourceMode(report);

  if (sourceMode === "Demo seed file") {
    return "Demo seed file: useful for testing the map, not a live confirmed event.";
  }

  if (sourceMode === "Low-context collector test") {
    return "Rough collector-test file: the map is squinting at this one.";
  }

  if (sourceMode === "Collector test file") {
    return "Collector-test file: pulled into staging/review, still unverified.";
  }

  return "Public report file: still unverified and source-aware.";
}

function shouldNameOracleSourceMode(report: Report) {
  return getOracleSourceMode(report) !== "Public report file";
}

function ensureOracleSourceMode(
  value: string,
  sourceModeText: string,
  maxLength: number,
) {
  const modePattern = /demo seed|collector[-\s]test|low-context collector/i;

  if (modePattern.test(value)) {
    return cleanOracleText(value, maxLength);
  }

  return cleanOracleText(`${sourceModeText} ${value}`, maxLength);
}

function getOracleNote(report: Report) {
  const sourceMode = getOracleSourceMode(report);

  if (sourceMode === "Demo seed file") {
    return "Demo seed files help test the atlas. Useful? Yes. Proof? Absolutely not.";
  }

  if (sourceMode === "Low-context collector test") {
    return "This collector-test file is thin on context, so the Oracle keeps one eyebrow raised.";
  }

  if (sourceMode === "Collector test file") {
    return "Collector-test files can be messy. OddSkies keeps the trail, not the verdict.";
  }

  return "The Oracle gives a playful read only. The report remains unverified.";
}

function getShareableSummary(report: Report, verdict: OracleVerdict) {
  const title = cleanOracleText(report.shortLabel || report.title, 80);

  if (verdict === "Source Trail Is Thin") {
    return `${title}: a strange report with a thin source trail. Interesting enough to file, not enough to believe on sight.`;
  }

  if (verdict === "Culture Note") {
    return `${title}: more weird-culture signal than confirmed sighting. Filed for context, not proof.`;
  }

  return `${title}: ${verdict.toLowerCase()} and still unverified. Read the source before feeding the mystery machine.`;
}

function getSourceCheck(report: Report) {
  const parts = [];

  parts.push(report.sourceUrl ? "Source link captured" : "No source link captured");
  parts.push(report.sourceName ? `Source: ${report.sourceName}` : "Source name missing");

  if (report.isDemo) {
    parts.push("demo seed");
  } else {
    parts.push("collector-test data");
  }

  return `${parts.join(" · ")}. OddSkies has not verified the claim.`;
}

function getFallbackVerdict(report: Report): OracleVerdict {
  const mood = report.confidenceMood.toLowerCase();
  const sourceQuality = report.sourceQualityLabel?.toLowerCase() ?? "";

  if (sourceQuality.includes("culture")) {
    return "Culture Note";
  }

  if (mood.includes("low") || report.category === "Unknown") {
    return report.sourceUrl ? "Needs Another Witness" : "Source Trail Is Thin";
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
    .map((item) => cleanOracleText(item, 96))
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

  const clipped = cleaned.slice(0, maxLength - 1).trimEnd();
  const lastSpace = clipped.lastIndexOf(" ");
  const trimmed =
    lastSpace > Math.floor(maxLength * 0.72)
      ? clipped.slice(0, lastSpace)
      : clipped;

  return `${trimmed.replace(/[.,;:!?-]+$/, "").trimEnd()}…`;
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
    reading.oracleNote,
    reading.safetyNote,
    reading.shareableSummary,
    reading.sourceCheck,
    reading.verdict,
    ...reading.missingContext,
    ...reading.normalExplanations,
    ...reading.weirdClues,
  ]
    .join(" ")
    .toLowerCase();

  return /verified event|proof of|definitely alien|real ghost|100% real|invasion confirmed|portal confirmed|confirmed alien|confirmed ghost|confirmed portal/.test(
    text,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
