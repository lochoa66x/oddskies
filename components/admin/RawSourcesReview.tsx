"use client";

import type { Dispatch, ReactNode, Ref, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RawSource = {
  approved_report_id: string | null;
  author_handle: string | null;
  category_guess: string | null;
  collected_at: string;
  curation_label: string | null;
  curation_reasons: string[] | null;
  curation_score: number | null;
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
  last_location_normalized_at: string | null;
  last_scored_at: string | null;
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
  status: string;
};

type ReportDraft = {
  category: string;
  confidence_label: string;
  country: string | null;
  display_summary?: string;
  display_title?: string;
  enrichment_notes?: string[];
  event_datetime: string | null;
  has_location?: boolean;
  has_media: boolean;
  has_media_hint?: boolean;
  has_source_link?: boolean;
  has_time?: boolean;
  last_enriched_at?: string;
  location_confidence: string | null;
  location_name: string;
  location_resolution: string | null;
  location_warnings: string[];
  mood_label?: string;
  oracle_prompt_seed?: string | null;
  oracle_ready?: boolean;
  region: string;
  reported_datetime: string | null;
  short_label?: string;
  source_name: string;
  source_quality_label?: string;
  source_quality_reasons?: string[];
  source_type: string;
  source_url: string | null;
  summary: string;
  title: string;
  verification_status: string;
};

type PromotionPreview = {
  reportDraft: ReportDraft;
  warnings: string[];
};

type RawSourceScoreResult = {
  id: string;
  score: {
    curation_label: string;
    curation_reasons: string[];
    curation_score: number;
  };
};

type RawSourceLocationResult = {
  id: string;
  location: {
    location_confidence: string;
    location_resolution: string;
    location_warnings: string[];
    normalized_country: string | null;
    normalized_latitude: number | null;
    normalized_location_name: string | null;
    normalized_longitude: number | null;
    normalized_region: string | null;
  };
};

type CollectorSummary = {
  dryRun: boolean;
  errors: string[];
  queries: {
    duplicatesSkipped: number;
    emptySkipped: number;
    errors: string[];
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
    query: string;
    repliesSkipped: number;
  }[];
  runId?: string;
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    locationNormalized?: number;
    normalized: number;
    repliesSkipped: number;
    scored?: number;
  };
  warnings: string[];
};

type CollectorRun = {
  collector_name: string;
  dry_run: boolean;
  duplicate_count: number;
  error_count: number;
  error_message: string | null;
  fetched_count: number;
  finished_at: string | null;
  id: string;
  inserted_count: number;
  mode: string;
  platform: string;
  query_count: number;
  started_at: string;
  status: string;
};

type DraftOverrides = Partial<{
  category: string;
  confidence_label: string;
  country: string;
  event_datetime: string;
  location_name: string;
  region: string;
  reported_datetime: string;
  source_name: string;
  source_type: string;
  source_url: string;
  summary: string;
  title: string;
}>;

const statusOptions = [
  ["pending", "Pending"],
  ["all", "All"],
  ["new", "New"],
  ["needs_review", "Needs review"],
  ["rejected", "Rejected"],
  ["duplicate", "Duplicate"],
  ["low_context", "Low context"],
  ["private_or_sensitive", "Private/sensitive"],
  ["possible_joke", "Possible joke"],
  ["possible_ai_generated", "Possible AI-generated"],
  ["approved", "Approved"],
] as const;

const reviewActions = [
  ["needs_review", "Needs review"],
  ["rejected", "Reject"],
  ["duplicate", "Duplicate"],
  ["low_context", "Low context"],
  ["private_or_sensitive", "Private/sensitive"],
  ["possible_joke", "Possible joke"],
  ["possible_ai_generated", "Possible AI-generated"],
] as const;

const categoryOptions = [
  "",
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Unknown",
] as const;

const curationLabelOptions = [
  "",
  "Low context",
  "Needs review",
  "Good candidate",
  "Strong candidate",
] as const;

const locationConfidenceOptions = ["", "none", "low", "medium", "high"] as const;

const locationResolutionOptions = [
  "",
  "none",
  "city",
  "region",
  "country",
  "landmark",
  "approximate",
  "private_or_sensitive",
] as const;

const booleanFilterOptions = [
  ["", "Any"],
  ["true", "Yes"],
  ["false", "No"],
] as const;

const sortOptions = [
  ["newest", "Newest first"],
  ["score_desc", "Highest score"],
  ["score_asc", "Lowest score"],
] as const;

