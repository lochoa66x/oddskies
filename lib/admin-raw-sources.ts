import "server-only";

export const rawSourceStatuses = [
  "new",
  "needs_review",
  "approved",
  "rejected",
  "duplicate",
  "low_context",
  "private_or_sensitive",
  "possible_joke",
  "possible_ai_generated",
] as const;

export type RawSourceStatus = (typeof rawSourceStatuses)[number];

export type RawSourceRow = {
  approved_report_id: string | null;
  author_handle: string | null;
  category_guess: string | null;
  collected_at: string;
  created_at?: string | null;
  event_datetime_guess: string | null;
  id: string;
  language: string | null;
  location_hint: string | null;
  platform: string;
  posted_at: string | null;
  raw_media_url: string | null;
  raw_text: string | null;
  raw_title: string | null;
  rejection_reason: string | null;
  review_notes: string | null;
  search_query: string | null;
  source_post_id: string | null;
  source_url: string | null;
  status: RawSourceStatus;
  updated_at?: string | null;
};

export type ReportDraft = {
  category: string;
  confidence_label: string;
  country: string | null;
  event_datetime: string | null;
  has_media: boolean;
  is_featured: boolean;
  latitude: number | null;
  location_name: string;
  longitude: number | null;
  media_url: string | null;
  region: string;
  reported_datetime: string | null;
  source_name: string;
  source_type: string;
  source_url: string | null;
  summary: string;
  title: string;
  verification_status: string;
};

export type ReportDraftOverrides = Partial<{
  category: string;
  confidence_label: string;
  country: string;
  event_datetime: string;
  latitude: number | null;
  location_name: string;
  longitude: number | null;
  region: string;
  reported_datetime: string;
  source_name: string;
  source_type: string;
  source_url: string;
  summary: string;
  title: string;
}>;

export type RawSourceFilters = Partial<{
  categoryGuess: string;
  limit: number;
  platform: string;
  searchQuery: string;
  status: string;
}>;

export type ReviewStatus = Exclude<RawSourceStatus, "new" | "approved">;

const RAW_SOURCE_SELECT = [
  "id",
  "platform",
  "source_post_id",
  "source_url",
  "author_handle",
  "posted_at",
  "collected_at",
  "raw_title",
  "raw_text",
  "raw_media_url",
  "search_query",
  "language",
  "location_hint",
  "category_guess",
  "event_datetime_guess",
  "status",
  "review_notes",
  "rejection_reason",
  "approved_report_id",
  "created_at",
  "updated_at",
].join(",");

const REPORT_COLUMNS = [
  "title",
  "category",
  "summary",
  "location_name",
  "region",
  "country",
  "latitude",
  "longitude",
  "event_datetime",
  "reported_datetime",
  "source_name",
  "source_type",
  "source_url",
  "media_url",
  "has_media",
  "verification_status",
  "confidence_label",
  "is_featured",
] as const;

const promotableStatuses = new Set<RawSourceStatus>(["new", "needs_review"]);
const reviewStatuses = new Set<ReviewStatus>([
  "needs_review",
  "rejected",
  "duplicate",
  "low_context",
  "private_or_sensitive",
  "possible_joke",
  "possible_ai_generated",
]);
const reasonRequiredStatuses = new Set<ReviewStatus>([
  "rejected",
  "duplicate",
  "low_context",
  "private_or_sensitive",
  "possible_joke",
  "possible_ai_generated",
]);

export async function listRawSources(filters: RawSourceFilters = {}) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/raw_sources", config.supabaseUrl);
  const status = normalizeStatusFilter(filters.status);

  endpoint.searchParams.set("select", RAW_SOURCE_SELECT);
  endpoint.searchParams.set("order", "collected_at.desc");
  endpoint.searchParams.set("limit", String(clampLimit(filters.limit)));

  if (status !== "all") {
    endpoint.searchParams.set("status", `in.(${status})`);
  }

  if (filters.platform) {
    endpoint.searchParams.set("platform", `eq.${filters.platform}`);
  }

  if (filters.categoryGuess) {
    endpoint.searchParams.set("category_guess", `eq.${filters.categoryGuess}`);
  }

  if (filters.searchQuery) {
    endpoint.searchParams.set("search_query", `eq.${filters.searchQuery}`);
  }

  const response = await supabaseFetch(config, endpoint);

  return response.json() as Promise<RawSourceRow[]>;
}

