#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  collectBluesky,
  createBlueskyCollectorConfig,
  DEFAULT_BLUESKY_QUERIES,
} from "../lib/collectors/bluesky-core.mjs";

loadLocalEnv();

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const config = createBlueskyCollectorConfig(process.env, {
  dryRun: options.dryRun,
  limit: options.limit,
  queries: options.queries.length > 0 ? options.queries : DEFAULT_BLUESKY_QUERIES,
});

const summary = await collectBluesky(config);

console.log(JSON.stringify(summary, null, 2));

if (summary.errors.length > 0) {
  process.exitCode = 1;
}

function parseArgs(args) {
  const parsed = {
    dryRun: false,
    help: false,
    limit: 10,
    queries: [],
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

    if (arg === "--query") {
      const query = args[index + 1];

      if (query) {
        parsed.queries.push(query);
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

  return Math.max(1, Math.min(25, Math.floor(value)));
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
  console.log(`OddSkies Bluesky collector prototype

Usage:
  npm run collect:bluesky
  npm run collect:bluesky -- --dry-run
  npm run collect:bluesky -- --query "ufo sighting" --limit 5

Required for inserts:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional Bluesky auth:
  BLUESKY_IDENTIFIER
  BLUESKY_APP_PASSWORD
  BLUESKY_SERVICE_URL=https://bsky.social
  BLUESKY_PUBLIC_API_URL=https://public.api.bsky.app

Safety:
  Collector rows go only into public.raw_sources. They are never promoted to
  public.reports without manual review.
`);
}
