#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_QUERIES = [
  "ufo sighting",
  "uap sighting",
  "strange lights",
  "orb in the sky",
  "what did I just see",
  "triangle lights",
  "weird lights",
  "haunted place",
  "ghost sighting",
  "local legend",
];

const RAW_SOURCE_COLUMNS = [
  "platform",
  "source_post_id",
  "source_url",
  "author_handle",
  "posted_at",
  "raw_title",
  "raw_text",
  "raw_media_url",
  "search_query",
  "language",
  "location_hint",
  "category_guess",
  "event_datetime_guess",
  "status",
  "review_notes",
  "rejection_reason",
  "approved_report_id",
];

loadLocalEnv();

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const config = {
  blueskyIdentifier: process.env.BLUESKY_IDENTIFIER,
  blueskyAppPassword: process.env.BLUESKY_APP_PASSWORD,
  blueskyPublicApiUrl:
    process.env.BLUESKY_PUBLIC_API_URL ?? "https://public.api.bsky.app",
  blueskyServiceUrl: process.env.BLUESKY_SERVICE_URL ?? "https://bsky.social",
  dryRun: options.dryRun,
  limit: options.limit,
  queries: options.queries.length > 0 ? options.queries : DEFAULT_QUERIES,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

const summary = await collectBluesky(config);

console.log(JSON.stringify(summary, null, 2));

if (summary.errors.length > 0) {
  process.exitCode = 1;
}

async function collectBluesky(runtimeConfig) {
  const summary = {
    dryRun: runtimeConfig.dryRun,
    errors: [],
    queries: [],
    totals: {
      duplicatesSkipped: 0,
      fetched: 0,
      inserted: 0,
      normalized: 0,
    },
    warnings: [],
  };

  if (!runtimeConfig.dryRun) {
    if (!runtimeConfig.supabaseUrl) {
      summary.errors.push(
        "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to the server environment.",
      );
      return summary;
    }

    if (!runtimeConfig.supabaseServiceRoleKey) {
      summary.errors.push(
        "Missing SUPABASE_SERVICE_ROLE_KEY. raw_sources is private, so the collector needs a server-only service key.",
      );
      return summary;
    }
  }

  const authToken = await createBlueskySession(runtimeConfig, summary);

  for (const query of runtimeConfig.queries) {
    const querySummary = {
      duplicatesSkipped: 0,
      errors: [],
      fetched: 0,
      inserted: 0,
      normalized: 0,
      query,
    };

    try {
      const posts = await searchBlueskyPosts({
        authToken,
        limit: runtimeConfig.limit,
        publicApiUrl: runtimeConfig.blueskyPublicApiUrl,
        query,
        serviceUrl: runtimeConfig.blueskyServiceUrl,
      });

      querySummary.fetched = posts.length;

      for (const post of posts) {
        const rawSource = normalizePost(post, query);

        if (!rawSource.raw_text && !rawSource.source_post_id) {
          continue;
        }

        querySummary.normalized += 1;

        if (runtimeConfig.dryRun) {
          continue;
        }

        const duplicate = await rawSourceExists(runtimeConfig, rawSource);

        if (duplicate) {
          querySummary.duplicatesSkipped += 1;
          continue;
        }

        await insertRawSource(runtimeConfig, rawSource);
        querySummary.inserted += 1;
      }
    } catch (error) {
      querySummary.errors.push(formatError(error));
    }

    summary.queries.push(querySummary);
    summary.totals.fetched += querySummary.fetched;
    summary.totals.normalized += querySummary.normalized;
    summary.totals.duplicatesSkipped += querySummary.duplicatesSkipped;
    summary.totals.inserted += querySummary.inserted;
    summary.errors.push(...querySummary.errors.map((error) => `${query}: ${error}`));
  }

  return summary;
}

async function createBlueskySession(runtimeConfig, summary) {
  if (!runtimeConfig.blueskyIdentifier || !runtimeConfig.blueskyAppPassword) {
    summary.warnings.push(
      "Bluesky credentials missing. Trying public AppView search only.",
    );
    return null;
  }

  const endpoint = new URL(
    "/xrpc/com.atproto.server.createSession",
    runtimeConfig.blueskyServiceUrl,
  );
  const response = await fetch(endpoint, {
    body: JSON.stringify({
      identifier: runtimeConfig.blueskyIdentifier,
      password: runtimeConfig.blueskyAppPassword,
    }),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "OddSkies collector prototype/1.0",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    summary.warnings.push(
      `Bluesky login failed (${response.status}). Trying public AppView search only. ${body}`,
    );
    return null;
  }

  const session = await response.json();

  return typeof session.accessJwt === "string" ? session.accessJwt : null;
}

async function searchBlueskyPosts({
  authToken,
  limit,
  publicApiUrl,
  query,
  serviceUrl,
}) {
  const baseUrl = authToken ? serviceUrl : publicApiUrl;
  const endpoint = new URL("/xrpc/app.bsky.feed.searchPosts", baseUrl);

  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("limit", String(limit));

  const headers = authToken
    ? {
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "OddSkies collector prototype/1.0",
      }
    : {
        "User-Agent": "OddSkies collector prototype/1.0",
      };

  const response = await fetch(endpoint, { headers });

  if (!response.ok) {
    if (!authToken && (response.status === 401 || response.status === 403)) {
      throw new Error(
        `Public Bluesky search was denied (${response.status}). Add BLUESKY_IDENTIFIER and BLUESKY_APP_PASSWORD, or try a different BLUESKY_PUBLIC_API_URL.`,
      );
    }

    const body = await readResponseText(response);
    throw new Error(`searchPosts failed (${response.status}): ${body}`);
  }

  const data = await response.json();

  return Array.isArray(data.posts) ? data.posts : [];
}

function normalizePost(post, query) {
  const uri = readString(post?.uri);
  const authorHandle = readString(post?.author?.handle);
  const record = post?.record && typeof post.record === "object" ? post.record : {};
  const text = readString(record.text);
  const postedAt = readDateString(record.createdAt);
  const rkey = parseRkey(uri);
  const sourceUrl =
    authorHandle && rkey
      ? `https://bsky.app/profile/${authorHandle}/post/${rkey}`
      : null;

  return pickRawSourceColumns({
    approved_report_id: null,
    author_handle: authorHandle,
    category_guess: guessCategory(text),
    event_datetime_guess: null,
    language: readLanguage(record.langs),
    location_hint: null,
    platform: "bluesky",
    posted_at: postedAt,
    raw_media_url: readMediaUrl(post),
    raw_text: text,
    raw_title: makeSnippet(text),
    rejection_reason: null,
    review_notes: null,
    search_query: query,
    source_post_id: uri || readString(post?.cid),
    source_url: sourceUrl,
    status: "new",
  });
}

function pickRawSourceColumns(rawSource) {
  return Object.fromEntries(
    RAW_SOURCE_COLUMNS.map((column) => [column, rawSource[column] ?? null]),
  );
}

async function rawSourceExists(runtimeConfig, rawSource) {
  if (
    rawSource.source_post_id &&
    (await rawSourceExistsByColumn(
      runtimeConfig,
      "source_post_id",
      rawSource.source_post_id,
    ))
  ) {
    return true;
  }

  if (
    rawSource.source_url &&
    (await rawSourceExistsByColumn(runtimeConfig, "source_url", rawSource.source_url))
  ) {
    return true;
  }

  return false;
}

async function rawSourceExistsByColumn(runtimeConfig, column, value) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("platform", "eq.bluesky");
  endpoint.searchParams.set(column, `eq.${value}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources duplicate check failed (${response.status}): ${body}`);
  }

  const rows = await response.json();

  return Array.isArray(rows) && rows.length > 0;
}

