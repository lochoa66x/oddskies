import "server-only";

import {
  ORACLE_PROMPT_VERSION,
  sanitizeOracleReading,
  type OracleReading,
} from "@/lib/oracle";
import type { Report } from "@/lib/reports";

type OracleCacheRow = {
  created_at?: unknown;
  prompt_version?: unknown;
  reading?: unknown;
};

type OracleCacheConfig = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

export async function getCachedOracleReading(report: Report, model: string) {
  const config = getOracleCacheConfig();

  if (!config) {
    return null;
  }

  try {
    const endpoint = new URL("/rest/v1/oracle_readings", config.supabaseUrl);
    endpoint.searchParams.set("select", "reading,created_at,prompt_version");
    endpoint.searchParams.set("report_id", `eq.${report.id}`);
    endpoint.searchParams.set("model", `eq.${model}`);
    endpoint.searchParams.set("prompt_version", `eq.${ORACLE_PROMPT_VERSION}`);
    endpoint.searchParams.set("order", "updated_at.desc");
    endpoint.searchParams.set("limit", "1");

    const response = await fetch(endpoint.toString(), {
      cache: "no-store",
      headers: getOracleCacheHeaders(config),
    });

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as OracleCacheRow[];
    const row = Array.isArray(rows) ? rows[0] : undefined;

    if (!row?.reading) {
      return null;
    }

    return {
      cachedAt: typeof row.created_at === "string" ? row.created_at : undefined,
      model,
      promptVersion:
        typeof row.prompt_version === "string"
          ? row.prompt_version
          : ORACLE_PROMPT_VERSION,
      reading: sanitizeOracleReading(row.reading, report),
      status: "cached" as const,
    };
  } catch (error) {
    console.warn("Oracle cache lookup failed", formatCacheError(error));
    return null;
  }
}

export async function saveOracleReading(
  report: Report,
  model: string,
  reading: OracleReading,
  status: "fallback" | "ready" = "ready",
) {
  const config = getOracleCacheConfig();

  if (!config) {
    return;
  }

  try {
    const endpoint = new URL("/rest/v1/oracle_readings", config.supabaseUrl);
    endpoint.searchParams.set(
      "on_conflict",
      "report_id,model,prompt_version",
    );

    const response = await fetch(endpoint.toString(), {
      body: JSON.stringify({
        model,
        prompt_version: ORACLE_PROMPT_VERSION,
        reading,
        report_id: report.id,
        status,
        updated_at: new Date().toISOString(),
      }),
      headers: {
        ...getOracleCacheHeaders(config),
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      method: "POST",
    });

    if (!response.ok) {
      console.warn("Oracle cache save failed", response.status);
    }
  } catch (error) {
    console.warn("Oracle cache save failed", formatCacheError(error));
  }
}

function getOracleCacheConfig(): OracleCacheConfig | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (serviceRoleKey.startsWith("sb_publishable_")) {
    return null;
  }

  return { serviceRoleKey, supabaseUrl };
}

function getOracleCacheHeaders(config: OracleCacheConfig) {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  };
}

function formatCacheError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
