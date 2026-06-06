import "server-only";

import { scoreRawSource } from "@/lib/curation/scoreRawSource";
import type { RawSourceCurationScore } from "@/lib/curation/scoreRawSource";
import { normalizeLocation } from "@/lib/location/normalizeLocation";
import type { LocationNormalization } from "@/lib/location/normalizeLocation";
import {
  createAdminCuratedLink,
  type CuratedLinkInput,
} from "@/lib/admin-curated-links";
import {
  enrichReportDraft,
  pickReportEnrichmentColumns,
} from "@/lib/reports/enrichReport";

export const rawSourceStatuses = [
  "new",
  "needs_review",
  "approved",
  "converted_to_signal_shelf",
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
  curation_label: string | null;
  curation_reasons: string[] | null;
  curation_score: number | null;
  curated_link_id: string | null;
  event_datetime_guess: string | null;
  extracted_country_guess: string | null;
  extracted_event_datetime_text: string | null;
  extracted_location_text: string | null;
  extracted_region_guess: string | null;
  has_location_hint: boolean | null;
  has_media_hint: boolean | null;
  has_time_hint: boolean | null;
  id: string;
  language: string | null;
  last_scored_at: string | null;
  last_location_normalized_at: string | null;
  location_hint: string | null;
  location_confidence: string | null;
  location_resolution: string | null;
  location_warnings: string[] | null;
  normalized_country: string | null;
  normalized_latitude: number | null;
  normalized_location_name: string | null;
  normalized_longitude: number | null;
  normalized_region: string | null;
  normalized_summary: string | null;
  normalized_title: string | null;
  platform: string;
  possible_ai_generated: boolean | null;
  possible_duplicate: boolean | null;
  possible_joke: boolean | null;
  possible_private_location: boolean | null;
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
  display_summary: string;
  display_title: string;
  enrichment_notes: string[];
  event_datetime: string | null;
  has_location: boolean;
  has_media_hint: boolean;
  has_media: boolean;
  has_source_link: boolean;
  has_time: boolean;
  is_featured: boolean;
  latitude: number | null;
  last_enriched_at: string;
  location_confidence: string | null;
  location_name: string;
  location_resolution: string | null;
  location_warnings: string[];
  longitude: number | null;
  media_url: string | null;
  mood_label: string;
  oracle_prompt_seed: string | null;
  oracle_ready: boolean;
  region: string;
  reported_datetime: string | null;
  short_label: string;
  source_name: string;
  source_quality_label: string;
  source_quality_reasons: string[];
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

export type CuratedLinkDraft = {
  category: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  linkType: string;
  notes: string;
  region: string;
  safetyLabel: string;
  sortOrder: number;
  sourceName: string;
  tags: string[];
  title: string;
  url: string;
  warnings: string[];
};

export type CuratedLinkDraftOverrides = Partial<{
  category: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  linkType: string;
  notes: string;
  region: string;
  safetyLabel: string;
  sortOrder: number;
  sourceName: string;
  tags: string[] | string;
  title: string;
  url: string;
}>;

export type CollectorExclusionMatchType =
  | "author_handle"
  | "domain"
  | "search_query"
  | "source_post_id"
  | "source_url"
  | "text_contains";

export type CollectorExclusionRow = {
  created_at: string;
  id: string;
  is_active: boolean;
  match_type: CollectorExclusionMatchType;
  match_value: string;
  platform: string;
  reason: string;
  source_raw_source_id: string | null;
  updated_at: string;
};

export type CollectorExclusionInput = {
  isActive?: boolean;
  matchType: CollectorExclusionMatchType;
  matchValue: string;
  platform: string;
  reason: string;
  sourceRawSourceId?: string | null;
};

export type RawSourceFilters = Partial<{
  categoryGuess: string;
  curationLabel: string;
  hasNormalizedLocation: string;
  hasLocationHint: string;
  limit: number;
  locationConfidence: string;
  locationResolution: string;
  platform: string;
  possibleAiGenerated: string;
  possibleJoke: string;
  possiblePrivateLocation: string;
  searchQuery: string;
  sort: string;
  status: string;
}>;

export type ReviewStatus = Exclude<RawSourceStatus, "new" | "approved">;

const RAW_SOURCE_SELECT = "*";
const COLLECTOR_EXCLUSION_SELECT =
  "id,platform,match_type,match_value,reason,source_raw_source_id,is_active,created_at,updated_at";

const REPORT_COLUMNS = [
  "title",
  "category",
  "summary",
  "location_name",
  "region",
  "country",
  "latitude",
  "longitude",
  "location_confidence",
  "location_resolution",
  "location_warnings",
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
  endpoint.searchParams.set("order", normalizeSort(filters.sort));
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

  if (filters.curationLabel) {
    endpoint.searchParams.set("curation_label", `eq.${filters.curationLabel}`);
  }

  if (filters.locationConfidence) {
    endpoint.searchParams.set(
      "location_confidence",
      `eq.${filters.locationConfidence}`,
    );
  }

  if (filters.locationResolution) {
    endpoint.searchParams.set(
      "location_resolution",
      `eq.${filters.locationResolution}`,
    );
  }

  if (filters.hasNormalizedLocation === "true") {
    endpoint.searchParams.set("normalized_location_name", "not.is.null");
  } else if (filters.hasNormalizedLocation === "false") {
    endpoint.searchParams.set("normalized_location_name", "is.null");
  }

  setOptionalBooleanFilter(endpoint, "has_location_hint", filters.hasLocationHint);
  setOptionalBooleanFilter(
    endpoint,
    "possible_private_location",
    filters.possiblePrivateLocation,
  );
  setOptionalBooleanFilter(endpoint, "possible_joke", filters.possibleJoke);
  setOptionalBooleanFilter(
    endpoint,
    "possible_ai_generated",
    filters.possibleAiGenerated,
  );

  if (filters.searchQuery) {
    endpoint.searchParams.set("search_query", `eq.${filters.searchQuery}`);
  }

  const response = await supabaseFetch(config, endpoint);

  return response.json() as Promise<RawSourceRow[]>;
}

export async function scoreRawSourceById(id: string) {
  const rawSource = await requireRawSource(id);
  const possibleDuplicate = await hasPossibleDuplicate(rawSource);
  const score = await scoreRawSource(rawSource, { possibleDuplicate });

  await patchRawSource(id, pickCurationColumns(score));

  return {
    id,
    score,
  };
}

export async function normalizeRawSourceLocationById(id: string) {
  const rawSource = await requireRawSource(id);
  const location = await normalizeLocation(rawSource);

  await patchRawSource(id, pickLocationColumns(location));

  return {
    id,
    location,
  };
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

export async function dryRunRawSourceSignalShelfConversion(
  id: string,
  overrides: CuratedLinkDraftOverrides = {},
) {
  const rawSource = await requireRawSource(id);
  const warnings = getSignalShelfConversionWarnings(rawSource);

  if (rawSource.status === "approved" || rawSource.approved_report_id) {
    throw new Error("Approved raw sources cannot be converted to Signal Shelf.");
  }

  if (rawSource.status === "converted_to_signal_shelf" || rawSource.curated_link_id) {
    throw new Error("This raw source has already been converted to Signal Shelf.");
  }

  const draft = buildCuratedLinkDraft(rawSource, overrides);

  return {
    rawSource,
    curatedLinkDraft: {
      ...draft,
      warnings,
    },
  };
}

export async function convertRawSourceToSignalShelf(
  id: string,
  overrides: CuratedLinkDraftOverrides = {},
) {
  const { rawSource, curatedLinkDraft } =
    await dryRunRawSourceSignalShelfConversion(id, overrides);
  const createdLink = await createAdminCuratedLink(
    curatedDraftToInput(curatedLinkDraft),
  );
  const reviewNote = `Converted manually to Signal Shelf at ${new Date().toISOString()}. No public report was created.`;

  await patchRawSource(rawSource.id, {
    curated_link_id: createdLink.id,
    rejection_reason:
      rawSource.rejection_reason ?? "Converted to Signal Shelf; not a Field Log report.",
    review_notes: rawSource.review_notes
      ? `${rawSource.review_notes}\n${reviewNote}`
      : reviewNote,
    status: "converted_to_signal_shelf",
  });

  return {
    curatedLink: createdLink,
    rawSourceId: rawSource.id,
    warnings: curatedLinkDraft.warnings,
  };
}

export function buildCuratedLinkDraft(
  rawSource: RawSourceRow,
  overrides: CuratedLinkDraftOverrides = {},
): CuratedLinkDraft {
  const rawText = readString(rawSource.raw_text) ?? "";
  const sourceUrl =
    readString(overrides.url) ??
    readString(rawSource.source_url) ??
    readString(rawSource.raw_media_url);
  const linkType = readString(overrides.linkType) ?? guessCuratedLinkType(sourceUrl, rawText);
  const title =
    readString(overrides.title) ??
    readString(rawSource.normalized_title) ??
    readString(rawSource.raw_title) ??
    makeTitle(rawText) ??
    "Untitled signal";
  const description =
    readString(overrides.description) ??
    readString(rawSource.normalized_summary) ??
    makeSummary(rawText) ??
    "A public source trail was kept for Signal Shelf context.";
  const sourceName =
    readString(overrides.sourceName) ??
    readString(rawSource.author_handle) ??
    formatPlatformName(rawSource.platform);
  const category =
    readString(overrides.category) ??
    readString(rawSource.category_guess) ??
    "Unsorted";
  const region =
    readString(overrides.region) ??
    readString(rawSource.normalized_region) ??
    readString(rawSource.extracted_region_guess) ??
    "Global";
  const tags = normalizeCuratedTags(
    overrides.tags ?? [
      rawSource.platform,
      category,
      linkType,
      "from-raw-source",
    ],
  );

  if (!sourceUrl) {
    throw new Error("A source URL or media URL is required for Signal Shelf conversion.");
  }

  return {
    category,
    description: description.slice(0, 320),
    isActive: overrides.isActive ?? true,
    isFeatured: overrides.isFeatured ?? false,
    linkType,
    notes:
      readString(overrides.notes) ??
      "Converted from internal raw source review. Not verification.",
    region,
    safetyLabel:
      readString(overrides.safetyLabel) ??
      guessCuratedSafetyLabel(linkType, sourceUrl, rawText),
    sortOrder: readOverrideNumber(overrides.sortOrder) ?? 100,
    sourceName,
    tags,
    title,
    url: sourceUrl,
    warnings: [],
  };
}

export async function listCollectorExclusions() {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/collector_exclusions", config.supabaseUrl);

  endpoint.searchParams.set("select", COLLECTOR_EXCLUSION_SELECT);
  endpoint.searchParams.set("order", "is_active.desc,created_at.desc");
  endpoint.searchParams.set("limit", "100");

  const response = await supabaseFetch(config, endpoint);

  return response.json() as Promise<CollectorExclusionRow[]>;
}

export async function createCollectorExclusion(input: CollectorExclusionInput) {
  const config = getSupabaseAdminConfig();
  const payload = normalizeCollectorExclusionInput(input);
  const endpoint = new URL("/rest/v1/collector_exclusions", config.supabaseUrl);
  const headers = new Headers({
    "Content-Type": "application/json",
    Prefer: "return=representation",
  });

  headers.set("apikey", config.serviceRoleKey);
  headers.set("Authorization", `Bearer ${config.serviceRoleKey}`);

  const response = await fetch(endpoint, {
    body: JSON.stringify(payload),
    headers,
    method: "POST",
  });

  if (response.status === 409) {
    return fetchCollectorExclusionByMatch(
      config,
      payload.platform,
      payload.match_type,
      payload.match_value,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Supabase request failed (${response.status}): ${await readResponseText(response)}`,
    );
  }

  const rows = (await response.json()) as CollectorExclusionRow[];

  return rows[0];
}

export async function updateCollectorExclusion(
  id: string,
  input: Partial<CollectorExclusionInput>,
) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/collector_exclusions", config.supabaseUrl);
  const patch: Record<string, unknown> = {};

  if (typeof input.isActive === "boolean") {
    patch.is_active = input.isActive;
  }

  if (input.reason !== undefined) {
    const reason = readString(input.reason);

    if (!reason) {
      throw new Error("Exclusion reason is required.");
    }

    patch.reason = reason;
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No collector exclusion fields were provided.");
  }

  endpoint.searchParams.set("id", `eq.${id}`);

  const response = await supabaseFetch(config, endpoint, {
    body: JSON.stringify(patch),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "PATCH",
  });
  const rows = (await response.json()) as CollectorExclusionRow[];

  if (!rows[0]) {
    throw new Error("Collector exclusion not found.");
  }

  return rows[0];
}

async function fetchCollectorExclusionByMatch(
  config: SupabaseAdminConfig,
  platform: string,
  matchType: string,
  matchValue: string,
) {
  const endpoint = new URL("/rest/v1/collector_exclusions", config.supabaseUrl);

  endpoint.searchParams.set("select", COLLECTOR_EXCLUSION_SELECT);
  endpoint.searchParams.set("platform", `eq.${platform}`);
  endpoint.searchParams.set("match_type", `eq.${matchType}`);
  endpoint.searchParams.set("match_value", `eq.${matchValue}`);
  endpoint.searchParams.set("limit", "1");

  const response = await supabaseFetch(config, endpoint);
  const rows = (await response.json()) as CollectorExclusionRow[];

  if (!rows[0]) {
    throw new Error("Collector exclusion already exists.");
  }

  return rows[0];
}

export function buildReportDraft(
  rawSource: RawSourceRow,
  overrides: ReportDraftOverrides = {},
): ReportDraft {
  const sourceHandle = readString(rawSource.author_handle);
  const rawText = readString(rawSource.raw_text) ?? "";
  const platformName = formatPlatformName(rawSource.platform);
  const draft = {
    category:
      readString(overrides.category) ??
      readString(rawSource.category_guess) ??
      "Unknown",
    confidence_label:
      readString(overrides.confidence_label) ?? "Needs human review",
    country:
      readString(overrides.country) ??
      readString(rawSource.normalized_country) ??
      readString(rawSource.extracted_country_guess),
    event_datetime:
      readString(overrides.event_datetime) ??
      readString(rawSource.event_datetime_guess) ??
      readString(rawSource.posted_at) ??
      readString(rawSource.collected_at),
    has_media: Boolean(readString(rawSource.raw_media_url)),
    is_featured: false,
    latitude: overrides.latitude ?? readNumber(rawSource.normalized_latitude),
    location_confidence: readString(rawSource.location_confidence),
    location_name:
      readString(overrides.location_name) ??
      readString(rawSource.normalized_location_name) ??
      readString(rawSource.extracted_location_text) ??
      readString(rawSource.location_hint) ??
      "Location under review",
    location_resolution: readString(rawSource.location_resolution),
    location_warnings: rawSource.location_warnings ?? [],
    longitude: overrides.longitude ?? readNumber(rawSource.normalized_longitude),
    media_url: readString(rawSource.raw_media_url),
    region:
      readString(overrides.region) ??
      readString(rawSource.normalized_region) ??
      readString(rawSource.extracted_region_guess) ??
      "Unknown",
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
      readString(rawSource.normalized_summary) ??
      makeSummary(rawText) ??
      "A public source was staged for OddSkies review.",
    title:
      readString(overrides.title) ??
      readString(rawSource.normalized_title) ??
      readString(rawSource.raw_title) ??
      makeTitle(rawText) ??
      "Untitled strange report",
    verification_status: "Unverified",
  };
  const enrichment = enrichReportDraft(draft as Record<string, unknown>);

  return pickReportColumns({
    ...draft,
    ...pickReportEnrichmentColumns(enrichment),
  });
}

export function getPromotionWarnings(rawSource: RawSourceRow, draft: ReportDraft) {
  const warnings: string[] = [];
  const rawText = readString(rawSource.raw_text) ?? "";

  if (!readString(rawSource.source_url)) {
    warnings.push("Source URL is missing.");
  }

  if (rawSource.curation_label === "Low context") {
    warnings.push("Curation label is Low context. Review carefully before publishing.");
  }

  if (rawSource.possible_joke) {
    warnings.push("Possible joke/meme language was flagged.");
  }

  if (rawSource.possible_ai_generated) {
    warnings.push("Possible AI-generated or edited media language was flagged.");
  }

  if (rawSource.possible_duplicate) {
    warnings.push("Possible duplicate source was flagged.");
  }

  if (rawText.length < 80) {
    warnings.push("Raw text is short. Context may be thin.");
  }

  if (
    !rawSource.has_location_hint &&
    (!readString(draft.location_name) || draft.location_name === "Location under review")
  ) {
    warnings.push("Location still needs review.");
  }

  if (
    rawSource.location_confidence === "none" ||
    rawSource.location_confidence === "low"
  ) {
    warnings.push("Normalized location confidence is low or missing.");
  }

  if (rawSource.location_resolution === "private_or_sensitive") {
    warnings.push("Location normalization flagged private/sensitive details.");
  }

  if (rawSource.location_warnings?.length) {
    warnings.push(`Location warnings: ${rawSource.location_warnings.join(", ")}.`);
  }

  if (!readString(draft.category) || draft.category === "Unknown") {
    warnings.push("Category is unknown.");
  }

  if (!rawSource.has_time_hint && !readString(draft.event_datetime)) {
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

  if (rawSource.possible_private_location) {
    errors.push(
      "This raw source has a private/sensitive location warning and cannot be promoted by default.",
    );
  }

  if (
    rawSource.location_resolution === "private_or_sensitive" ||
    rawSource.location_warnings?.includes("possible_private_location")
  ) {
    errors.push(
      "Location normalization found private/sensitive details. Keep this out of public reports unless it is redacted and reviewed.",
    );
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

async function hasPossibleDuplicate(rawSource: RawSourceRow) {
  const sourcePostId = readString(rawSource.source_post_id);
  const sourceUrl = readString(rawSource.source_url);

  if (sourcePostId && (await rawSourceDuplicateExists(rawSource, "source_post_id", sourcePostId))) {
    return true;
  }

  if (sourceUrl && (await rawSourceDuplicateExists(rawSource, "source_url", sourceUrl))) {
    return true;
  }

  return false;
}

async function rawSourceDuplicateExists(
  rawSource: RawSourceRow,
  column: "source_post_id" | "source_url",
  value: string,
) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/raw_sources", config.supabaseUrl);

  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("id", `neq.${rawSource.id}`);
  endpoint.searchParams.set("platform", `eq.${rawSource.platform}`);
  endpoint.searchParams.set(column, `eq.${value}`);
  endpoint.searchParams.set("limit", "1");

  const response = await supabaseFetch(config, endpoint);
  const rows = (await response.json()) as Array<{ id: string }>;

  return rows.length > 0;
}

function pickCurationColumns(score: RawSourceCurationScore): Partial<RawSourceRow> {
  return {
    curation_label: score.curation_label,
    curation_reasons: score.curation_reasons,
    curation_score: score.curation_score,
    extracted_country_guess: score.extracted_country_guess,
    extracted_event_datetime_text: score.extracted_event_datetime_text,
    extracted_location_text: score.extracted_location_text,
    extracted_region_guess: score.extracted_region_guess,
    has_location_hint: score.has_location_hint,
    has_media_hint: score.has_media_hint,
    has_time_hint: score.has_time_hint,
    last_scored_at: score.last_scored_at,
    normalized_summary: score.normalized_summary,
    normalized_title: score.normalized_title,
    possible_ai_generated: score.possible_ai_generated,
    possible_duplicate: score.possible_duplicate,
    possible_joke: score.possible_joke,
    possible_private_location: score.possible_private_location,
  };
}

function pickLocationColumns(
  location: LocationNormalization,
): Partial<RawSourceRow> {
  return {
    last_location_normalized_at: location.last_location_normalized_at,
    location_confidence: location.location_confidence,
    location_resolution: location.location_resolution,
    location_warnings: location.location_warnings,
    normalized_country: location.normalized_country,
    normalized_latitude: location.normalized_latitude,
    normalized_location_name: location.normalized_location_name,
    normalized_longitude: location.normalized_longitude,
    normalized_region: location.normalized_region,
  };
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

function normalizeSort(sort: string | undefined) {
  if (sort === "score_desc") {
    return "curation_score.desc.nullslast,collected_at.desc";
  }

  if (sort === "score_asc") {
    return "curation_score.asc.nullslast,collected_at.desc";
  }

  return "collected_at.desc";
}

function setOptionalBooleanFilter(
  endpoint: URL,
  column: string,
  value: string | undefined,
) {
  if (value === "true" || value === "false") {
    endpoint.searchParams.set(column, `eq.${value}`);
  }
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

function pickReportColumns(report: Record<string, unknown>) {
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

function curatedDraftToInput(draft: CuratedLinkDraft): CuratedLinkInput {
  return {
    category: draft.category,
    description: draft.description,
    isActive: draft.isActive,
    isFeatured: draft.isFeatured,
    linkType: draft.linkType,
    notes: draft.notes,
    region: draft.region,
    safetyLabel: draft.safetyLabel,
    sortOrder: draft.sortOrder,
    sourceName: draft.sourceName,
    tags: draft.tags,
    title: draft.title,
    url: draft.url,
  };
}

function getSignalShelfConversionWarnings(rawSource: RawSourceRow) {
  const warnings: string[] = [];

  if (!readString(rawSource.source_url) && !readString(rawSource.raw_media_url)) {
    warnings.push("No source URL was captured. Conversion needs a public URL.");
  }

  if (rawSource.possible_private_location) {
    warnings.push("Private/sensitive warning exists. Confirm the link is safe before making it public.");
  }

  if (rawSource.possible_duplicate) {
    warnings.push("Possible duplicate source flagged.");
  }

  if (rawSource.possible_ai_generated) {
    warnings.push("Possible AI-generated or edited media language flagged.");
  }

  warnings.push("Signal Shelf links are browsing aids, not verification.");

  return warnings;
}

function guessCuratedLinkType(url: string | null, text: string) {
  const normalizedUrl = (url ?? "").toLowerCase();
  const normalizedText = text.toLowerCase();

  if (/\b(youtube\.com|youtu\.be|vimeo\.com)\b/.test(normalizedUrl)) {
    return "video";
  }

  if (/\b(nasa\.gov|noaa\.gov|cern\.ch|esa\.int|faa\.gov|weather\.gov)\b/.test(normalizedUrl)) {
    return "official_source";
  }

  if (/\b(debunk|explainer|explanation|misidentified|hoax)\b/.test(normalizedText)) {
    return "debunk_or_explanation";
  }

  if (/\b(bsky\.app|threads\.net|x\.com|twitter\.com)\b/.test(normalizedUrl)) {
    return "rabbit_hole";
  }

  return "external_reference";
}

function guessCuratedSafetyLabel(
  linkType: string,
  url: string | null,
  text: string,
) {
  const normalizedUrl = (url ?? "").toLowerCase();
  const normalizedText = text.toLowerCase();

  if (
    linkType === "official_source" ||
    /\b(nasa\.gov|noaa\.gov|cern\.ch|esa\.int|faa\.gov|weather\.gov)\b/.test(
      normalizedUrl,
    )
  ) {
    return "official_source";
  }

  if (
    linkType === "debunk_or_explanation" ||
    /\b(debunk|explainer|explanation|misidentified|hoax)\b/.test(normalizedText)
  ) {
    return "debunk_or_explanation";
  }

  return "unverified_resource";
}

function normalizeCuratedTags(value: string[] | string) {
  const values = Array.isArray(value) ? value : value.split(",");

  return Array.from(
    new Set(
      values
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
        .map((item) => item.replace(/\s+/g, "-")),
    ),
  );
}

function readOverrideNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? Math.trunc(number) : null;
}

function normalizeCollectorExclusionInput(input: CollectorExclusionInput) {
  const platform = readString(input.platform);
  const matchValue = readString(input.matchValue);
  const reason = readString(input.reason);

  if (!platform) {
    throw new Error("Exclusion platform is required.");
  }

  if (!isCollectorExclusionMatchType(input.matchType)) {
    throw new Error(`Invalid exclusion match type: ${input.matchType}.`);
  }

  if (!matchValue) {
    throw new Error("Exclusion match value is required.");
  }

  if (!reason) {
    throw new Error("Exclusion reason is required.");
  }

  return {
    is_active: input.isActive ?? true,
    match_type: input.matchType,
    match_value: normalizeExclusionValue(input.matchType, matchValue),
    platform,
    reason,
    source_raw_source_id: input.sourceRawSourceId ?? null,
  };
}

function isCollectorExclusionMatchType(
  value: unknown,
): value is CollectorExclusionMatchType {
  return (
    value === "author_handle" ||
    value === "domain" ||
    value === "search_query" ||
    value === "source_post_id" ||
    value === "source_url" ||
    value === "text_contains"
  );
}

function normalizeExclusionValue(
  matchType: CollectorExclusionMatchType,
  value: string,
) {
  if (matchType === "domain") {
    return value
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .toLowerCase();
  }

  if (
    matchType === "author_handle" ||
    matchType === "search_query" ||
    matchType === "text_contains"
  ) {
    return value.toLowerCase();
  }

  return value;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

async function readResponseText(response: Response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}
