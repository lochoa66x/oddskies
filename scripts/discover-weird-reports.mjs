#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  collectBluesky,
  createBlueskyCollectorConfig,
  discoverBlueskyCandidates,
} from "../lib/collectors/bluesky-core.mjs";

loadLocalEnv();

let options;

try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(`Discovery setup failed: ${error.message}`);
  console.error("Run with --help for usage.");
  process.exit(1);
}

if (options.help) {
  printHelp();
  process.exit(0);
}

const dryRun = options.dryRun || !options.stage;
const config = createBlueskyCollectorConfig(process.env, {
  dryRun: true,
  limit: options.limit,
  queries: [options.query],
  since: options.since,
  until: options.until,
});

const discovery = await discoverBlueskyCandidates(config);
const shortlist = makeShortlist(discovery, options.category);

printShortlist(shortlist, discovery, {
  dryRun,
  stage: options.stage,
});

if (discovery.errors.length > 0) {
  process.exitCode = 1;
}

if (dryRun || discovery.errors.length > 0) {
  process.exit();
}

const stageConfig = createBlueskyCollectorConfig(process.env, {
  dryRun: false,
  limit: options.limit,
  queries: [options.query],
  since: options.since,
  until: options.until,
});
stageConfig.safetyGate = shouldHoldCandidate;
const stageSummary = await collectBluesky(stageConfig);

console.log("\nStaging result");
console.log(JSON.stringify(stageSummary, null, 2));

if (stageSummary.errors.length > 0) {
  process.exitCode = 1;
}

