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

export function createFediverseCollectorConfig(env = {}, options = {}) {
  const maxResultsPerSource = clampConfigInteger(
    options.maxResultsPerSource ?? env.ODDSKIES_FEDIVERSE_MAX_RESULTS_PER_SOURCE,
    10,
    1,
    20,
  );
  const maxSources = clampConfigInteger(
    options.maxSources ?? env.ODDSKIES_FEDIVERSE_MAX_SOURCES,
    10,
    1,
    20,
  );

  return {
    dryRun: Boolean(options.dryRun),
    limit: clampLimit(options.limit, maxResultsPerSource),
    maxFetchedPerRun: clampConfigInteger(
      options.maxFetchedPerRun ?? env.ODDSKIES_FEDIVERSE_MAX_FETCHED_PER_RUN,
      100,
      1,
      200,
    ),
    maxResultsPerSource,
    sources: normalizeSources(
      Array.isArray(options.sources) && options.sources.length > 0
        ? options.sources
        : readSourcesFromEnv(env),
      maxSources,
    ),
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export async function collectFediverse(runtimeConfig) {
  const summary = {
    dryRun: runtimeConfig.dryRun,
    errors: [],
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

  const configErrors = validateRuntimeConfig(runtimeConfig);

  if (configErrors.length > 0) {
    summary.errors.push(...configErrors);
    return summary;
  }

  const exclusionRules = await listActiveCollectorExclusions(runtimeConfig, summary);

  for (const source of runtimeConfig.sources) {
    if (summary.totals.fetched >= runtimeConfig.maxFetchedPerRun) {
      summary.warnings.push(
        `Fetch cap reached (${runtimeConfig.maxFetchedPerRun}). Remaining sources skipped.`,
      );
      break;
    }

    const sourceSummary = {
      duplicatesSkipped: 0,
      emptySkipped: 0,
      errors: [],
      exclusionsSkipped: 0,
      fetched: 0,
      inserted: 0,
      insertedIds: [],
      instance: source.instance,
      normalized: 0,
      query: `${source.instance} #${source.tag}`,
      repliesSkipped: 0,
      tag: source.tag,
    };

    try {
      const remainingFetches = Math.max(
        0,
        runtimeConfig.maxFetchedPerRun - summary.totals.fetched,
      );
      const statuses = (
        await fetchTaggedStatuses({
          limit: Math.min(runtimeConfig.limit, remainingFetches),
          source,
        })
      ).slice(0, remainingFetches);

      sourceSummary.fetched = statuses.length;

      for (const status of statuses) {
        if (status?.in_reply_to_id) {
          sourceSummary.repliesSkipped += 1;
          continue;
        }

        const rawSource = normalizeStatus(status, source);

        if (!rawSource.raw_text && !rawSource.raw_title) {
          sourceSummary.emptySkipped += 1;
          continue;
        }

        sourceSummary.normalized += 1;

        const exclusion = findCollectorExclusion(rawSource, exclusionRules);

        if (exclusion) {
          sourceSummary.exclusionsSkipped += 1;
          continue;
        }

        if (runtimeConfig.dryRun) {
          continue;
        }

        const duplicate = await rawSourceExists(runtimeConfig, rawSource);

        if (duplicate) {
          sourceSummary.duplicatesSkipped += 1;
          continue;
        }

        const insertedId = await insertRawSource(runtimeConfig, rawSource);

        if (insertedId) {
          sourceSummary.insertedIds.push(insertedId);
          sourceSummary.inserted += 1;
        } else {
          sourceSummary.duplicatesSkipped += 1;
        }
      }
    } catch (error) {
      sourceSummary.errors.push(formatError(error));
    }

    summary.sources.push(sourceSummary);
    summary.queries.push(sourceSummary);
    summary.totals.duplicatesSkipped += sourceSummary.duplicatesSkipped;
    summary.totals.emptySkipped += sourceSummary.emptySkipped;
    summary.totals.exclusionsSkipped += sourceSummary.exclusionsSkipped;
    summary.totals.fetched += sourceSummary.fetched;
    summary.totals.inserted += sourceSummary.inserted;
    summary.totals.insertedIds.push(...sourceSummary.insertedIds);
    summary.totals.normalized += sourceSummary.normalized;
    summary.totals.repliesSkipped =
      (summary.totals.repliesSkipped ?? 0) + sourceSummary.repliesSkipped;
    summary.errors.push(
      ...sourceSummary.errors.map((error) => `${sourceSummary.query}: ${error}`),
    );
  }

  return summary;
}

function validateRuntimeConfig(runtimeConfig) {
  const errors = [];

  if (!runtimeConfig.sources.length) {
    errors.push(
      "No Fediverse sources configured. Set ODDSKIES_FEDIVERSE_SOURCES or pass a source list.",
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

async function fetchTaggedStatuses({ limit, source }) {
  const endpoint = new URL(
    `/api/v1/timelines/tag/${encodeURIComponent(source.tag)}`,
    `https://${source.instance}`,
  );

  endpoint.searchParams.set("limit", String(limit));
  endpoint.searchParams.set("local", "false");

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OddSkies Fediverse collector prototype/1.0",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(
      `tag timeline failed (${response.status}): ${await readResponseText(response)}`,
    );
  }

  const data = await response.json().catch(() => []);

  return Array.isArray(data) ? data : [];
}

function normalizeStatus(status, source) {
  const account = status?.account && typeof status.account === "object"
    ? status.account
    : {};
  const accountAcct = readString(account.acct);
  const accountHandle = accountAcct?.includes("@")
    ? accountAcct
    : accountAcct
      ? `${accountAcct}@${source.instance}`
      : readString(account.url) || source.instance;
  const text = cleanText(status?.content);
  const spoiler = cleanText(status?.spoiler_text);
  const sourceUrl = normalizeUrl(status?.url) || normalizeUrl(status?.uri);
  const sourcePostId = readString(status?.uri) || readString(status?.id);
  const mediaUrl = readMediaUrl(status);
  const combinedText = `${spoiler ?? ""} ${text ?? ""}`.trim();

  return pickRawSourceColumns({
    approved_report_id: null,
    author_handle: accountHandle,
    category_guess: source.category || guessCategory(combinedText),
    event_datetime_guess: null,
    language: readString(status?.language),
    location_hint: null,
    platform: "fediverse",
    posted_at: readDateString(status?.created_at),
    raw_media_url: mediaUrl,
    raw_text: text || spoiler,
    raw_title: spoiler || makeSnippet(text),
    rejection_reason: null,
    review_notes: null,
    search_query: `#${source.tag}`,
    source_post_id: sourcePostId ? `${source.instance}:${sourcePostId}` : null,
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
  endpoint.searchParams.set("platform", "eq.fediverse");
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
  endpoint.searchParams.set("platform", "eq.fediverse");
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

function readSourcesFromEnv(env) {
  const raw = env.ODDSKIES_FEDIVERSE_SOURCES;

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

function normalizeSources(sources, maxSources) {
  const cleaned = [];
  const seen = new Set();

  for (const source of sources) {
    const normalized = normalizeSource(source);

    if (!normalized) {
      continue;
    }

    const key = `${normalized.instance}:${normalized.tag}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    cleaned.push(normalized);

    if (cleaned.length >= maxSources) {
      break;
    }
  }

  return cleaned;
}

function normalizeSource(source) {
  if (typeof source === "string") {
    const parts = source.split("|").map((part) => part.trim());
    const instance = normalizeInstance(parts[0]);
    const tag = normalizeTag(parts[1]);

    if (!instance || !tag) {
      return null;
    }

    return {
      category: readString(parts[2]),
      instance,
      tag,
    };
  }

  if (!source || typeof source !== "object") {
    return null;
  }

  const instance = normalizeInstance(source.instance);
  const tag = normalizeTag(source.tag);

  if (!instance || !tag) {
    return null;
  }

  return {
    category: readString(source.category),
    instance,
    tag,
  };
}

function normalizeInstance(value) {
  const text = readString(value);

  if (!text) {
    return null;
  }

  try {
    return new URL(text.includes("://") ? text : `https://${text}`).hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return null;
  }
}

function normalizeTag(value) {
  const text = readString(value)?.replace(/^#/, "").trim().toLowerCase();

  if (!text) {
    return null;
  }

  return text.replace(/[^\p{L}\p{N}_-]/gu, "").slice(0, 80) || null;
}

function readMediaUrl(status) {
  const attachments = Array.isArray(status?.media_attachments)
    ? status.media_attachments
    : [];
  const first = attachments.find((attachment) => {
    const type = readString(attachment?.type);

    return type === "image" || type === "gifv" || type === "video";
  });

  return normalizeUrl(first?.url) || normalizeUrl(first?.preview_url);
}

function cleanText(value) {
  const text = readString(value);

  if (!text) {
    return null;
  }

  return decodeHtml(stripTags(text)).replace(/\s+/g, " ").trim().slice(0, 4000);
}

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
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

function clampLimit(value, maxResultsPerSource) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return maxResultsPerSource;
  }

  return Math.max(1, Math.min(maxResultsPerSource, Math.floor(numberValue)));
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