async function insertRawSource(runtimeConfig, rawSource) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);
  const response = await fetch(endpoint, {
    body: JSON.stringify(rawSource),
    headers: {
      ...supabaseHeaders(runtimeConfig),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "POST",
  });

  if (response.status === 409) {
    return;
  }

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources insert failed (${response.status}): ${body}`);
  }
}

function supabaseHeaders(runtimeConfig) {
  return {
    apikey: runtimeConfig.supabaseServiceRoleKey,
    Authorization: `Bearer ${runtimeConfig.supabaseServiceRoleKey}`,
  };
}

function guessCategory(text) {
  const normalized = text.toLowerCase();

  if (/\b(ufo|uap)\b/.test(normalized)) {
    return "UFO / UAP";
  }

  if (/\b(lights?|orb|fireball|triangle)\b/.test(normalized)) {
    return "Strange Lights";
  }

  if (/\b(haunted)\b/.test(normalized)) {
    return "Haunted Places";
  }

  if (/\b(ghost|spirit|paranormal)\b/.test(normalized)) {
    return "Paranormal";
  }

  if (/\blegend\b/.test(normalized)) {
    return "Local Legends";
  }

  return "Unknown";
}

function readMediaUrl(post) {
  const embed = post?.embed;

  if (!embed || typeof embed !== "object") {
    return null;
  }

  if (Array.isArray(embed.images) && embed.images[0]) {
    return readString(embed.images[0].fullsize) || readString(embed.images[0].thumb);
  }

  if (embed.external && typeof embed.external === "object") {
    return readString(embed.external.thumb);
  }

  return null;
}

function parseRkey(uri) {
  if (!uri) {
    return null;
  }

  const parts = uri.split("/");
  const rkey = parts.at(-1);

  return rkey && rkey !== uri ? rkey : null;
}

function makeSnippet(text) {
  if (!text) {
    return null;
  }

  const compact = text.replace(/\s+/g, " ").trim();

  if (compact.length <= 96) {
    return compact;
  }

  return `${compact.slice(0, 93).trim()}...`;
}

function readLanguage(langs) {
  if (Array.isArray(langs) && typeof langs[0] === "string") {
    return langs[0];
  }

  return null;
}

function readString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readDateString(value) {
  if (!readString(value)) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

async function readResponseText(response) {
  const text = await response.text();

  return text ? text.slice(0, 500) : response.statusText;
}

function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  if (error.cause) {
    return `${error.message}: ${String(error.cause)}`;
  }

  return error.message;
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

Notes:
  - Inserts only into public.raw_sources.
  - Never inserts into public.reports.
  - Use --dry-run to test Bluesky search without Supabase writes.
`);
}
