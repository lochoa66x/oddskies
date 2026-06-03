#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  enrichReportDraft,
  pickReportEnrichmentColumns,
} from "../lib/reports/enrich-report-core.mjs";

loadLocalEnv();

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const config = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

const result = await runReportEnrichment(config, options).catch((error) => ({
  errors: [formatError(error)],
}));

console.log(JSON.stringify(result, null, 2));

if (result.errors.length > 0) {
  process.exitCode = 1;
}

async function runReportEnrichment(runtimeConfig, runtimeOptions) {
  const errors = validateRuntime(runtimeConfig);

  if (errors.length > 0) {
    return { errors };
  }

  if (runtimeOptions.confirm && runtimeOptions.dryRun) {
    return { errors: ["Use either --confirm or --dry-run, not both."] };
  }

  const dryRun = !runtimeOptions.confirm;
  const rows = runtimeOptions.id
    ? await fetchReport(runtimeConfig, runtimeOptions.id)
    : await listReports(runtimeConfig, runtimeOptions);
  const enrichedRows = [];

  for (const report of rows) {
    const enrichment = enrichReportDraft(report);
    const patch = {
      ...pickReportEnrichmentColumns(enrichment),
      verification_status: readString(report.verification_status) ?? "Unverified",
    };

    enrichedRows.push({
      id: report.id,
      title: report.title,
      displayTitle: enrichment.display_title,
      shortLabel: enrichment.short_label,
      moodLabel: enrichment.mood_label,
      sourceQuality: enrichment.source_quality_label,
      oracleReady: enrichment.oracle_ready,
      reasons: enrichment.source_quality_reasons,
      notes: enrichment.enrichment_notes,
    });

    if (!dryRun) {
      await updateReport(runtimeConfig, report.id, patch);
    }
  }

  return {
    dryRun,
    errors: [],
    message: dryRun
      ? "Preview only. Re-run with --confirm to update public.reports enrichment fields."
      : "Updated public.reports enrichment fields. Reports remain unverified.",
    rows: enrichedRows,
    total: enrichedRows.length,
  };
}

function validateRuntime(runtimeConfig) {
  const errors = [];

  if (!runtimeConfig.supabaseUrl) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!runtimeConfig.supabaseServiceRoleKey) {
    errors.push("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  if (runtimeConfig.supabaseServiceRoleKey?.startsWith("sb_publishable_")) {
    errors.push(
      "SUPABASE_SERVICE_ROLE_KEY looks like a publishable key. Use the server-only secret key.",
    );
  }

  return errors;
}

async function listReports(runtimeConfig, runtimeOptions) {
  const endpoint = new URL("/rest/v1/reports", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("order", "event_datetime.desc");
  endpoint.searchParams.set("limit", String(runtimeOptions.limit));

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`reports list failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function fetchReport(runtimeConfig, id) {
  const endpoint = new URL("/rest/v1/reports", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`reports fetch failed (${response.status}): ${body}`);
  }

  const rows = await response.json();

  return Array.isArray(rows) && rows[0] ? [rows[0]] : [];
}

async function updateReport(runtimeConfig, id, patch) {
  const endpoint = new URL("/rest/v1/reports", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("id", `eq.${id}`);

  const response = await fetch(endpoint, {
    body: JSON.stringify(patch),
    headers: {
      ...supabaseHeaders(runtimeConfig),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`reports enrichment update failed (${response.status}): ${body}`);
  }
}

function parseArgs(args) {
  const parsed = {
    confirm: false,
    dryRun: false,
    help: false,
    id: "",
    limit: 50,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--confirm") {
      parsed.confirm = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--id") {
      parsed.id = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      parsed.limit = clampLimit(Number(args[index + 1]));
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function clampLimit(value) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(1, Math.min(200, Math.floor(value)));
}

function supabaseHeaders(runtimeConfig) {
  return {
    apikey: runtimeConfig.supabaseServiceRoleKey,
    Authorization: `Bearer ${runtimeConfig.supabaseServiceRoleKey}`,
  };
}

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), filename);

    if (!existsSync(path)) {
      continue;
    }

    const contents = readFileSync(path, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [rawKey, ...valueParts] = trimmed.split("=");
      const key = rawKey.trim();
      const value = stripQuotes(valueParts.join("=").trim());

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function readString(value) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

async function readResponseText(response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}

function printHelp() {
  console.log(`OddSkies public report enrichment

Usage:
  npm run enrich:reports
  npm run enrich:reports -- --limit 20 --dry-run
  npm run enrich:reports -- --id <report_id>
  npm run enrich:reports -- --limit 20 --confirm

Safety:
  - Preview mode is the default.
  - Use --confirm to update public.reports enrichment fields.
  - This script never reads raw_sources.
  - This script never verifies sightings or claims.
  - Source quality labels describe context richness only.
`);
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