export function RawSourcesReview() {
  const [rows, setRows] = useState<RawSource[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("pending");
  const [platform, setPlatform] = useState("");
  const [categoryGuess, setCategoryGuess] = useState("");
  const [curationLabel, setCurationLabel] = useState("");
  const [hasLocationHint, setHasLocationHint] = useState("");
  const [hasNormalizedLocation, setHasNormalizedLocation] = useState("");
  const [locationConfidence, setLocationConfidence] = useState("");
  const [locationResolution, setLocationResolution] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [possibleAiGenerated, setPossibleAiGenerated] = useState("");
  const [possibleJoke, setPossibleJoke] = useState("");
  const [possiblePrivateLocation, setPossiblePrivateLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [draftOverrides, setDraftOverrides] = useState<DraftOverrides>({});
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [collectorDryRun, setCollectorDryRun] = useState(true);
  const [collectorLimit, setCollectorLimit] = useState("3");
  const [collectorLoading, setCollectorLoading] = useState(false);
  const [collectorQuery, setCollectorQuery] = useState("strange lights");
  const [collectorSummary, setCollectorSummary] =
    useState<CollectorSummary | null>(null);
  const [collectorRuns, setCollectorRuns] = useState<CollectorRun[]>([]);
  const [collectorRunsLoading, setCollectorRunsLoading] = useState(true);
  const rejectionReasonRef = useRef<HTMLTextAreaElement | null>(null);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        limit: "50",
        status,
      });

      if (platform.trim()) {
        params.set("platform", platform.trim());
      }

      if (categoryGuess.trim()) {
        params.set("categoryGuess", categoryGuess.trim());
      }

      if (curationLabel.trim()) {
        params.set("curationLabel", curationLabel.trim());
      }

      if (hasLocationHint.trim()) {
        params.set("hasLocationHint", hasLocationHint.trim());
      }

      if (hasNormalizedLocation.trim()) {
        params.set("hasNormalizedLocation", hasNormalizedLocation.trim());
      }

      if (locationConfidence.trim()) {
        params.set("locationConfidence", locationConfidence.trim());
      }

      if (locationResolution.trim()) {
        params.set("locationResolution", locationResolution.trim());
      }

      if (possiblePrivateLocation.trim()) {
        params.set("possiblePrivateLocation", possiblePrivateLocation.trim());
      }

      if (possibleJoke.trim()) {
        params.set("possibleJoke", possibleJoke.trim());
      }

      if (possibleAiGenerated.trim()) {
        params.set("possibleAiGenerated", possibleAiGenerated.trim());
      }

      if (searchQuery.trim()) {
        params.set("searchQuery", searchQuery.trim());
      }

      if (sort !== "newest") {
        params.set("sort", sort);
      }

      const body = await adminFetch<{ rows: RawSource[] }>(
        `/api/admin/raw-sources?${params.toString()}`,
      );

      setRows(body.rows);
      setSelectedId((current) =>
        body.rows.some((row) => row.id === current) ? current : body.rows[0]?.id ?? "",
      );
    } catch (loadError) {
      setError(formatError(loadError));
    } finally {
      setLoading(false);
    }
  }, [
    categoryGuess,
    curationLabel,
    hasLocationHint,
    hasNormalizedLocation,
    locationConfidence,
    locationResolution,
    platform,
    possibleAiGenerated,
    possibleJoke,
    possiblePrivateLocation,
    searchQuery,
    sort,
    status,
  ]);

  const loadCollectorRuns = useCallback(async () => {
    setCollectorRunsLoading(true);

    try {
      const body = await adminFetch<{ rows: CollectorRun[] }>(
        "/api/admin/collector-runs?limit=3",
      );

      setCollectorRuns(body.rows);
    } catch {
      setCollectorRuns([]);
    } finally {
      setCollectorRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  useEffect(() => {
    void loadCollectorRuns();
  }, [loadCollectorRuns]);

  useEffect(() => {
    setPreview(null);
    setReviewNotes(selected?.review_notes ?? "");
    setRejectionReason(selected?.rejection_reason ?? "");
    setReasonError("");
    setDraftOverrides({});
  }, [selected?.id, selected?.rejection_reason, selected?.review_notes]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  async function markStatus(nextStatus: string) {
    if (!selected) {
      return;
    }

    const requiresReason = nextStatus !== "needs_review";

    if (requiresReason && !rejectionReason.trim()) {
      const message = "Add a rejection/review reason before changing this status.";
      setError(message);
      setReasonError(message);
      rejectionReasonRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      window.setTimeout(() => rejectionReasonRef.current?.focus(), 250);
      return;
    }

    setActionLoading(nextStatus);
    setError("");
    setReasonError("");

    try {
      await adminFetch(`/api/admin/raw-sources/${selected.id}/review`, {
        body: JSON.stringify({
          rejectionReason,
          reviewNotes,
          status: nextStatus,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      await loadSources();
    } catch (actionError) {
      setError(formatError(actionError));
    } finally {
      setActionLoading("");
    }
  }

  async function dryRunPromotion() {
    if (!selected) {
      return;
    }

    setActionLoading("dry-run");
    setError("");

    try {
      const body = await adminFetch<PromotionPreview>(
        `/api/admin/raw-sources/${selected.id}/dry-run`,
        {
          body: JSON.stringify({ overrides: cleanedOverrides(draftOverrides) }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      setPreview(body);
      setDraftOverrides((current) => ({
        ...current,
        ...draftToOverrides(body.reportDraft),
      }));
    } catch (promotionError) {
      setError(formatError(promotionError));
    } finally {
      setActionLoading("");
    }
  }

  async function promote() {
    if (!selected) {
      return;
    }

    const confirmed = window.confirm(
      "Promote this raw source into public.reports? It will remain Unverified.",
    );

    if (!confirmed) {
      return;
    }

    setActionLoading("promote");
    setError("");

    try {
      await adminFetch(`/api/admin/raw-sources/${selected.id}/promote`, {
        body: JSON.stringify({ overrides: cleanedOverrides(draftOverrides) }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      setPreview(null);
      await loadSources();
    } catch (promotionError) {
      setError(formatError(promotionError));
    } finally {
      setActionLoading("");
    }
  }

  async function runBlueskyCollectorTest() {
    setCollectorLoading(true);
    setCollectorSummary(null);
    setError("");

    try {
      const body = await adminFetch<CollectorSummary>(
        "/api/admin/collectors/bluesky",
        {
          body: JSON.stringify({
            dryRun: collectorDryRun,
            limit: Number(collectorLimit),
            queries: [collectorQuery],
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );

      setCollectorSummary(body);
      await loadCollectorRuns();

      if (!body.dryRun && body.totals.inserted > 0) {
        await loadSources();
      }
    } catch (collectorError) {
      setError(formatError(collectorError));
    } finally {
      setCollectorLoading(false);
    }
  }

  async function refreshSelectedScore() {
    if (!selected) {
      return;
    }

    setActionLoading("score");
    setError("");

    try {
      await adminFetch<RawSourceScoreResult>(
        `/api/admin/raw-sources/${selected.id}/score`,
        {
          method: "POST",
        },
      );
      await loadSources();
    } catch (scoreError) {
      setError(formatError(scoreError));
    } finally {
      setActionLoading("");
    }
  }

  async function normalizeSelectedLocation() {
    if (!selected) {
      return;
    }

    setActionLoading("normalize-location");
    setError("");

    try {
      await adminFetch<RawSourceLocationResult>(
        `/api/admin/raw-sources/${selected.id}/normalize-location`,
        {
          method: "POST",
        },
      );
      await loadSources();
    } catch (locationError) {
      setError(formatError(locationError));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-night-800 bg-night-900 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <FilterSelect label="Status" onChange={setStatus} value={status}>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterInput label="Platform" onChange={setPlatform} value={platform} />
            <FilterSelect
              label="Category"
              onChange={setCategoryGuess}
              value={categoryGuess}
            >
              {categoryOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option || "Any category"}
                </option>
              ))}
            </FilterSelect>
            <FilterInput
              label="Search query"
              onChange={setSearchQuery}
              value={searchQuery}
            />
            <FilterSelect
              label="Curation"
              onChange={setCurationLabel}
              value={curationLabel}
            >
              {curationLabelOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option || "Any label"}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Location hint"
              onChange={setHasLocationHint}
              value={hasLocationHint}
            >
              {booleanFilterOptions.map(([value, label]) => (
                <option key={value || "any-location"} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Normalized"
              onChange={setHasNormalizedLocation}
              value={hasNormalizedLocation}
            >
              {booleanFilterOptions.map(([value, label]) => (
                <option key={value || "any-normalized"} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Loc confidence"
              onChange={setLocationConfidence}
              value={locationConfidence}
            >
              {locationConfidenceOptions.map((option) => (
                <option key={option || "any-location-confidence"} value={option}>
                  {option || "Any confidence"}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Loc resolution"
              onChange={setLocationResolution}
              value={locationResolution}
            >
              {locationResolutionOptions.map((option) => (
                <option key={option || "any-location-resolution"} value={option}>
                  {option ? option.replace(/_/g, " ") : "Any resolution"}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Private flag"
              onChange={setPossiblePrivateLocation}
              value={possiblePrivateLocation}
            >
              {booleanFilterOptions.map(([value, label]) => (
                <option key={value || "any-private"} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Joke flag"
              onChange={setPossibleJoke}
              value={possibleJoke}
            >
              {booleanFilterOptions.map(([value, label]) => (
                <option key={value || "any-joke"} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="AI flag"
              onChange={setPossibleAiGenerated}
              value={possibleAiGenerated}
            >
              {booleanFilterOptions.map(([value, label]) => (
                <option key={value || "any-ai"} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Sort" onChange={setSort} value={sort}>
              {sortOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FilterSelect>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={secondaryButtonClass} onClick={() => void loadSources()}>
              Refresh
            </button>
            <button className={secondaryButtonClass} onClick={() => void logout()}>
              Lock
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-signal-ember/40 bg-signal-ember/10 px-4 py-3 text-sm text-signal-ember">
          {error}
        </div>
      ) : null}

      <div className="rounded-lg border border-night-800 bg-night-900 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
              Collector test
            </p>
            <h2 className="mt-2 text-xl font-bold text-parchment">
              Bluesky to raw_sources
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Runs a small staging-only pull. Nothing becomes public until a raw
              source is reviewed and promoted.
            </p>
            <CollectorRunStatusPanel
              loading={collectorRunsLoading}
              run={collectorRuns[0] ?? null}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_120px] xl:min-w-[520px]">
            <FilterInput
              label="Query"
              onChange={setCollectorQuery}
              value={collectorQuery}
            />
            <FilterInput
              label="Limit"
              onChange={setCollectorLimit}
              value={collectorLimit}
            />
            <label className="flex items-center gap-3 rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm text-muted sm:col-span-2">
              <input
                checked={collectorDryRun}
                className="size-4 accent-signal-teal"
                onChange={(event) => setCollectorDryRun(event.target.checked)}
                type="checkbox"
              />
              Dry run first
            </label>
            <button
              className="rounded-lg border border-signal-teal/40 bg-signal-teal/10 px-4 py-2 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              disabled={collectorLoading}
              onClick={() => void runBlueskyCollectorTest()}
            >
              {collectorLoading ? "Checking the sky..." : "Run Bluesky collector test"}
            </button>
          </div>
        </div>

        {collectorSummary ? (
          <CollectorSummaryPanel summary={collectorSummary} />
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <div className="rounded-lg border border-night-800 bg-night-900">
          <div className="flex items-center justify-between border-b border-night-800 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
                Staging queue
              </p>
              <p className="mt-1 text-sm text-muted">
                {loading ? "Loading..." : `${rows.length} raw sources`}
              </p>
            </div>
          </div>
          <div className="max-h-[720px] space-y-3 overflow-y-auto p-3">
            {rows.length === 0 && !loading ? (
              <p className="rounded-lg border border-night-800 bg-night-950 p-4 text-sm text-muted">
                No raw sources match these filters.
              </p>
            ) : null}
            {rows.map((row) => (
              <button
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selected?.id === row.id
                    ? "border-signal-teal bg-signal-teal/10"
                    : "border-night-800 bg-night-950 hover:border-night-800/80 hover:bg-night-850"
                }`}
                key={row.id}
                onClick={() => setSelectedId(row.id)}
                type="button"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={row.status} />
                  <CurationBadge
                    label={row.curation_label}
                    score={row.curation_score}
                  />
                  <LocationBadge source={row} />
                  <span className="rounded-full border border-night-800 px-2 py-1 text-xs text-muted">
                    {row.platform}
                  </span>
                  {row.category_guess ? (
                    <span className="rounded-full border border-signal-violet/30 bg-signal-violet/10 px-2 py-1 text-xs text-parchment">
                      {row.category_guess}
                    </span>
                  ) : null}
                  <HintBadges source={row} compact />
                </div>
                <p className="mt-3 text-sm font-semibold text-parchment">
                  {row.normalized_title ?? row.raw_title ?? "Untitled raw source"}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {row.normalized_summary ?? row.raw_text ?? "No raw text captured."}
                </p>
                <div className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
                  <span>Author: {row.author_handle ?? "Unknown"}</span>
                  <span>Posted: {formatDate(row.posted_at)}</span>
                  <span>Collected: {formatDate(row.collected_at)}</span>
                  <span>Query: {row.search_query ?? "Unknown"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-night-800 bg-night-900">
          {selected ? (
            <div className="space-y-5 p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
                    Source detail
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {selected.normalized_title ??
                      selected.raw_title ??
                      "Untitled raw source"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selected.status} />
                  <CurationBadge
                    label={selected.curation_label}
                    score={selected.curation_score}
                  />
                  <LocationBadge source={selected} />
                </div>
              </div>

              <WarningList source={selected} preview={preview} />

              <CurationPanel source={selected} />

              <LocationPanel source={selected} />

              <div className="rounded-lg border border-night-800 bg-night-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Raw text
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-parchment">
                  {selected.raw_text ?? "No raw text captured."}
                </p>
              </div>

              <div className="grid gap-3 text-sm text-muted md:grid-cols-2">
                <DetailItem label="Source URL" value={selected.source_url} />
                <DetailItem label="Author" value={selected.author_handle} />
                <DetailItem label="Posted" value={formatDate(selected.posted_at)} />
                <DetailItem
                  label="Collected"
                  value={formatDate(selected.collected_at)}
                />
                <DetailItem label="Search query" value={selected.search_query} />
                <DetailItem label="Language" value={selected.language} />
                <DetailItem
                  label="Approved report"
                  value={selected.approved_report_id}
                />
                <DetailItem label="Source post id" value={selected.source_post_id} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <TextArea
                  label="Review notes"
                  onChange={setReviewNotes}
                  placeholder="What did you check?"
                  value={reviewNotes}
                />
                <TextArea
                  label="Rejection / review reason"
                  error={reasonError}
                  onChange={(value) => {
                    setRejectionReason(value);
                    if (value.trim()) {
                      setReasonError("");
                    }
                  }}
                  placeholder="Required for rejected, duplicate, low-context, private/sensitive, joke, AI-generated."
                  textareaRef={rejectionReasonRef}
                  value={rejectionReason}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Review actions
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={secondaryButtonClass}
                    disabled={Boolean(actionLoading)}
                    onClick={() => void refreshSelectedScore()}
                  >
                    {actionLoading === "score" ? "Scoring..." : "Refresh score"}
                  </button>
                  <button
                    className={secondaryButtonClass}
                    disabled={Boolean(actionLoading)}
                    onClick={() => void normalizeSelectedLocation()}
                  >
                    {actionLoading === "normalize-location"
                      ? "Normalizing..."
                      : "Normalize location"}
                  </button>
                  {reviewActions.map(([value, label]) => (
                    <button
                      className={secondaryButtonClass}
                      disabled={Boolean(actionLoading)}
                      key={value}
                      onClick={() => void markStatus(value)}
                    >
                      {actionLoading === value ? "Saving..." : label}
                    </button>
                  ))}
                </div>
              </div>

              <DraftEditor
                overrides={draftOverrides}
                preview={preview}
                setOverrides={setDraftOverrides}
              />

              <div className="flex flex-wrap gap-3 border-t border-night-800 pt-4">
                <button
                  className={secondaryButtonClass}
                  disabled={Boolean(actionLoading)}
                  onClick={() => void dryRunPromotion()}
                >
                  {actionLoading === "dry-run" ? "Previewing..." : "Dry run promote"}
                </button>
                <button
                  className="rounded-lg bg-signal-amber px-4 py-2 text-sm font-bold text-night-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={Boolean(actionLoading)}
                  onClick={() => void promote()}
                >
                  {actionLoading === "promote" ? "Promoting..." : "Promote to report"}
                </button>
              </div>
            </div>
          ) : (
            <p className="p-5 text-sm text-muted">Select a raw source to review.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

function CollectorSummaryPanel({ summary }: { summary: CollectorSummary }) {
  return (
    <div className="mt-4 rounded-lg border border-night-800 bg-night-950 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Latest collector result
        </p>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            summary.dryRun
              ? "border-signal-violet/35 bg-signal-violet/10 text-signal-violet"
              : "border-signal-amber/40 bg-signal-amber/10 text-signal-amber"
          }`}
        >
          {summary.dryRun ? "Dry run" : "Staged insert"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <CollectorStat label="Fetched" value={summary.totals.fetched} />
        <CollectorStat label="Normalized" value={summary.totals.normalized} />
        <CollectorStat label="Inserted" value={summary.totals.inserted} />
        <CollectorStat
          label="Duplicates"
          value={summary.totals.duplicatesSkipped}
        />
        <CollectorStat label="Replies skipped" value={summary.totals.repliesSkipped} />
        <CollectorStat label="Empty skipped" value={summary.totals.emptySkipped} />
        <CollectorStat label="Scored" value={summary.totals.scored ?? 0} />
        <CollectorStat
          label="Locations"
          value={summary.totals.locationNormalized ?? 0}
        />
      </div>

      {summary.queries.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {summary.queries.map((query) => (
            <span
              className="rounded-full border border-night-800 px-3 py-1 text-xs text-muted"
              key={query.query}
            >
              {query.query}: {query.normalized} staged candidates
            </span>
          ))}
        </div>
      ) : null}

      {[...summary.warnings, ...summary.errors].length > 0 ? (
        <div className="mt-3 space-y-1 rounded-lg border border-signal-amber/30 bg-signal-amber/10 p-3 text-sm text-parchment">
          {[...summary.warnings, ...summary.errors].map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CollectorStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-night-800 bg-night-900 p-3">
      <p className="text-2xl font-bold text-parchment">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
    </div>
  );
}

function CollectorRunStatusPanel({
  loading,
  run,
}: {
  loading: boolean;
  run: CollectorRun | null;
}) {
  if (loading) {
    return (
      <div className="mt-4 rounded-lg border border-night-800 bg-night-950 p-3 text-sm text-muted">
        Checking the last collector run...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="mt-4 rounded-lg border border-night-800 bg-night-950 p-3 text-sm text-muted">
        No collector run has been logged yet.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-night-800 bg-night-950 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Last collector run
        </p>
        <span className={collectorRunStatusClass(run.status)}>
          {run.status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
        <span>
          {run.collector_name} · {run.mode}
        </span>
        <span>{run.dry_run ? "Dry run" : "Staged insert"}</span>
        <span>Started: {formatDate(run.started_at)}</span>
        <span>Finished: {formatDate(run.finished_at)}</span>
        <span>Fetched: {run.fetched_count}</span>
        <span>Inserted: {run.inserted_count}</span>
        <span>Duplicates: {run.duplicate_count}</span>
        <span>Errors: {run.error_count}</span>
      </div>
      {run.error_message ? (
        <p className="mt-3 rounded-lg border border-signal-amber/30 bg-signal-amber/10 p-2 text-xs text-parchment">
          {run.error_message}
        </p>
      ) : null}
    </div>
  );
}

function collectorRunStatusClass(status: string) {
  if (status === "completed") {
    return "rounded-full border border-signal-teal/35 bg-signal-teal/10 px-3 py-1 text-xs text-signal-teal";
  }

  if (status === "failed" || status === "completed_with_errors") {
    return "rounded-full border border-signal-ember/40 bg-signal-ember/10 px-3 py-1 text-xs text-signal-ember";
  }

  return "rounded-full border border-signal-amber/40 bg-signal-amber/10 px-3 py-1 text-xs text-signal-amber";
}

function CurationPanel({ source }: { source: RawSource }) {
  return (
    <div className="rounded-lg border border-night-800 bg-night-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-teal">
            Curation hints
          </p>
          <p className="mt-1 text-sm text-muted">
            Review helper only. This score does not verify anything.
          </p>
        </div>
        <CurationBadge label={source.curation_label} score={source.curation_score} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <HintBadges source={source} />
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <DetailItem
          label="Extracted location"
          value={source.extracted_location_text}
        />
        <DetailItem label="Region guess" value={source.extracted_region_guess} />
        <DetailItem label="Country guess" value={source.extracted_country_guess} />
        <DetailItem
          label="Time hint"
          value={source.extracted_event_datetime_text}
        />
      </div>

      {source.curation_reasons?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {source.curation_reasons.map((reason) => (
            <span
              className="rounded-full border border-night-800 px-3 py-1 text-xs text-muted"
              key={reason}
            >
              {reason}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-night-800 bg-night-900 p-3 text-sm text-muted">
          No curation score yet. Use Refresh score when this source is selected.
        </p>
      )}
    </div>
  );
}

function CurationBadge({
  label,
  score,
}: {
  label: string | null;
  score: number | null;
}) {
  const displayLabel = label ?? "Unscored";
  const displayScore = typeof score === "number" && Number.isFinite(score) ? score : 0;

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs ${curationClass(
        displayLabel,
      )}`}
    >
      {displayLabel} - {displayScore}
    </span>
  );
}

function LocationBadge({ source }: { source: RawSource }) {
  const confidence = source.location_confidence ?? "none";
  const resolution = source.location_resolution ?? "none";

  if (resolution === "private_or_sensitive") {
    return (
      <span className="rounded-full border border-signal-ember/40 bg-signal-ember/10 px-2 py-1 text-xs text-signal-ember">
        Private location
      </span>
    );
  }

  if (source.normalized_location_name) {
    return (
      <span className={`rounded-full border px-2 py-1 text-xs ${locationClass(confidence)}`}>
        Loc {confidence} · {resolution}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-night-800 px-2 py-1 text-xs text-muted">
      Loc pending
    </span>
  );
}

function LocationPanel({ source }: { source: RawSource }) {
  const warnings = readStringArray(source.location_warnings);
  const latitude = readFiniteNumber(source.normalized_latitude);
  const longitude = readFiniteNumber(source.normalized_longitude);
  const coordinate =
    latitude !== null && longitude !== null
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : null;
  const hasNormalizedLocation = Boolean(
    source.normalized_location_name ||
      source.normalized_region ||
      source.normalized_country ||
      coordinate,
  );

  return (
    <div className="rounded-lg border border-night-800 bg-night-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-teal">
            Location normalization
          </p>
          <p className="mt-1 text-sm text-muted">
            Approximate review hint only. No geocoder, no verification.
          </p>
        </div>
        <LocationBadge source={source} />
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <DetailItem
          label="Normalized location"
          value={source.normalized_location_name}
        />
        <DetailItem label="Normalized region" value={source.normalized_region} />
        <DetailItem label="Normalized country" value={source.normalized_country} />
        <DetailItem label="Approx coordinates" value={coordinate} />
        <DetailItem
          label="Confidence"
          value={source.location_confidence ?? "none"}
        />
        <DetailItem
          label="Resolution"
          value={(source.location_resolution ?? "none").replace(/_/g, " ")}
        />
      </div>

      {warnings.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {warnings.map((warning) => (
            <span
              className={hintClass(
                warning === "possible_private_location" ? "danger" : "warn",
              )}
              key={warning}
            >
              {warning.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      ) : !hasNormalizedLocation ? (
        <p className="mt-4 rounded-lg border border-night-800 bg-night-900 p-3 text-sm text-muted">
          No normalized location yet. Use Normalize location after scoring.
        </p>
      ) : null}
    </div>
  );
}

function HintBadges({
  compact = false,
  source,
}: {
  compact?: boolean;
  source: RawSource;
}) {
  const badges = [
    source.has_location_hint ? ["Location", "good"] : ["No location", "muted"],
    source.has_time_hint ? ["Time", "good"] : ["No time", "muted"],
    source.has_media_hint ? ["Media", "good"] : null,
    source.possible_duplicate ? ["Duplicate?", "warn"] : null,
    source.possible_joke ? ["Joke?", "warn"] : null,
    source.possible_ai_generated ? ["AI/edited?", "warn"] : null,
    source.possible_private_location ? ["Private warning", "danger"] : null,
  ].filter(Boolean) as Array<[string, "danger" | "good" | "muted" | "warn"]>;

  if (compact) {
    return (
      <>
        {badges.slice(0, 4).map(([label, tone]) => (
          <span className={hintClass(tone)} key={label}>
            {label}
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      {badges.map(([label, tone]) => (
        <span className={hintClass(tone)} key={label}>
          {label}
        </span>
      ))}
    </>
  );
}

function FilterInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      {label}
      <input
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm normal-case tracking-normal text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function FilterSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      {label}
      <select
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm normal-case tracking-normal text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function TextArea({
  error,
  label,
  onChange,
  placeholder,
  textareaRef,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
  value: string;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      {label}
      <textarea
        aria-invalid={Boolean(error)}
        className={`mt-2 min-h-28 w-full rounded-lg border bg-night-950 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-parchment outline-none transition focus:border-signal-teal ${
          error ? "border-signal-ember" : "border-night-800"
        }`}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ref={textareaRef}
        value={value}
      />
      {error ? (
        <span className="mt-2 block text-xs normal-case tracking-normal text-signal-ember">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function DraftEditor({
  overrides,
  preview,
  setOverrides,
}: {
  overrides: DraftOverrides;
  preview: PromotionPreview | null;
  setOverrides: Dispatch<SetStateAction<DraftOverrides>>;
}) {
  const draft = preview?.reportDraft;

  return (
    <div className="rounded-lg border border-night-800 bg-night-950 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-teal">
            Promotion preview
          </p>
          <p className="mt-1 text-sm text-muted">
            Dry-run first, then edit fields before confirming.
          </p>
        </div>
        <span className="rounded-full border border-night-800 px-3 py-1 text-xs text-muted">
          {draft ? "Draft ready" : "No dry-run yet"}
        </span>
      </div>

      {preview?.warnings.length ? (
        <div className="mt-4 rounded-lg border border-signal-amber/35 bg-signal-amber/10 p-3 text-sm text-parchment">
          {preview.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {draft ? <DraftEnrichmentPreview draft={draft} /> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DraftInput label="Title" name="title" setOverrides={setOverrides} value={overrides.title ?? draft?.title ?? ""} />
        <DraftInput label="Category" name="category" setOverrides={setOverrides} value={overrides.category ?? draft?.category ?? ""} />
        <DraftInput label="Location" name="location_name" setOverrides={setOverrides} value={overrides.location_name ?? draft?.location_name ?? ""} />
        <DraftInput label="Region" name="region" setOverrides={setOverrides} value={overrides.region ?? draft?.region ?? ""} />
        <DraftInput label="Country" name="country" setOverrides={setOverrides} value={overrides.country ?? draft?.country ?? ""} />
        <DraftInput label="Confidence" name="confidence_label" setOverrides={setOverrides} value={overrides.confidence_label ?? draft?.confidence_label ?? ""} />
        <DraftInput label="Event datetime" name="event_datetime" setOverrides={setOverrides} value={overrides.event_datetime ?? draft?.event_datetime ?? ""} />
        <DraftInput label="Reported datetime" name="reported_datetime" setOverrides={setOverrides} value={overrides.reported_datetime ?? draft?.reported_datetime ?? ""} />
        <DraftInput label="Source name" name="source_name" setOverrides={setOverrides} value={overrides.source_name ?? draft?.source_name ?? ""} />
        <DraftInput label="Source type" name="source_type" setOverrides={setOverrides} value={overrides.source_type ?? draft?.source_type ?? ""} />
        <div className="md:col-span-2">
          <DraftInput label="Source URL" name="source_url" setOverrides={setOverrides} value={overrides.source_url ?? draft?.source_url ?? ""} />
        </div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted md:col-span-2">
          Summary
          <textarea
            className="mt-2 min-h-28 w-full rounded-lg border border-night-800 bg-night-900 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-parchment outline-none transition focus:border-signal-teal"
            onChange={(event) =>
              setOverrides((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            value={overrides.summary ?? draft?.summary ?? ""}
          />
        </label>
      </div>
    </div>
  );
}

function DraftEnrichmentPreview({ draft }: { draft: ReportDraft }) {
  const reasons = draft.source_quality_reasons ?? [];
  const notes = draft.enrichment_notes ?? [];

  return (
    <div className="mt-4 rounded-lg border border-signal-teal/25 bg-signal-teal/5 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-teal">
            Enrichment preview
          </p>
          <p className="mt-1 text-sm text-muted">
            Display polish only. This does not verify the report.
          </p>
        </div>
        <span className="rounded-full border border-night-800 bg-night-950 px-3 py-1 text-xs text-muted">
          {draft.oracle_ready ? "Oracle-ready" : "Oracle not ready"}
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <DetailItem label="Display title" value={draft.display_title ?? draft.title} />
        <DetailItem label="Atlas label" value={draft.short_label ?? "Not generated"} />
        <DetailItem label="Mood label" value={draft.mood_label ?? "Not generated"} />
        <DetailItem
          label="Source quality"
          value={draft.source_quality_label ?? "Not generated"}
        />
      </div>
      {draft.display_summary ? (
        <div className="mt-3 rounded-lg border border-night-800 bg-night-950 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Display summary
          </p>
          <p className="mt-2 text-sm leading-6 text-parchment">
            {draft.display_summary}
          </p>
        </div>
      ) : null}
      {reasons.length || notes.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {[...reasons, ...notes].slice(0, 8).map((reason) => (
            <span
              className="rounded-full border border-night-800 bg-night-950 px-2 py-1 text-xs text-muted"
              key={reason}
            >
              {reason}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DraftInput({
  label,
  name,
  setOverrides,
  value,
}: {
  label: string;
  name: keyof DraftOverrides;
  setOverrides: Dispatch<SetStateAction<DraftOverrides>>;
  value: string;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      {label}
      <input
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-900 px-3 py-2 text-sm normal-case tracking-normal text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) =>
          setOverrides((current) => ({
            ...current,
            [name]: event.target.value,
          }))
        }
        value={value}
      />
    </label>
  );
}

function WarningList({
  preview,
  source,
}: {
  preview: PromotionPreview | null;
  source: RawSource;
}) {
  const warnings = [
    !source.source_url ? "Source URL is missing." : "",
    (source.raw_text ?? "").length < 80 ? "Raw text is short." : "",
    source.curation_label === "Low context"
      ? "Curation label is Low context."
      : "",
    !source.has_location_hint ? "No location hint found yet." : "",
    source.location_resolution === "private_or_sensitive"
      ? "Location normalizer found private/sensitive details. Do not promote by default."
      : "",
    source.location_confidence === "low"
      ? "Location confidence is low. Review before mapping."
      : "",
    ...(source.location_warnings ?? []).map(
      (warning) => `Location warning: ${warning.replace(/_/g, " ")}.`,
    ),
    !source.has_time_hint ? "No time hint found yet." : "",
    source.possible_private_location
      ? "Private/sensitive location warning. Do not promote by default."
      : "",
    source.possible_joke ? "Possible joke/meme language flagged." : "",
    source.possible_ai_generated
      ? "Possible AI-generated or edited media language flagged."
      : "",
    source.possible_duplicate ? "Possible duplicate source flagged." : "",
    source.status === "approved" ? "Already approved." : "",
    ...(preview?.warnings ?? []),
  ].filter(Boolean);

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-signal-amber/35 bg-signal-amber/10 p-3 text-sm text-parchment">
      {Array.from(new Set(warnings)).map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const content = formatDetailValue(value);

  return (
    <div className="rounded-lg border border-night-800 bg-night-950 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      {content.startsWith("http") ? (
        <a
          className="mt-2 block break-words text-sm text-signal-teal transition hover:text-parchment"
          href={content}
          rel="noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <p className="mt-2 break-words text-sm text-parchment">{content}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2 py-1 text-xs ${statusClass(status)}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function statusClass(status: string) {
  if (status === "new" || status === "needs_review") {
    return "border-signal-teal/35 bg-signal-teal/10 text-signal-teal";
  }

  if (status === "approved") {
    return "border-signal-amber/40 bg-signal-amber/10 text-signal-amber";
  }

  return "border-signal-ember/35 bg-signal-ember/10 text-signal-ember";
}

function curationClass(label: string) {
  if (label === "Strong candidate") {
    return "border-signal-teal/40 bg-signal-teal/15 text-signal-teal";
  }

  if (label === "Good candidate") {
    return "border-signal-amber/40 bg-signal-amber/10 text-signal-amber";
  }

  if (label === "Low context") {
    return "border-signal-ember/35 bg-signal-ember/10 text-signal-ember";
  }

  return "border-night-800 bg-night-950 text-muted";
}

function locationClass(confidence: string) {
  if (confidence === "high") {
    return "border-signal-teal/40 bg-signal-teal/15 text-signal-teal";
  }

  if (confidence === "medium") {
    return "border-signal-amber/40 bg-signal-amber/10 text-signal-amber";
  }

  if (confidence === "low") {
    return "border-signal-ember/35 bg-signal-ember/10 text-signal-ember";
  }

  return "border-night-800 bg-night-950 text-muted";
}

function hintClass(tone: "danger" | "good" | "muted" | "warn") {
  if (tone === "danger") {
    return "rounded-full border border-signal-ember/40 bg-signal-ember/10 px-2 py-1 text-xs text-signal-ember";
  }

  if (tone === "good") {
    return "rounded-full border border-signal-teal/35 bg-signal-teal/10 px-2 py-1 text-xs text-signal-teal";
  }

  if (tone === "warn") {
    return "rounded-full border border-signal-amber/35 bg-signal-amber/10 px-2 py-1 text-xs text-signal-amber";
  }

  return "rounded-full border border-night-800 px-2 py-1 text-xs text-muted";
}

function cleanedOverrides(overrides: DraftOverrides) {
  return Object.fromEntries(
    Object.entries(overrides).filter(([, value]) =>
      typeof value === "string" ? value.trim() : value !== null && value !== undefined,
    ),
  );
}

function draftToOverrides(draft: ReportDraft): DraftOverrides {
  return {
    category: draft.category,
    confidence_label: draft.confidence_label,
    country: draft.country ?? "",
    event_datetime: draft.event_datetime ?? "",
    location_name: draft.location_name,
    region: draft.region,
    reported_datetime: draft.reported_datetime ?? "",
    source_name: draft.source_name,
    source_type: draft.source_type,
    source_url: draft.source_url ?? "",
    summary: draft.summary,
    title: draft.title,
  };
}

async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Admin request failed.");
  }

  return body;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function formatDetailValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Unknown";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map(String).join(", ") : "Unknown";
  }

  return String(value);
}

function readFiniteNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

const secondaryButtonClass =
  "rounded-lg border border-night-800 bg-night-950 px-4 py-2 text-sm font-semibold text-parchment transition hover:border-signal-teal hover:text-signal-teal disabled:cursor-not-allowed disabled:opacity-60";