function parseArgs(args) {
  const parsed = {
    category: null,
    dryRun: false,
    help: false,
    limit: 5,
    query: null,
    since: null,
    stage: false,
    until: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--category") {
      parsed.category = readNextValue(args, index, arg);
      index += 1;
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

    if (arg === "--limit") {
      parsed.limit = clampLimit(Number(readNextValue(args, index, arg)));
      index += 1;
      continue;
    }

    if (arg === "--query") {
      parsed.query = readNextValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--since") {
      parsed.since = readNextValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--stage" || arg === "--confirm") {
      parsed.stage = true;
      continue;
    }

    if (arg === "--until") {
      parsed.until = readNextValue(args, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (parsed.help) {
    return parsed;
  }

  if (!parsed.query) {
    throw new Error("Missing --query. Try --query \"ufo sighting\".");
  }

  if (parsed.dryRun && parsed.stage) {
    throw new Error("Use either --dry-run or --stage, not both.");
  }

  return parsed;
}

function readNextValue(args, index, flag) {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function clampLimit(value) {
  if (!Number.isFinite(value)) {
    return 5;
  }

  return Math.max(1, Math.min(10, Math.floor(value)));
}

function makeShortlist(discovery, requestedCategory) {
  return discovery.queries.flatMap((querySummary) =>
    querySummary.candidates.map((candidate, index) => {
      const rawSource = candidate.rawSource;
      const text = rawSource.raw_text ?? "";
      const title = rawSource.raw_title ?? firstSentence(text) ?? "Untitled signal";
      const category = requestedCategory ?? rawSource.category_guess ?? "Unknown";
      const warnings = findWarnings(rawSource, candidate);

      return {
        category,
        eventOrReportedDate: rawSource.event_datetime_guess ?? rawSource.posted_at ?? null,
        locationGuess: guessLocation(text),
        platform: rawSource.platform ?? "unknown",
        rank: index + 1,
        reportedDate: rawSource.posted_at ?? null,
        source: rawSource.author_handle
          ? `${rawSource.platform} / @${rawSource.author_handle}`
          : rawSource.platform ?? "unknown",
        sourceUrl: rawSource.source_url ?? null,
        summary: summarize(text),
        title,
        warnings,
        whyFit: explainFit({ category, query: querySummary.query, rawSource, warnings }),
      };
    }),
  );
}

function findWarnings(rawSource, candidate) {
  const warnings = [];
  const text = `${rawSource.raw_title ?? ""} ${rawSource.raw_text ?? ""}`.toLowerCase();

  if ((rawSource.raw_text ?? "").replace(/\s+/g, " ").trim().length < 120) {
    warnings.push("low context");
  }

  if (!rawSource.source_url) {
    warnings.push("missing source link");
  }

  if (candidate.duplicateRisk) {
    warnings.push("duplicate risk");
  }

  if (/\b(sale|shop|buy|discount|promo|coupon|amazon|kindle|available now)\b/.test(text)) {
    warnings.push("promotional or ad-like");
  }

  if (/\b(joke|satire|meme|parody|lol|haha)\b/.test(text)) {
    warnings.push("satire or joke risk");
  }

  if (/\b(address|apartment|phone number|private property|home address)\b/.test(text)) {
    warnings.push("possible sensitive/private detail");
  }

  if (!rawSource.category_guess || rawSource.category_guess === "Unknown") {
    warnings.push("category needs human review");
  }

  return warnings;
}

function shouldHoldCandidate(rawSource) {
  const blockingWarnings = new Set([
    "low context",
    "missing source link",
    "promotional or ad-like",
    "satire or joke risk",
    "possible sensitive/private detail",
  ]);
  const warnings = findWarnings(rawSource, { duplicateRisk: false });
  const warning = warnings.find((item) => blockingWarnings.has(item));

  return warning ? `Discovery safety gate: ${warning}` : null;
}

function explainFit({ category, query, rawSource, warnings }) {
  const reasons = [
    `matched query "${query}"`,
    `category guess: ${category}`,
  ];

  if (rawSource.source_url) {
    reasons.push("source link captured");
  }

  if (!warnings.includes("low context")) {
    reasons.push("enough text for a first pass");
  }

  return reasons.join("; ");
}

function guessLocation(text) {
  const match = text.match(
    /\b(?:near|in|over|above|around|outside)\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3})/,
  );

  return match ? match[1].replace(/[.,;:!?]+$/, "") : "Unknown";
}

function summarize(text) {
  const compact = text.replace(/#[\p{L}\p{N}_-]+/gu, "").replace(/\s+/g, " ").trim();

  if (compact.length <= 220) {
    return compact || "No usable public text captured.";
  }

  const sliced = compact.slice(0, 220);
  const lastSpace = sliced.lastIndexOf(" ");

  return `${sliced.slice(0, Math.max(120, lastSpace)).trim()}...`;
}

function firstSentence(text) {
  const compact = text.replace(/\s+/g, " ").trim();
  const sentence = compact.match(/^[^.!?]+[.!?]/);

  return sentence ? sentence[0] : null;
}

function printShortlist(shortlist, discovery, { dryRun, stage }) {
  console.log("OddSkies Discovery Assistant");
  console.log(
    dryRun
      ? "Mode: dry run. Nothing will be staged."
      : "Mode: stage candidates. Rows still go only to raw_sources.",
  );
  console.log(
    `Window: ${discovery.dateWindow.since ?? "open"} to ${discovery.dateWindow.until ?? "open"}`,
  );
  console.log(
    `Fetched ${discovery.totals.fetched}, candidates ${discovery.totals.candidates}, duplicate risks ${discovery.totals.duplicateRisk}.`,
  );

  if (!stage) {
    console.log("Add --stage when you intentionally want to write raw_sources rows.");
  }

  if (discovery.warnings.length > 0) {
    console.log("\nWarnings");
    for (const warning of discovery.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (discovery.errors.length > 0) {
    console.log("\nErrors");
    for (const error of discovery.errors) {
      console.log(`- ${error}`);
    }
  }

  console.log("\nHuman-review shortlist");

  if (shortlist.length === 0) {
    console.log("- No candidates found. The sky is quiet, or the query needs better bait.");
    return;
  }

  for (const item of shortlist) {
    console.log(`\n${item.rank}. ${item.title}`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Location guess: ${item.locationGuess}`);
    console.log(`   Event/reported date: ${item.eventOrReportedDate ?? "Unknown"}`);
    console.log(`   Source: ${item.source}`);
    console.log(`   URL: ${item.sourceUrl ?? "Missing"}`);
    console.log(`   Summary: ${item.summary}`);
    console.log(`   Why it may fit: ${item.whyFit}`);
    console.log(
      `   Warnings: ${item.warnings.length > 0 ? item.warnings.join(", ") : "none obvious"}`,
    );
  }
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
  console.log(`OddSkies Discovery Assistant

Usage:
  npm run discover:weird -- --query "ufo sighting" --dry-run
  npm run discover:weird -- --query "haunted road" --category "Haunted Places" --limit 5
  npm run discover:weird -- --query "strange lights" --since 2026-06-01 --until 2026-06-03 --stage

Options:
  --query       Required search phrase.
  --category    Optional human hint for the review shortlist.
  --limit       1 to 10 candidates per query. Defaults to 5.
  --since       Optional YYYY-MM-DD or ISO start date.
  --until       Optional YYYY-MM-DD or ISO end date.
  --dry-run     Preview only. Nothing is written.
  --stage       Write candidates to public.raw_sources only.

Safety:
  Discovery finds leads, not facts. Staged rows stay private in raw_sources
  until a human reviews and promotes them. Public reports remain unverified.
`);
}
