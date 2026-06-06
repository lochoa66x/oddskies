#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  collectFediverse,
  createFediverseCollectorConfig,
} from "../lib/collectors/fediverse-core.mjs";

loadLocalEnv();

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const config = createFediverseCollectorConfig(process.env, {
  dryRun: options.dryRun,
  limit: options.limit,
  sources: options.sources,
});

const run = await startCollectorRun(config, "manual");
let summary;

try {
  summary = await collectFediverse(config);
} catch (error) {
  summary = makeFailedSummary(config, error);
}

await finishCollectorRun(run, summary);

console.log(JSON.stringify(summary, null, 2));

if (summary.errors.length > 0) {
  process.exitCode = 1;
}

function parseArgs(args) {
  const parsed = {
    dryRun: false,
    help: false,
    limit: 10,
    sources: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--limit") {
      parsed.limit = clampLimit(Number(args[index + 1]));
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const source = args[index + 1];

      if (source) {
        parsed.sources.push(source);
      }

      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function clampLimit(value) {
  if (!Number.isFinite(value)) {
    return 10;
  }

  return Math.max(1, Math.min(10, Math.floor(value)));
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

function printHelp() {
  console.log(`OddSkies Fediverse collector prototype

Usage:
  npm run collect:fediverse -- --dry-run
  npm run collect:fediverse -- --dry-run --source "mastodon.social|ufo" --limit 5
  npm run collect:fediverse -- --source "mastodon.social|paranormal|Paranormal" --limit 3

Source config:
  ODDSKIES_FEDIVERSE_SOURCES can be JSON or one source per line:
  instance.example|tag|Optional Category

Required for inserts:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Safety:
  Fediverse rows go only into public.raw_sources. They are never promoted to
  public.reports without manual review.
`);
}

async function startCollectorRun(config, mode) {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return {
      id: null,
      warning:
        "Collector run logging skipped because Supabase server credentials are missing.",
    };
  }

  if (config.supabaseServiceRoleKey.startsWith("sb_publishable_")) {
    return {
      id: null,
      warning:
        "Collector run logging skipped because SUPABASE_SERVICE_ROLE_KEY is not server-only.",
    };
  }

  try {
    const endpoint = new URL("/rest/v1/collector_runs", config.supabaseUrl);
    const response = await fetch(endpoint, {
      body: JSON.stringify({
        collector_name: "fediverse-tags",
        dry_run: config.dryRun,
        mode,
        platform: "fediverse",
        query_count: config.sources.length,
        status: "started",
      }),
      headers: {
        ...supabaseHeaders(config),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      method: "POST",
    });

    if (!response.ok) {
      return {
        id: null,
        warning: `Collector run logging skipped (${response.status}): ${await readResponseText(response)}`,
      };
    }

    const rows = await response.json().catch(() => []);

    return {
      id: typeof rows[0]?.id === "string" ? rows[0].id : null,
      warning: null,
    };
  } catch (error) {
    return {
      id: null,
      warning: `Collector run logging skipped: ${formatError(error)}`,
    };
  }
}

async function finishCollectorRun(run, summary) {
  if (run.warning) {
    summary.warnings.push(run.warning);
  }

  if (!run.id) {
    return;
  }

  try {
    const endpoint = new URL("/rest/v1/collector_runs", config.supabaseUrl);

    endpoint.searchParams.set("id", `eq.${run.id}`);

    await fetch(endpoint, {
      body: JSON.stringify({
        duplicate_count: summary.totals.duplicatesSkipped,
        error_count: summary.errors.length,
        error_message: summary.errors[0] ?? null,
        fetched_count: summary.totals.fetched,
        finished_at: new Date().toISOString(),
        inserted_count: summary.totals.inserted,
        query_count: summary.queries.length,
        status: inferCollectorRunStatus(summary),
        summary,
      }),
      headers: {
        ...supabaseHeaders(config),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      method: "PATCH",
    });

    summary.runId = run.id;
  } catch (error) {
    summary.warnings.push(`Collector run finish logging failed: ${formatError(error)}`);
  }
}

function makeFailedSummary(config, error) {
  return {
    dryRun: config.dryRun,
    errors: [formatError(error)],
    queries: [],
    sources: [],
    totals: {
      duplicatesSkipped: 0,
      emptySkipped: 0,
      exclusionsSkipped: 0,
      fetched: 0,
      inserted: 0,
      insertedIds: [],
      normalized: 0,
    },
    warnings: [],
  };
}

function inferCollectorRunStatus(summary) {
  if (summary.errors.length > 0 && summary.queries.length === 0) {
    return "failed";
  }

  return summary.errors.length > 0 ? "completed_with_errors" : "completed";
}

function supabaseHeaders(config) {
  return {
    apikey: config.supabaseServiceRoleKey,
    Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
  };
}

async function readResponseText(response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}
