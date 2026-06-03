import "server-only";

export type CollectorRunMode = "admin" | "manual" | "scheduled";

export type CollectorRunStatus =
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "started";

export type CollectorRunRow = {
  collector_name: string;
  created_at: string;
  dry_run: boolean;
  duplicate_count: number;
  error_count: number;
  error_message: string | null;
  fetched_count: number;
  finished_at: string | null;
  id: string;
  inserted_count: number;
  mode: CollectorRunMode;
  platform: string;
  query_count: number;
  started_at: string;
  status: CollectorRunStatus;
  summary: Record<string, unknown>;
};

export type CollectorRunSummary = {
  dateWindow?: {
    since?: string | null;
    until?: string | null;
  };
  dryRun?: boolean;
  errors?: string[];
  queries?: unknown[];
  totals?: {
    duplicatesSkipped?: number;
    fetched?: number;
    inserted?: number;
  };
};

type CreateCollectorRunInput = {
  collectorName: string;
  dryRun: boolean;
  mode: CollectorRunMode;
  platform: string;
  queryCount: number;
};

type FinishCollectorRunInput = {
  errorMessage?: string | null;
  status?: CollectorRunStatus;
  summary: CollectorRunSummary;
};

export async function createCollectorRun({
  collectorName,
  dryRun,
  mode,
  platform,
  queryCount,
}: CreateCollectorRunInput) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/collector_runs", config.supabaseUrl);
  const response = await supabaseFetch(config, endpoint, {
    body: JSON.stringify({
      collector_name: collectorName,
      dry_run: dryRun,
      mode,
      platform,
      query_count: queryCount,
      status: "started",
    }),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });
  const rows = (await response.json()) as CollectorRunRow[];

  if (!rows[0]?.id) {
    throw new Error("Collector run log did not return an id.");
  }

  return rows[0];
}

export async function finishCollectorRun(
  id: string,
  { errorMessage = null, status, summary }: FinishCollectorRunInput,
) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/collector_runs", config.supabaseUrl);
  const finalStatus = status ?? inferCollectorRunStatus(summary);

  endpoint.searchParams.set("id", `eq.${id}`);

  await supabaseFetch(config, endpoint, {
    body: JSON.stringify({
      duplicate_count: summary.totals?.duplicatesSkipped ?? 0,
      error_count: summary.errors?.length ?? 0,
      error_message: errorMessage,
      fetched_count: summary.totals?.fetched ?? 0,
      finished_at: new Date().toISOString(),
      inserted_count: summary.totals?.inserted ?? 0,
      query_count: summary.queries?.length ?? 0,
      status: finalStatus,
      summary,
    }),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "PATCH",
  });

  return finalStatus;
}

export async function listCollectorRuns(limit = 5) {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/collector_runs", config.supabaseUrl);

  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("order", "started_at.desc");
  endpoint.searchParams.set("limit", String(Math.max(1, Math.min(20, limit))));

  const response = await supabaseFetch(config, endpoint);

  return response.json() as Promise<CollectorRunRow[]>;
}

export function inferCollectorRunStatus(
  summary: CollectorRunSummary,
): CollectorRunStatus {
  const errors = summary.errors ?? [];
  const queries = summary.queries ?? [];
  const fetched = summary.totals?.fetched ?? 0;

  if (errors.length > 0 && queries.length === 0 && fetched === 0) {
    return "failed";
  }

  return errors.length > 0 ? "completed_with_errors" : "completed";
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

async function readResponseText(response: Response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}
