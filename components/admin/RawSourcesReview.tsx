"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type RawSource = {
  approved_report_id: string | null;
  author_handle: string | null;
  category_guess: string | null;
  collected_at: string;
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
  status: string;
};

type ReportDraft = {
  category: string;
  confidence_label: string;
  country: string | null;
  event_datetime: string | null;
  has_media: boolean;
  location_name: string;
  region: string;
  reported_datetime: string | null;
  source_name: string;
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

type CollectorSummary = {
  dryRun: boolean;
  errors: string[];
  queries: {
    duplicatesSkipped: number;
    errors: string[];
    fetched: number;
    inserted: number;
    normalized: number;
    query: string;
  }[];
  totals: {
    duplicatesSkipped: number;
    fetched: number;
    inserted: number;
    normalized: number;
  };
  warnings: string[];
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

export function RawSourcesReview() {
  const [rows, setRows] = useState<RawSource[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("pending");
  const [platform, setPlatform] = useState("");
  const [categoryGuess, setCategoryGuess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [draftOverrides, setDraftOverrides] = useState<DraftOverrides>({});
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [collectorDryRun, setCollectorDryRun] = useState(true);
  const [collectorLimit, setCollectorLimit] = useState("3");
  const [collectorLoading, setCollectorLoading] = useState(false);
  const [collectorQuery, setCollectorQuery] = useState("strange lights");
  const [collectorSummary, setCollectorSummary] =
    useState<CollectorSummary | null>(null);

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

      if (searchQuery.trim()) {
        params.set("searchQuery", searchQuery.trim());
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
  }, [categoryGuess, platform, searchQuery, status]);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  useEffect(() => {
    setPreview(null);
    setReviewNotes(selected?.review_notes ?? "");
    setRejectionReason(selected?.rejection_reason ?? "");
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
      setError("Add a rejection/review reason before changing this status.");
      return;
    }

    setActionLoading(nextStatus);
    setError("");

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

      if (!body.dryRun && body.totals.inserted > 0) {
        await loadSources();
      }
    } catch (collectorError) {
      setError(formatError(collectorError));
    } finally {
      setCollectorLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-night-800 bg-night-900 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span className="rounded-full border border-night-800 px-2 py-1 text-xs text-muted">
                    {row.platform}
                  </span>
                  {row.category_guess ? (
                    <span className="rounded-full border border-signal-violet/30 bg-signal-violet/10 px-2 py-1 text-xs text-parchment">
                      {row.category_guess}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold text-parchment">
                  {row.raw_title ?? "Untitled raw source"}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {row.raw_text ?? "No raw text captured."}
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
                    {selected.raw_title ?? "Untitled raw source"}
                  </h2>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <WarningList source={selected} preview={preview} />

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
                  onChange={setRejectionReason}
                  placeholder="Required for rejected, duplicate, low-context, private/sensitive, joke, AI-generated."
                  value={rejectionReason}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Review actions
                </p>
                <div className="flex flex-wrap gap-2">
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
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      {label}
      <textarea
        className="mt-2 min-h-28 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm normal-case leading-6 tracking-normal text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
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
  value: string | null | undefined;
}) {
  const content = value || "Unknown";

  return (
    <div className="rounded-lg border border-night-800 bg-night-950 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      {value?.startsWith("http") ? (
        <a
          className="mt-2 block break-words text-sm text-signal-teal transition hover:text-parchment"
          href={value}
          rel="noreferrer"
          target="_blank"
        >
          {value}
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

const secondaryButtonClass =
  "rounded-lg border border-night-800 bg-night-950 px-4 py-2 text-sm font-semibold text-parchment transition hover:border-signal-teal hover:text-signal-teal disabled:cursor-not-allowed disabled:opacity-60";
