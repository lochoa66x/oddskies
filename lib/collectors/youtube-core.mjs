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

export function createYoutubeCollectorConfig(env = {}, options = {}) {
  const maxResultsPerFeed = clampConfigInteger(
    options.maxResultsPerFeed ?? env.ODDSKIES_YOUTUBE_MAX_RESULTS_PER_FEED,
    10,
    1,
    20,
  );
  const maxFeeds = clampConfigInteger(
    options.maxFeeds ?? env.ODDSKIES_YOUTUBE_MAX_FEEDS,
    10,
    1,
    20,
  );

  return {
    dryRun: Boolean(options.dryRun),
    feeds: normalizeFeeds(
      Array.isArray(options.feeds) && options.feeds.length > 0
        ? options.feeds
        : readFeedsFromEnv(env),
      maxFeeds,
    ),
    limit: clampLimit(options.limit, maxResultsPerFeed),
    maxFetchedPerRun: clampConfigInteger(
      options.maxFetchedPerRun ?? env.ODDSKIES_YOUTUBE_MAX_FETCHED_PER_RUN,
      100,
      1,
      200,
    ),
    maxResultsPerFeed,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export async function collectYoutube(runtimeConfig) {
  const summary = {
    dryRun: runtimeConfig.dryRun,
    errors: [],
    feeds: [],
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

  const configErrors = validateRuntimeConfig(runtimeConfig);

  if (configErrors.length > 0) {
    summary.errors.push(...configErrors);
    return summary;
  }

  const exclusionRules = await listActiveCollectorExclusions(runtimeConfig, summary);

  for (const feed of runtimeConfig.feeds) {
    if (summary.totals.fetched >= runtimeConfig.maxFetchedPerRun) {
      summary.warnings.push(
        `Fetch cap reached (${runtimeConfig.maxFetchedPerRun}). Remaining feeds skipped.`,
      );
      break;
    }

    const feedSummary = {
      duplicatesSkipped: 0,
      emptySkipped: 0,
      errors: [],
      exclusionsSkipped: 0,
      feed: feed.name,
      fetched: 0,
      inserted: 0,
      insertedIds: [],
      normalized: 0,
      url: feed.url,
    };

    try {
      const remainingFetches = Math.max(
        0,
        runtimeConfig.maxFetchedPerRun - summary.totals.fetched,
      );
      const xml = await fetchFeedXml(feed.url);
      const videos = parseYoutubeVideos(xml, feed).slice(
        0,
        Math.min(runtimeConfig.limit, remainingFetches),
      );

      feedSummary.fetched = videos.length;

      for (const video of videos) {
        const rawSource = normalizeVideo(video, feed);

        if (!rawSource.raw_text && !rawSource.raw_title) {
          feedSummary.emptySkipped += 1;
          continue;
        }

        feedSummary.normalized += 1;

        const exclusion = findCollectorExclusion(rawSource, exclusionRules);

        if (exclusion) {
          feedSummary.exclusionsSkipped += 1;
          continue;
        }

        if (runtimeConfig.dryRun) {
          continue;
        }

        const duplicate = await rawSourceExists(runtimeConfig, rawSource);

        if (duplicate) {
          feedSummary.duplicatesSkipped += 1;
          continue;
        }

        const insertedId = await insertRawSource(runtimeConfig, rawSource);

        if (insertedId) {
          feedSummary.insertedIds.push(insertedId);
          feedSummary.inserted += 1;
        } else {
          feedSummary.duplicatesSkipped += 1;
        }
      }
    } catch (error) {
      feedSummary.errors.push(formatError(error));
    }

    summary.feeds.push(feedSummary);
    summary.totals.duplicatesSkipped += feedSummary.duplicatesSkipped;
    summary.totals.emptySkipped += feedSummary.emptySkipped;
    summary.totals.exclusionsSkipped += feedSummary.exclusionsSkipped;
    summary.totals.fetched += feedSummary.fetched;
    summary.totals.inserted += feedSummary.inserted;
    summary.totals.insertedIds.push(...feedSummary.insertedIds);
    summary.totals.normalized += feedSummary.normalized;
    summary.errors.push(
      ...feedSummary.errors.map((error) => `${feed.name}: ${error}`),
    );
  }

  return summary;
}

function validateRuntimeConfig(runtimeConfig) {
  const errors = [];

  if (!runtimeConfig.feeds.length) {
    errors.push(
      "No YouTube feeds configured. Set ODDSKIES_YOUTUBE_FEEDS or pass a feed list.",
    );
  }

  if (!runtimeConfig.dryRun) {
    if (!runtimeConfig.supabaseUrl) {
      errors.push(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL. Add it to the server environment.",
      );
    }

    if (!runtimeConfig.supabaseServiceRoleKey) {
      errors.push(
        "Missing SUPABASE_SERVICE_ROLE_KEY. raw_sources is private, so the collector needs a server-only service key.",
      );
    }

    if (runtimeConfig.supabaseServiceRoleKey?.startsWith("sb_publishable_")) {
      errors.push(
        "SUPABASE_SERVICE_ROLE_KEY looks like a publishable key. Use the server-only secret key.",
      );
    }
  }

  return errors;
}

async function fetchFeedXml(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/atom+xml, application/xml, text/xml",
      "User-Agent": "OddSkies YouTube feed collector prototype/1.0",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`YouTube feed fetch failed (${response.status}): ${await readResponseText(response)}`);
  }

  const text = await response.text();

  if (text.length > 2_000_000) {
    throw new Error("YouTube feed response is too large");
  }

  return text;
}

function parseYoutubeVideos(xml, feed) {
  return collectBlocks(xml, "entry").map((block) => {
    const videoId = readFirstTag(block, ["yt:videoId", "id"])?.replace(/^yt:video:/, "");
    const link = readLink(block);

    return {
      author: readAtomAuthor(block),
      id: videoId || readFirstTag(block, ["id"]) || link,
      link,
      mediaUrl: readMediaThumbnail(block),
      publishedAt: readFirstTag(block, ["published", "updated"]),
      summary:
        readFirstTag(block, ["media:description", "summary", "content"]) ||
        readFirstTag(block, ["description"]),
      title:
        readFirstTag(block, ["media:title", "title"]) ||
        feed.name,
      videoId,
    };
  });
}

function normalizeVideo(video, feed) {
  const title = cleanText(video.title);
  const text = cleanText(video.summary);
  const sourceUrl =
    normalizeUrl(video.link) ||
    (video.videoId ? `https://www.youtube.com/watch?v=${video.videoId}` : null);
  const sourceId = video.videoId
    ? `youtube:${video.videoId}`
    : cleanText(video.id) || sourceUrl || `${feed.name}:${title}`;
  const combinedText = `${title ?? ""} ${text ?? ""}`.trim();

  return pickRawSourceColumns({
    approved_report_id: null,
    author_handle: cleanText(video.author) || feed.name,
    category_guess: feed.category || guessCategory(combinedText),
    event_datetime_guess: null,
    language: null,
    location_hint: null,
    platform: "youtube",
    posted_at: readDateString(video.publishedAt),
    raw_media_url: normalizeUrl(video.mediaUrl),
    raw_text: text || title,
    raw_title: title || makeSnippet(text),
    rejection_reason: null,
    review_notes: null,
    search_query: feed.name,
    source_post_id: sourceId,
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
  endpoint.searchParams.set("platform", "eq.youtube");
  endpoint.searchParams.set(column, `eq.${value}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources duplicate check failed (${response.status}): ${body}`);
  }

  const rows = await response.json().catch(() => []);

  return Array.isArray(rows) && rows.length > 0;
}

async function listActiveCollectorExclusions(runtimeConfig, summary) {
  if (!runtimeConfig.supabaseUrl || !runtimeConfig.supabaseServiceRoleKey) {
    return [];
  }

  const endpoint = new URL("/rest/v1/collector_exclusions", runtimeConfig.supabaseUrl);

  endpoint.searchParams.set("select", "platform,match_type,match_value,reason");
  endpoint.searchParams.set("platform", "eq.youtube");
  endpoint.searchParams.set("is_active", "eq.true");
  endpoint.searchParams.set("limit", "500");

  const response = await fetch(endpoint, {
    headers: supabaseHeaders(runtimeConfig),
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    summary.warnings.push(
      `Collector exclusions unavailable (${response.status}): ${body}`,
    );
    return [];
  }

  const rows = await response.json().catch(() => []);

  return Array.isArray(rows) ? rows : [];
}

function findCollectorExclusion(rawSource, exclusions) {
  if (!exclusions.length) {
    return null;
  }

  const sourceUrl = rawSource.source_url ?? "";
  const sourceDomain = readDomain(sourceUrl);
  const author = (rawSource.author_handle ?? "").toLowerCase();
  const searchQuery = (rawSource.search_query ?? "").toLowerCase();
  const text = `${rawSource.raw_title ?? ""} ${rawSource.raw_text ?? ""}`.toLowerCase();

  return (
    exclusions.find((exclusion) => {
      const value = String(exclusion.match_value ?? "").toLowerCase();

      if (!value) {
        return false;
      }

      if (exclusion.match_type === "source_post_id") {
        return rawSource.source_post_id === exclusion.match_value;
      }

      if (exclusion.match_type === "source_url") {
        return sourceUrl === exclusion.match_value;
      }

      if (exclusion.match_type === "author_handle") {
        return author === value;
      }

      if (exclusion.match_type === "domain") {
        return sourceDomain === value;
      }

      if (exclusion.match_type === "search_query") {
        return searchQuery === value;
      }

      if (exclusion.match_type === "text_contains") {
        return text.includes(value);
      }

      return false;
    }) ?? null
  );
}

async function insertRawSource(runtimeConfig, rawSource) {
  const endpoint = new URL("/rest/v1/raw_sources", runtimeConfig.supabaseUrl);
  const response = await fetch(endpoint, {
    body: JSON.stringify(rawSource),
    headers: {
      ...supabaseHeaders(runtimeConfig),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });

  if (response.status === 409) {
    return null;
  }

  if (!response.ok) {
    const body = await readResponseText(response);
    throw new Error(`raw_sources insert failed (${response.status}): ${body}`);
  }

  const rows = await response.json().catch(() => []);

  return Array.isArray(rows) && typeof rows[0]?.id === "string"
    ? rows[0].id
    : null;
}

function readFeedsFromEnv(env) {
  const raw = env.ODDSKIES_YOUTUBE_FEEDS;

  if (!readString(raw)) {
    return [];
  }

  const text = raw.trim();

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return text
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeFeeds(feeds, maxFeeds) {
  const cleaned = [];
  const seen = new Set();

  for (const feed of feeds) {
    const normalized = normalizeFeed(feed);

    if (!normalized || seen.has(normalized.url)) {
      continue;
    }

    seen.add(normalized.url);
    cleaned.push(normalized);

    if (cleaned.length >= maxFeeds) {
      break;
    }
  }

  return cleaned;
}

function normalizeFeed(feed) {
  if (typeof feed === "string") {
    const parts = feed.split("|").map((part) => part.trim());

    if (parts.length >= 2) {
      const url = buildYoutubeFeedUrl(parts[1]);

      return url
        ? {
            category: readString(parts[2]),
            name: parts[0] || readDomain(url) || "YouTube feed",
            url,
          }
        : null;
    }

    const url = buildYoutubeFeedUrl(feed);

    return url
      ? {
          category: null,
          name: readDomain(url) || "YouTube feed",
          url,
        }
      : null;
  }

  if (!feed || typeof feed !== "object") {
    return null;
  }

  const url = buildYoutubeFeedUrl(feed.url || feed.channelId || feed.playlistId);

  if (!url) {
    return null;
  }

  return {
    category: readString(feed.category),
    name: readString(feed.name) || readDomain(url) || "YouTube feed",
    url,
  };
}

function buildYoutubeFeedUrl(value) {
  const text = readString(value);

  if (!text) {
    return null;
  }

  if (/^https?:\/\//i.test(text)) {
    return normalizeUrl(text);
  }

  if (/^PL[\w-]+$/.test(text)) {
    return `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(text)}`;
  }

  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(text)}`;
}

function collectBlocks(xml, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const blocks = [];
  let match = pattern.exec(xml);

  while (match) {
    blocks.push(match[1]);
    match = pattern.exec(xml);
  }

  return blocks;
}

function readFirstTag(block, tags) {
  for (const tag of tags) {
    const value = readTag(block, tag);

    if (value) {
      return value;
    }
  }

  return null;
}

function readTag(block, tag) {
  const escapedTag = tag.replace(":", "\\:");
  const pattern = new RegExp(`<${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i");
  const match = block.match(pattern);

  return match ? decodeXml(stripTags(match[1])) : null;
}

function readLink(block) {
  const alternate = block.match(
    /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i,
  );

  if (alternate?.[1]) {
    return decodeXml(alternate[1]);
  }

  const atomHref = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i);

  if (atomHref?.[1]) {
    return decodeXml(atomHref[1]);
  }

  return readTag(block, "link");
}

function readAtomAuthor(block) {
  const authorBlock = collectBlocks(block, "author")[0];

  if (!authorBlock) {
    return null;
  }

  return readFirstTag(authorBlock, ["name", "email", "uri"]);
}

function readMediaThumbnail(block) {
  const thumbnail = block.match(
    /<media:thumbnail\b[^>]*\burl=["']([^"']+)["'][^>]*>/i,
  );

  return thumbnail?.[1] ? decodeXml(thumbnail[1]) : null;
}

function stripTags(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ");
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function cleanText(value) {
  const text = readString(value);

  if (!text) {
    return null;
  }

  return text.replace(/\s+/g, " ").trim().slice(0, 4000);
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

function guessCategory(text) {
  const normalized = (text ?? "").toLowerCase();

  if (/\b(ufo|uap)\b/.test(normalized)) {
    return "UFO / UAP";
  }

  if (/\b(lights?|orb|fireball|triangle|meteor|flare)\b/.test(normalized)) {
    return "Strange Lights";
  }

  if (/\b(haunted|haunting)\b/.test(normalized)) {
    return "Haunted Places";
  }

  if (/\b(ghost|spirit|paranormal)\b/.test(normalized)) {
    return "Paranormal";
  }

  if (/\b(legend|folklore|myth)\b/.test(normalized)) {
    return "Local Legends";
  }

  return "Unknown";
}

function normalizeUrl(value) {
  const text = readString(value);

  if (!text) {
    return null;
  }

  try {
    return new URL(text).toString();
  } catch {
    return null;
  }
}

function readDomain(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function readDateString(value) {
  if (!readString(value)) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

function clampLimit(value, maxResultsPerFeed) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return maxResultsPerFeed;
  }

  return Math.max(1, Math.min(maxResultsPerFeed, Math.floor(numberValue)));
}

function clampConfigInteger(value, fallback, min, max) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.floor(numberValue)));
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
