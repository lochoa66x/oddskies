import "server-only";

import { listCollectorRuns, type CollectorRunRow } from "@/lib/collector-runs";

export type AdminMetricTone = "amber" | "ember" | "muted" | "teal" | "violet";

export type AdminMetricCard = {
  detail?: string;
  label: string;
  tone?: AdminMetricTone;
  value: string;
};

export type AdminFunnelRow = {
  collector: number;
  community: number;
  detail: string;
  label: string;
};

export type AdminRecentRun = {
  dryRun: boolean;
  duplicates: number;
  errors: number;
  fetched: number;
  finishedAt?: string;
  id: string;
  inserted: number;
  label: string;
  mode: string;
  startedAt: string;
  status: string;
};

export type AdminMetrics = {
  collectorFeed: AdminMetricCard[];
  communityFeed: AdminMetricCard[];
  generatedAt: string;
  latestRun?: AdminRecentRun;
  notes: string[];
  overview: AdminMetricCard[];
  recentRuns: AdminRecentRun[];
  reviewFunnel: AdminFunnelRow[];
  visitorSignals: AdminMetricCard[];
  warnings: string[];
};

type DbRow = Record<string, unknown>;

type QueryResult<T> = {
  error?: string;
  rows: T[];
};

type SupabaseAdminConfig = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

const FILTERED_STATUSES = new Set([
  "duplicate",
  "ignored",
  "low_context",
  "possible_ai_generated",
  "possible_joke",
  "private_or_sensitive",
  "rejected",
]);

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const warnings: string[] = [];
  const config = getSupabaseAdminConfig();

  if (!config) {
    warnings.push(
      "Signal Room needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );

    return emptyMetrics(warnings);
  }

  const [reportsResult, rawResult, oracleResult, runsResult] =
    await Promise.all([
      fetchTableRows(config, "reports"),
      fetchTableRows(config, "raw_sources"),
      fetchTableRows(config, "oracle_readings", 1000),
      listCollectorRuns(8)
        .then((rows) => ({ rows }))
        .catch((error: unknown) => ({
          error: readError(error),
          rows: [] as CollectorRunRow[],
        })),
    ]);

  for (const result of [reportsResult, rawResult, oracleResult, runsResult]) {
    if ("error" in result && result.error) {
      warnings.push(result.error);
    }
  }

  const reports = reportsResult.rows;
  const rawSources = rawResult.rows;
  const oracleReadings = oracleResult.rows;
  const collectorRows = rawSources.filter((row) => !isCommunitySource(row));
  const communityRows = rawSources.filter(isCommunitySource);
  const recentRuns = runsResult.rows.map(mapCollectorRun);
  const latestRun = recentRuns[0];
  const visibleReports = reports.filter((row) => !isHiddenReport(row));
  const archivedReports = reports.filter((row) => Boolean(row.archived_at));
  const featuredReports = reports.filter((row) => Boolean(row.is_featured));
  const collectorPending = countPending(collectorRows);
  const communityPending = countPending(communityRows);

  return {
    collectorFeed: [
      metric("Staged collector rows", collectorRows.length, "API pulls waiting in raw_sources."),
      metric("Collector pending", collectorPending, "Needs review or still new.", toneForQueue(collectorPending)),
      metric("Strong candidates", countWhere(collectorRows, isStrongCandidate), "Likely worth human review first.", "teal"),
      metric("Filtered collector rows", countFiltered(collectorRows), "Rejected, duplicate, low-context, or sensitive.", "amber"),
    ],
    communityFeed: [
      metric("Community uploads", communityRows.length, "Signals sent through public upload paths."),
      metric("Community pending", communityPending, "Human-submitted items still waiting.", toneForQueue(communityPending)),
      metric("Spam watch", countWhere(communityRows, isSpamWatch), "Possible joke, AI, duplicate, private, or low-context.", "ember"),
      metric("Promoted community rows", countWhere(communityRows, isApprovedRawSource), "Community items that became unverified reports.", "violet"),
    ],
    generatedAt: new Date().toISOString(),
    latestRun,
    notes: [
      "Collector pulls and community uploads are counted separately so they can be reviewed with different spam rules.",
      "Raw sources are evidence trails, not public reports.",
      "Route traffic and core web vitals live in Vercel Analytics after deployment; Search Console remains the source for query and indexing visibility.",
      "OddSkies does not verify reports, track personal identities, or send raw submission text into analytics.",
    ],
    overview: [
      metric("Public reports", visibleReports.length, `${archivedReports.length} archived, ${featuredReports.length} featured.`, "teal"),
      metric("Raw sources staged", rawSources.length, `${countPending(rawSources)} waiting for review.`, "amber"),
      metric("Oracle reads cached", oracleReadings.length, "Stored report readings, not verification.", "violet"),
      metric("Latest collector run", latestRun?.status ?? "No run yet", latestRun ? `${latestRun.fetched} fetched, ${latestRun.inserted} inserted.` : "No collector log found.", latestRun?.errors ? "ember" : "muted"),
    ],
    recentRuns,
    reviewFunnel: [
      funnel("New or needs review", collectorRows, communityRows, (row) =>
        ["new", "needs_review"].includes(getStatus(row)),
      ),
      funnel("Strong candidates", collectorRows, communityRows, isStrongCandidate),
      funnel("Approved/promoted", collectorRows, communityRows, isApprovedRawSource),
      funnel("Filtered away", collectorRows, communityRows, (row) =>
        FILTERED_STATUSES.has(getStatus(row)),
      ),
      funnel("Private or spam watch", collectorRows, communityRows, isSpamWatch),
    ],
    visitorSignals: [
      { detail: "Use Vercel Web Analytics for route-level visits after deploy.", label: "Visitors", tone: "teal", value: "Vercel Analytics" },
      { detail: "Use Vercel Speed Insights for real-user page performance.", label: "Performance", tone: "violet", value: "Speed Insights" },
      { detail: "Use Search Console for sitemap, indexing, query, and CTR checks.", label: "Search visibility", tone: "amber", value: "Search Console" },
    ],
    warnings,
  };
}