export async function updateRawSourceReview({
  id,
  rejectionReason,
  reviewNotes,
  status,
}: {
  id: string;
  rejectionReason?: string;
  reviewNotes?: string;
  status: string;
}) {
  const normalizedStatus = normalizeReviewStatus(status);

  if (!normalizedStatus || !reviewStatuses.has(normalizedStatus)) {
    throw new Error(`Invalid review status: ${status}`);
  }

  if (reasonRequiredStatuses.has(normalizedStatus) && !readString(rejectionReason)) {
    throw new Error(`A rejection reason is required for ${normalizedStatus}.`);
  }

  const rawSource = await fetchRawSource(id);

  if (!rawSource) {
    throw new Error("Raw source not found.");
  }

  if (rawSource.status === "approved" || rawSource.approved_report_id) {
    throw new Error("Approved raw sources cannot be changed by this helper.");
  }

  const patch: Partial<RawSourceRow> = {
    review_notes: mergeReviewNotes(rawSource.review_notes, status, reviewNotes),
    status: normalizedStatus,
  };

  if (normalizedStatus === "needs_review") {
    patch.rejection_reason = null;
  } else {
    patch.rejection_reason = readString(rejectionReason);
  }

  await patchRawSource(id, patch);

  return {
    id,
    status: normalizedStatus,
  };
}

export async function dryRunRawSourcePromotion(
  id: string,
  overrides: ReportDraftOverrides = {},
) {
  const rawSource = await requireRawSource(id);
  const safetyErrors = getPromotionSafetyErrors(rawSource);

  if (safetyErrors.length > 0) {
    throw new Error(safetyErrors.join(" "));
  }

  const reportDraft = buildReportDraft(rawSource, overrides);

  return {
    rawSource,
    reportDraft,
    warnings: getPromotionWarnings(rawSource, reportDraft),
  };
}

export async function promoteRawSource(
  id: string,
  overrides: ReportDraftOverrides = {},
) {
  const { rawSource, reportDraft, warnings } = await dryRunRawSourcePromotion(
    id,
    overrides,
  );
  const config = getSupabaseAdminConfig();
  const insertedReport = await insertReport(config, reportDraft);
  const reviewNote = `Promoted manually from /admin/raw-sources at ${new Date().toISOString()}.`;

  await patchRawSource(rawSource.id, {
    approved_report_id: insertedReport.id as string,
    review_notes: rawSource.review_notes
      ? `${rawSource.review_notes}\n${reviewNote}`
      : reviewNote,
    status: "approved",
  });

  return {
    reportDraft,
    reportId: insertedReport.id as string,
    rawSourceId: rawSource.id,
    warnings,
  };
}

export function buildReportDraft(
  rawSource: RawSourceRow,
  overrides: ReportDraftOverrides = {},
): ReportDraft {
  const sourceHandle = readString(rawSource.author_handle);
  const rawText = readString(rawSource.raw_text) ?? "";
  const platformName = formatPlatformName(rawSource.platform);
  const draft: ReportDraft = {
    category:
      readString(overrides.category) ??
      readString(rawSource.category_guess) ??
      "Unknown",
    confidence_label:
      readString(overrides.confidence_label) ?? "Needs human review",
    country: readString(overrides.country),
    event_datetime:
      readString(overrides.event_datetime) ??
      readString(rawSource.event_datetime_guess) ??
      readString(rawSource.posted_at) ??
      readString(rawSource.collected_at),
    has_media: Boolean(readString(rawSource.raw_media_url)),
    is_featured: false,
    latitude: overrides.latitude ?? null,
    location_name:
      readString(overrides.location_name) ??
      readString(rawSource.location_hint) ??
      "Location under review",
    longitude: overrides.longitude ?? null,
    media_url: readString(rawSource.raw_media_url),
    region: readString(overrides.region) ?? "Unknown",
    reported_datetime:
      readString(overrides.reported_datetime) ??
      readString(rawSource.posted_at) ??
      readString(rawSource.collected_at),
    source_name:
      readString(overrides.source_name) ??
      (sourceHandle ? `${platformName} / @${sourceHandle}` : platformName),
    source_type:
      readString(overrides.source_type) ?? formatPlatformSourceType(rawSource.platform),
    source_url: readString(overrides.source_url) ?? readString(rawSource.source_url),
    summary:
      readString(overrides.summary) ??
      makeSummary(rawText) ??
      "A public source was staged for OddSkies review.",
    title:
      readString(overrides.title) ??
      readString(rawSource.raw_title) ??
      makeTitle(rawText) ??
      "Untitled strange report",
    verification_status: "Unverified",
  };

  return pickReportColumns(draft);
}

export function getPromotionWarnings(rawSource: RawSourceRow, draft: ReportDraft) {
  const warnings: string[] = [];
  const rawText = readString(rawSource.raw_text) ?? "";

  if (!readString(rawSource.source_url)) {
    warnings.push("Source URL is missing.");
  }

  if (rawText.length < 80) {
    warnings.push("Raw text is short. Context may be thin.");
  }

  if (!readString(draft.location_name) || draft.location_name === "Location under review") {
    warnings.push("Location still needs review.");
  }

  if (!readString(draft.category) || draft.category === "Unknown") {
    warnings.push("Category is unknown.");
  }

  if (!readString(draft.event_datetime)) {
    warnings.push("Event date/time is missing.");
  }

  warnings.push("Promoted reports remain unverified.");

  return warnings;
}

