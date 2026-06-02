#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
];

const PROMOTABLE_STATUSES = new Set(["new", "needs_review"]);
const BLOCKED_STATUSES = new Set([
  "approved",
  "rejected",
  "duplicate",
  "low_context",
  "private_or_sensitive",
  "possible_joke",
  "possible_ai_generated",
]);

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

const result = await runPromotion(config, options);

console.log(JSON.stringify(result, null, 2));

if (result.errors.length > 0) {
  process.exitCode = 1;
}

async function runPromotion(runtimeConfig, runtimeOptions) {
  const errors = validateRuntime(runtimeConfig);

  if (errors.length > 0) {
    return { errors };
  }

  if (runtimeOptions.list) {
    const rows = await listRawSources(runtimeConfig, runtimeOptions);

    return {
      errors: [],
      rows: rows.map(formatListRow),
    };
  }

  if (runtimeOptions.confirm && runtimeOptions.dryRun) {
    return {
      errors: ["Use either --confirm or --dry-run, not both."],
    };
  }

  const rawSource = runtimeOptions.latest
    ? await fetchLatestRawSource(runtimeConfig)
    : await fetchRawSource(runtimeConfig, runtimeOptions.id);

  if (!rawSource) {
    return {
      errors: [
        runtimeOptions.latest
          ? "No promotable raw source was found."
          : "Raw source not found. Check the id and try again.",
      ],
    };
  }

  const safetyErrors = getSafetyErrors(rawSource);

  if (safetyErrors.length > 0) {
    return {
      errors: safetyErrors,
      rawSource: formatRawSourcePreview(rawSource),
    };
  }

  const reportDraft = buildReportDraft(rawSource, runtimeOptions);

  if (!runtimeOptions.confirm || runtimeOptions.dryRun) {
    return {
      dryRun: true,
      errors: [],
      message:
        "Preview only. Re-run with --confirm to publish this draft into public.reports.",
      rawSource: formatRawSourcePreview(rawSource),
      reportDraft,
    };
  }

  const insertedReport = await insertReport(runtimeConfig, reportDraft);
  await markRawSourceApproved(runtimeConfig, rawSource, insertedReport.id, runtimeOptions);

  return {
    dryRun: false,
    errors: [],
    message:
      "Raw source promoted into public.reports. It remains unverified by default.",
    rawSourceId: rawSource.id,
    reportId: insertedReport.id,
    report: reportDraft,
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

  endpoint.searchParams.set(
    "select",
    "id,platform,status,category_guess,author_handle,posted_at,collected_at,raw_title,source_url",
  );
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

async function fetchLatestRawSource(runtimeConfig) {
  const [row] = await listRawSources(runtimeConfig, {
    limit: 1,
    status: "new,needs_review",
  });

  return row ? fetchRawSource(runtimeConfig, row.id) : null;
}

async function fetchRawSource(runtimeConfig, id) {
  if (!id) {
    return null;
  }

  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", "*");
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

  return Array.isArray(rows) ? rows[0] ?? null : null;
}

function getSafetyErrors(rawSource) {
  const errors = [];
  const status = readString(rawSource.status) ?? "";

  if (rawSource.approved_report_id) {
    errors.push(
      "This raw source already has an approved_report_id and cannot be promoted again.",
    );
  }

  if (BLOCKED_STATUSES.has(status)) {
    errors.push(
      `Raw source status is "${status}" and cannot be promoted. Use review:raw to return it to needs_review only after manual review.`,
    );
  } else if (!PROMOTABLE_STATUSES.has(status)) {
    errors.push(
      `Raw source status is "${status}". Only new or needs_review rows can be promoted.`,
    );
  }

  if (!readString(rawSource.raw_text) && !readString(rawSource.raw_title)) {
    errors.push("Raw source has no usable title or text.");
  }

  if (
    rawSource.possible_private_location ||
    rawSource.location_resolution === "private_or_sensitive" ||
    rawSource.location_warnings?.includes("possible_private_location")
  ) {
    errors.push(
      "This raw source has a private/sensitive location warning and cannot be promoted by default.",
    );
  }

  return errors;
}

function buildReportDraft(rawSource, runtimeOptions) {
  const sourceHandle = readString(rawSource.author_handle);
  const rawText = readString(rawSource.raw_text) ?? "";
  const platformLabel = formatPlatformName(rawSource.platform);
  const category =
    runtimeOptions.overrides.category ??
    readString(rawSource.category_guess) ??
    "Unknown";
  const sourceName =
    runtimeOptions.overrides.sourceName ??
    (sourceHandle ? `${platformLabel} / @${sourceHandle}` : platformLabel);

  return pickReportColumns({
    category,
    confidence_label:
      runtimeOptions.overrides.confidenceLabel ?? "Needs human review",
    country:
      runtimeOptions.overrides.country ??
      readString(rawSource.normalized_country) ??
      readString(rawSource.extracted_country_guess) ??
      null,
    event_datetime:
      runtimeOptions.overrides.eventDateTime ??
      readString(rawSource.event_datetime_guess) ??
      readString(rawSource.posted_at) ??
      readString(rawSource.collected_at),
    has_media: Boolean(readString(rawSource.raw_media_url)),
    is_featured: false,
    latitude:
      runtimeOptions.overrides.latitude ?? readNumber(rawSource.normalized_latitude),
    location_confidence: readString(rawSource.location_confidence),
    location_name:
      runtimeOptions.overrides.locationName ??
      readString(rawSource.normalized_location_name) ??
      readString(rawSource.extracted_location_text) ??
      readString(rawSource.location_hint) ??
      "Location under review",
    location_resolution: readString(rawSource.location_resolution),
    location_warnings: rawSource.location_warnings ?? [],
    longitude:
      runtimeOptions.overrides.longitude ?? readNumber(rawSource.normalized_longitude),
    media_url: readString(rawSource.raw_media_url),
    region:
      runtimeOptions.overrides.region ??
      readString(rawSource.normalized_region) ??
      readString(rawSource.extracted_region_guess) ??
      "Unknown",
    reported_datetime:
      runtimeOptions.overrides.reportedDateTime ??
      readString(rawSource.posted_at) ??
      readString(rawSource.collected_at),
    source_name: sourceName,
    source_type:
      runtimeOptions.overrides.sourceType ?? formatPlatformSourceType(rawSource.platform),
    source_url:
      runtimeOptions.overrides.sourceUrl ?? readString(rawSource.source_url),
    summary:
      runtimeOptions.overrides.summary ??
      makeSummary(rawText) ??
      "A public source was staged for OddSkies review.",
    title:
      runtimeOptions.overrides.title ??
      readString(rawSource.raw_title) ??
      makeTitle(rawText) ??
      "Untitled strange report",
    verification_status: "Unverified",
  });
}

function pickReportColumns(report) {
  return Object.fromEntries(
    REPORT_COLUMNS.map((column) => [column, report[column] ?? null]),
  );
}

async function insertReport(runtimeConfig, reportDraft) {
  const endpoint = new URL("/rest/v1/reports", runtimeConfig.supabaseUrl);
  const response = await fetch(endpoint, {
    body: JSON.stringify(reportDraft),
    headers: {
      ...supabaseHeaders(runtimeConfig),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`reports insert failed (${response.status}): ${body}`);
  }

  const rows = await response.json();

  if (!Array.isArray(rows) || !rows[0]?.id) {
    throw new Error("reports insert did not return a report id.");
  }

  return rows[0];
}

async function markRawSourceApproved(
  runtimeConfig,
  rawSource,
  reportId,
  runtimeOptions,
) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);
  const reviewNotes = makeReviewNotes(rawSource, runtimeOptions);

  endpoint.searchParams.set("id", `eq.${rawSource.id}`);

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      approved_report_id: reportId,
      review_notes: reviewNotes,
      status: "approved",
    }),
    headers: {
      ...supabaseHeaders(runtimeConfig),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources update failed (${response.status}): ${body}`);
  }
}

function makeReviewNotes(rawSource, runtimeOptions) {
  const existing = readString(rawSource.review_notes);
  const note =
    runtimeOptions.overrides.notes ??
    `Promoted manually by scripts/promote-raw-source.mjs at ${new Date().toISOString()}.`;

  return existing ? `${existing}\n${note}` : note;
}

function formatListRow(row) {
  return {
    id: row.id,
    status: row.status,
    platform: row.platform,
    categoryGuess: row.category_guess,
    authorHandle: row.author_handle,
    postedAt: row.posted_at,
    collectedAt: row.collected_at,
    title: row.raw_title,
    sourceUrl: row.source_url,
  };
}

function formatRawSourcePreview(rawSource) {
  return {
    id: rawSource.id,
    platform: rawSource.platform,
    status: rawSource.status,
    categoryGuess: rawSource.category_guess,
    authorHandle: rawSource.author_handle,
    postedAt: rawSource.posted_at,
    collectedAt: rawSource.collected_at,
    title: rawSource.raw_title,
    textPreview: makeSummary(readString(rawSource.raw_text) ?? ""),
    sourceUrl: rawSource.source_url,
  };
}

function makeSummary(text) {
  const compact = compactText(text);

  if (!compact) {
    return null;
  }

  if (compact.length <= 260) {
    return compact;
  }

  return `${compact.slice(0, 257).trim()}...`;
}

function makeTitle(text) {
  const compact = compactText(text);

  if (!compact) {
    return null;
  }

  if (compact.length <= 72) {
    return compact;
  }

  return `${compact.slice(0, 69).trim()}...`;
}

function formatPlatformName(platform) {
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

function formatPlatformSourceType(platform) {
  const platformName = formatPlatformName(platform);

  return platformName === "Public source"
    ? "Public source"
    : `${platformName} post`;
}

function compactText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function readString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function parseArgs(args) {
  const parsed = {
    confirm: false,
    dryRun: false,
    help: false,
    id: null,
    latest: false,
    limit: 10,
    list: false,
    overrides: {},
    status: "new,needs_review",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--confirm") {
      parsed.confirm = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--latest") {
      parsed.latest = true;
      continue;
    }

    if (arg === "--list") {
      parsed.list = true;
      continue;
    }

    if (arg === "--id") {
      parsed.id = args[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      parsed.limit = clampLimit(Number(args[index + 1]));
      index += 1;
      continue;
    }

    if (arg === "--status") {
      parsed.status = args[index + 1] ?? parsed.status;
      index += 1;
      continue;
    }

    if (setStringOverride(parsed, arg, args[index + 1])) {
      index += 1;
      continue;
    }

    if (setNumberOverride(parsed, arg, args[index + 1])) {
      index += 1;
      continue;
    }

    if (!arg.startsWith("-") && !parsed.id) {
      parsed.id = arg;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!parsed.list && !parsed.latest && !parsed.id) {
    parsed.latest = true;
  }

  return parsed;
}

function setStringOverride(parsed, arg, value) {
  const keyByArg = {
    "--category": "category",
    "--confidence": "confidenceLabel",
    "--country": "country",
    "--event-datetime": "eventDateTime",
    "--location": "locationName",
    "--notes": "notes",
    "--region": "region",
    "--reported-datetime": "reportedDateTime",
    "--source-name": "sourceName",
    "--source-type": "sourceType",
    "--source-url": "sourceUrl",
    "--summary": "summary",
    "--title": "title",
  };

  const key = keyByArg[arg];

  if (!key) {
    return false;
  }

  parsed.overrides[key] = value ?? "";

  return true;
}

function setNumberOverride(parsed, arg, value) {
  const keyByArg = {
    "--lat": "latitude",
    "--latitude": "latitude",
    "--lng": "longitude",
    "--longitude": "longitude",
  };

  const key = keyByArg[arg];

  if (!key) {
    return false;
  }

  parsed.overrides[key] = readNumber(value);

  return true;
}

function clampLimit(value) {
  if (!Number.isFinite(value)) {
    return 10;
  }

  return Math.max(1, Math.min(50, Math.floor(value)));
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
  console.log(`OddSkies raw source promotion helper

Usage:
  npm run promote:raw -- --list
  npm run promote:raw -- --latest
  npm run promote:raw -- --id <raw_source_id>
  npm run promote:raw -- --id <raw_source_id> --confirm

Defaults:
  - Without --confirm, this prints a preview only.
  - --dry-run also previews only, for explicit safety checks.
  - Without --id, it previews the latest new/needs_review raw source.
  - Only new or needs_review rows can be promoted.

Useful review overrides:
  --title "Short public title"
  --summary "Reviewed public summary"
  --category "UFO / UAP"
  --location "Montreal, Quebec"
  --region "Quebec"
  --country "Canada"
  --lat 45.5017
  --lng -73.5673
  --confidence "Suspiciously Interesting"
  --notes "Reviewed source and preserved original link."

Required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`);
}
