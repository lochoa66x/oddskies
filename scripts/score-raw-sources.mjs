#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { scoreRawSource } from "../lib/curation/score-raw-source-core.mjs";

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
  "approved_report_id",
].join(",");

const SCORE_COLUMNS = [
  "curation_score",
  "curation_label",
  "curation_reasons",
  "has_location_hint",
  "has_time_hint",
  "has_media_hint",
  "possible_private_location",
  "possible_joke",
  "possible_ai_generated",
  "possible_duplicate",
  "extracted_location_text",
  "extracted_region_guess",
  "extracted_country_guess",
  "extracted_event_datetime_text",
  "normalized_title",
  "normalized_summary",
  "last_scored_at",
];

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

const result = await runScoring(config, options);

console.log(JSON.stringify(result, null, 2));

if (result.errors.length > 0) {
  process.exitCode = 1;
}

async function runScoring(runtimeConfig, runtimeOptions) {
  const errors = validateRuntime(runtimeConfig);

  if (errors.length > 0) {
    return { errors };
  }

  if (runtimeOptions.confirm && runtimeOptions.dryRun) {
    return { errors: ["Use either --confirm or --dry-run, not both."] };
  }

  const dryRun = !runtimeOptions.confirm;
  const rows = runtimeOptions.id
    ? await fetchRawSource(runtimeConfig, runtimeOptions.id)
    : await listRawSources(runtimeConfig, runtimeOptions);
  const scored = [];

  for (const rawSource of rows) {
    const possibleDuplicate = await hasPossibleDuplicate(runtimeConfig, rawSource);
    const score = scoreRawSource(rawSource, { possibleDuplicate });
    const patch = pickScoreColumns(score);

    scored.push({
      id: rawSource.id,
      label: score.curation_label,
      possibleAiGenerated: score.possible_ai_generated,
      possibleDuplicate: score.possible_duplicate,
      possibleJoke: score.possible_joke,
      possiblePrivateLocation: score.possible_private_location,
      reasons: score.curation_reasons,
      score: score.curation_score,
      title: score.normalized_title ?? rawSource.raw_title,
    });

    if (!dryRun) {
      await updateRawSource(runtimeConfig, rawSource.id, patch);
    }
  }

  return {
    dryRun,
    errors: [],
    message: dryRun
      ? "Preview only. Re-run with --confirm to update raw_sources scoring fields."
      : "Updated raw_sources scoring fields. No statuses or public reports were changed.",
    rows: scored,
    total: scored.length,
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

async function listRawSources(runtimeConfig, runtimeOptions) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", RAW_SOURCE_SELECT);
  endpoint.searchParams.set("order", "collected_at.desc");
  endpoint.searchParams.set("limit", String(runtimeOptions.limit));

  if (runtimeOptions.status !== "all") {
    endpoint.searchParams.set("status", `in.(${runtimeOptions.status})`);
  }

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources list failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function fetchRawSource(runtimeConfig, id) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", RAW_SOURCE_SELECT);
  endpoint.searchParams.set("id", `eq.${id}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources fetch failed (${response.status}): ${body}`);
  }

  const rows = await response.json();

  return Array.isArray(rows) && rows[0] ? [rows[0]] : [];
}

async function hasPossibleDuplicate(runtimeConfig, rawSource) {
  if (
    rawSource.source_post_id &&
    (await duplicateExists(
      runtimeConfig,
      rawSource,
      "source_post_id",
      rawSource.source_post_id,
    ))
  ) {
    return true;
  }

  if (
    rawSource.source_url &&
    (await duplicateExists(runtimeConfig, rawSource, "source_url", rawSource.source_url))
  ) {
    return true;
  }

  return false;
}

async function duplicateExists(runtimeConfig, rawSource, column, value) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("id", `neq.${rawSource.id}`);
  endpoint.searchParams.set("platform", `eq.${rawSource.platform}`);
  endpoint.searchParams.set(column, `eq.${value}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`duplicate check failed (${response.status}): ${body}`);
  }

  const rows = await response.json();

  return Array.isArray(rows) && rows.length > 0;
}

async function updateRawSource(runtimeConfig, id, patch) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

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
    throw new Error(`raw_sources score update failed (${response.status}): ${body}`);
  }
}

function pickScoreColumns(score) {
  return Object.fromEntries(SCORE_COLUMNS.map((column) => [column, score[column]]));
}

function parseArgs(args) {
  const parsed = {
    confirm: false,
    dryRun: false,
    help: false,
    id: "",
    limit: 50,
    status: "new,needs_review",
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

    if (arg === "--status") {
      parsed.status = normalizeStatus(args[index + 1] ?? "");
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function normalizeStatus(value) {
  const cleaned = value.trim().toLowerCase().replace(/-/g, "_");

  if (!cleaned || cleaned === "pending") {
    return "new,needs_review";
  }

  return cleaned;
}

function clampLimit(value) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(1, Math.min(100, Math.floor(value)));
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

async function readResponseText(response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}

function printHelp() {
  console.log(`OddSkies raw source curation scoring

Usage:
  npm run score:raw
  npm run score:raw -- --limit 20 --dry-run
  npm run score:raw -- --status new
  npm run score:raw -- --id <raw_source_id>
  npm run score:raw -- --limit 20 --confirm

Safety:
  - Preview mode is the default.
  - Use --confirm to update raw_sources scoring fields.
  - This script never changes status.
  - This script never writes public.reports.
  - Scores are review hints, not truth or verification.
`);
}