function emptyMetrics(warnings: string[]): AdminMetrics {
  return {
    collectorFeed: [],
    communityFeed: [],
    generatedAt: new Date().toISOString(),
    notes: [
      "No database metrics loaded yet.",
      "Keep service role keys server-only. Never expose them in browser code.",
    ],
    overview: [],
    recentRuns: [],
    reviewFunnel: [],
    visitorSignals: [
      { detail: "Deploy with Vercel Analytics, Speed Insights, and Search Console verification.", label: "Traffic plan", tone: "muted", value: "Dashboard pending" },
    ],
    warnings,
  };
}

function getSupabaseAdminConfig(): SupabaseAdminConfig | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.startsWith("sb_publishable_")) {
    return null;
  }

  return { serviceRoleKey, supabaseUrl };
}

async function fetchTableRows(
  config: SupabaseAdminConfig,
  table: string,
  limit = 2000,
): Promise<QueryResult<DbRow>> {
  const endpoint = new URL(`/rest/v1/${table}`, config.supabaseUrl);

  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      return {
        error: `${table} metrics unavailable (${response.status}).`,
        rows: [],
      };
    }

    return { rows: (await response.json()) as DbRow[] };
  } catch (error) {
    return { error: `${table} metrics unavailable: ${readError(error)}`, rows: [] };
  }
}

function metric(
  label: string,
  value: number | string,
  detail?: string,
  tone: AdminMetricTone = "muted",
): AdminMetricCard {
  return {
    detail,
    label,
    tone,
    value: typeof value === "number" ? formatNumber(value) : value,
  };
}

function funnel(
  label: string,
  collectorRows: DbRow[],
  communityRows: DbRow[],
  predicate: (row: DbRow) => boolean,
): AdminFunnelRow {
  return {
    collector: countWhere(collectorRows, predicate),
    community: countWhere(communityRows, predicate),
    detail: "Collector/API lane vs community upload lane.",
    label,
  };
}

function mapCollectorRun(row: CollectorRunRow): AdminRecentRun {
  return {
    dryRun: Boolean(row.dry_run),
    duplicates: row.duplicate_count ?? 0,
    errors: row.error_count ?? 0,
    fetched: row.fetched_count ?? 0,
    finishedAt: row.finished_at ? formatDateTime(row.finished_at) : undefined,
    id: row.id,
    inserted: row.inserted_count ?? 0,
    label: `${row.collector_name} - ${row.mode}`,
    mode: row.mode,
    startedAt: formatDateTime(row.started_at),
    status: row.status,
  };
}

function isCommunitySource(row: DbRow) {
  const platform = getText(row.platform).toLowerCase();
  const query = getText(row.search_query).toLowerCase();

  return (
    platform === "user_submission" ||
    platform === "user_screenshot" ||
    platform.startsWith("user_") ||
    query === "user_submission"
  );
}

function isApprovedRawSource(row: DbRow) {
  return getStatus(row) === "approved" || Boolean(row.approved_report_id);
}

function isFilteredRawSource(row: DbRow) {
  return FILTERED_STATUSES.has(getStatus(row));
}

function isHiddenReport(row: DbRow) {
  return Boolean(row.hidden_at) || getText(row.public_status).toLowerCase() === "hidden";
}

function isLowContext(row: DbRow) {
  const score = Number(row.curation_score ?? 0);
  const label = getText(row.curation_label).toLowerCase();

  return getStatus(row) === "low_context" || label.includes("low") || score < 25;
}

function isPrivateOrSensitive(row: DbRow) {
  return getStatus(row) === "private_or_sensitive" || Boolean(row.possible_private_location);
}

function isSpamWatch(row: DbRow) {
  const status = getStatus(row);

  return (
    status === "duplicate" ||
    status === "possible_ai_generated" ||
    status === "possible_joke" ||
    isLowContext(row) ||
    isPrivateOrSensitive(row)
  );
}

function isStrongCandidate(row: DbRow) {
  const score = Number(row.curation_score ?? 0);
  const label = getText(row.curation_label).toLowerCase();

  return score >= 75 || label.includes("strong") || label.includes("good");
}

function countPending(rows: DbRow[]) {
  return countWhere(rows, (row) => ["new", "needs_review"].includes(getStatus(row)));
}

function countFiltered(rows: DbRow[]) {
  return countWhere(rows, isFilteredRawSource);
}

function countWhere<T>(rows: T[], predicate: (row: T) => boolean) {
  return rows.reduce((total, row) => total + (predicate(row) ? 1 : 0), 0);
}

function getStatus(row: DbRow) {
  return getText(row.status).toLowerCase() || "new";
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toneForQueue(count: number): AdminMetricTone {
  if (count >= 20) {
    return "ember";
  }

  return count >= 5 ? "amber" : "teal";
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
