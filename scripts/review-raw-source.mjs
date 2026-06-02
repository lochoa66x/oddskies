#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REVIEW_STATUSES = new Set([
  "rejected",
  "duplicate",
  "low_context",
  "private_or_sensitive",
  "possible_joke",
  "possible_ai_generated",
  "needs_review",
]);

const REASON_REQUIRED_STATUSES = new Set([
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

const result = await runReview(config, options);

console.log(JSON.stringify(result, null, 2));

if (result.errors.length > 0) {
  process.exitCode = 1;
}

async function runReview(runtimeConfig, runtimeOptions) {
  const errors = validateRuntime(runtimeConfig);

  if (errors.length > 0) {
    return { errors };
  }

  if (!runtimeOptions.id) {
    return { errors: ["Missing raw source id."] };
  }

  if (!REVIEW_STATUSES.has(runtimeOptions.status)) {
    return {
      errors: [
        `Invalid review status "${runtimeOptions.status}". Use one of: ${[
          ...REVIEW_STATUSES,
        ].join(", ")}.`,
      ],
    };
  }

  if (
    REASON_REQUIRED_STATUSES.has(runtimeOptions.status) &&
    !runtimeOptions.reason
  ) {
    return {
      errors: [`A reason is required when marking a row as ${runtimeOptions.status}.`],
    };
  }

  const rawSource = await fetchRawSource(runtimeConfig, runtimeOptions.id);

  if (!rawSource) {
    return { errors: ["Raw source not found. Check the id and try again."] };
  }

  if (rawSource.approved_report_id || rawSource.status === "approved") {
    return {
      errors: [
        "This raw source is already approved and linked to a public report. Do not change it with review:raw.",
      ],
      rawSource: formatRawSourcePreview(rawSource),
    };
  }

  const patch = buildReviewPatch(rawSource, runtimeOptions);

  if (runtimeOptions.dryRun) {
    return {
      dryRun: true,
      errors: [],
      message: "Preview only. Re-run without --dry-run to update raw_sources.",
      patch,
      rawSource: formatRawSourcePreview(rawSource),
    };
  }

  await updateRawSource(runtimeConfig, rawSource.id, patch);

  return {
    dryRun: false,
    errors: [],
    message: `Raw source marked as ${runtimeOptions.status}.`,
    rawSourceId: rawSource.id,
    status: runtimeOptions.status,
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

async function fetchRawSource(runtimeConfig, id) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set(
    "select",
    "id,platform,status,approved_report_id,review_notes,rejection_reason,category_guess,author_handle,posted_at,collected_at,raw_title,raw_text,source_url",
  );
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

function buildReviewPatch(rawSource, runtimeOptions) {
  const reviewNote = makeReviewNote(rawSource, runtimeOptions);
  const patch = {
    review_notes: reviewNote,
    status: runtimeOptions.status,
  };

  if (REASON_REQUIRED_STATUSES.has(runtimeOptions.status)) {
    patch.rejection_reason = runtimeOptions.reason;
  }

  if (runtimeOptions.status === "needs_review") {
    patch.rejection_reason = null;
  }

  return patch;
}

function makeReviewNote(rawSource, runtimeOptions) {
  const existing = readString(rawSource.review_notes);
  const reason = runtimeOptions.reason ? ` Reason: ${runtimeOptions.reason}` : "";
  const note = `Marked ${runtimeOptions.status} by scripts/review-raw-source.mjs at ${new Date().toISOString()}.${reason}`;

  return existing ? `${existing}\n${note}` : note;
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
    throw new Error(`raw_sources update failed (${response.status}): ${body}`);
  }
}

function formatRawSourcePreview(rawSource) {
  return {
    id: rawSource.id,
    platform: rawSource.platform,
    status: rawSource.status,
    approvedReportId: rawSource.approved_report_id,
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
  const compact = text.replace(/\s+/g, " ").trim();

  if (compact.length <= 220) {
    return compact;
  }

  return `${compact.slice(0, 217).trim()}...`;
}

function parseArgs(args) {
  const parsed = {
    dryRun: false,
    help: false,
    id: null,
    reason: "",
    status: "",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--id") {
      parsed.id = args[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--status") {
      parsed.status = normalizeStatus(args[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (arg === "--reason") {
      parsed.reason = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (!arg.startsWith("-") && !parsed.id) {
      parsed.id = arg;
      continue;
    }

    if (!arg.startsWith("-") && !parsed.status) {
      parsed.status = normalizeStatus(arg);
      continue;
    }

    if (!arg.startsWith("-")) {
      parsed.reason = [parsed.reason, arg].filter(Boolean).join(" ");
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function normalizeStatus(value) {
  return value.trim().toLowerCase().replace(/-/g, "_");
}

function readString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
  console.log(`OddSkies raw source review helper

Usage:
  npm run review:raw -- <raw_source_id> rejected "reason here"
  npm run review:raw -- <raw_source_id> duplicate "same source already staged"
  npm run review:raw -- <raw_source_id> low_context "not enough detail"
  npm run review:raw -- <raw_source_id> private_or_sensitive "contains personal info"
  npm run review:raw -- <raw_source_id> possible_joke "satire account"
  npm run review:raw -- <raw_source_id> possible_ai_generated "synthetic-looking media"
  npm run review:raw -- <raw_source_id> needs_review

Options:
  --dry-run        Preview the raw_sources update without saving it.
  --id <id>        Raw source id.
  --status <name>  Review status.
  --reason <text>  Review reason.

Notes:
  - Approved rows cannot be changed by this helper.
  - Non-review statuses require a reason.
  - This updates public.raw_sources only. It never writes public.reports.

Required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`);
}