async function requireRawSource(id: string) {
  const rawSource = await fetchRawSource(id);

  if (!rawSource) {
    throw new Error("Raw source not found.");
  }

  return rawSource;
}

async function fetchRawSource(id: string) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/raw_sources", config.supabaseUrl);

  endpoint.searchParams.set("select", RAW_SOURCE_SELECT);
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set("limit", "1");

  const response = await supabaseFetch(config, endpoint);
  const rows = (await response.json()) as RawSourceRow[];

  return rows[0] ?? null;
}

function getPromotionSafetyErrors(rawSource: RawSourceRow) {
  const errors: string[] = [];

  if (rawSource.approved_report_id || rawSource.status === "approved") {
    errors.push("This raw source is already approved.");
  }

  if (!promotableStatuses.has(rawSource.status)) {
    errors.push(`Status "${rawSource.status}" cannot be promoted.`);
  }

  if (!readString(rawSource.raw_text) && !readString(rawSource.raw_title)) {
    errors.push("Raw source has no usable title or text.");
  }

  return errors;
}

async function insertReport(
  config: SupabaseAdminConfig,
  reportDraft: ReportDraft,
) {
  const endpoint = new URL("/rest/v1/reports", config.supabaseUrl);
  const response = await supabaseFetch(config, endpoint, {
    body: JSON.stringify(reportDraft),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });
  const rows = (await response.json()) as Array<{ id?: string }>;

  if (!rows[0]?.id) {
    throw new Error("Report insert did not return a report id.");
  }

  return rows[0];
}

async function patchRawSource(id: string, patch: Partial<RawSourceRow>) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/raw_sources", config.supabaseUrl);

  endpoint.searchParams.set("id", `eq.${id}`);

  await supabaseFetch(config, endpoint, {
    body: JSON.stringify(patch),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "PATCH",
  });
}

type SupabaseAdminConfig = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

function getSupabaseAdminConfig(): SupabaseAdminConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  if (serviceRoleKey.startsWith("sb_publishable_")) {
    throw new Error("Use the server-only Supabase secret key, not a publishable key.");
  }

  return { serviceRoleKey, supabaseUrl };
}

async function supabaseFetch(
  config: SupabaseAdminConfig,
  endpoint: URL,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);

  headers.set("apikey", config.serviceRoleKey);
  headers.set("Authorization", `Bearer ${config.serviceRoleKey}`);

  const response = await fetch(endpoint, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Supabase request failed (${response.status}): ${await readResponseText(response)}`,
    );
  }

  return response;
}

function normalizeStatusFilter(status: string | undefined) {
  if (!status || status === "pending") {
    return "new,needs_review";
  }

  if (status === "all") {
    return "all";
  }

  const allowed = status
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is RawSourceStatus =>
      rawSourceStatuses.includes(item as RawSourceStatus),
    );

  return allowed.length > 0 ? allowed.join(",") : "new,needs_review";
}

function normalizeReviewStatus(status: string) {
  const normalized = status.trim().toLowerCase().replace(/-/g, "_");

  return reviewStatuses.has(normalized as ReviewStatus)
    ? (normalized as ReviewStatus)
    : null;
}

function clampLimit(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(1, Math.min(100, Math.floor(Number(value))));
}

function pickReportColumns(report: ReportDraft) {
  return Object.fromEntries(
    REPORT_COLUMNS.map((column) => [column, report[column]]),
  ) as ReportDraft;
}

function mergeReviewNotes(
  existingNotes: string | null,
  status: string,
  reviewNotes?: string,
) {
  const notes = [readString(reviewNotes)].filter(Boolean);
  notes.push(`Marked ${status} from /admin/raw-sources at ${new Date().toISOString()}.`);

  return [readString(existingNotes), ...notes].filter(Boolean).join("\n");
}

function formatPlatformName(platform: string | null) {
  const value = readString(platform);

  if (!value) {
    return "Public source";
  }

  if (value.toLowerCase() === "bluesky") {
    return "Bluesky";
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatPlatformSourceType(platform: string | null) {
  const platformName = formatPlatformName(platform);

  return platformName === "Public source"
    ? "Public source"
    : `${platformName} post`;
}

function makeSummary(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();

  if (!compact) {
    return null;
  }

  if (compact.length <= 260) {
    return compact;
  }

  return `${compact.slice(0, 257).trim()}...`;
}

function makeTitle(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();

  if (!compact) {
    return null;
  }

  if (compact.length <= 72) {
    return compact;
  }

  return `${compact.slice(0, 69).trim()}...`;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function readResponseText(response: Response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}
