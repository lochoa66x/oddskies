export const DEFAULT_BLUESKY_QUERIES = [
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

export function createBlueskyCollectorConfig(env = {}, options = {}) {
  return {
    blueskyAppPassword: env.BLUESKY_APP_PASSWORD,
    blueskyIdentifier: env.BLUESKY_IDENTIFIER,
    blueskyPublicApiUrl:
      env.BLUESKY_PUBLIC_API_URL ?? "https://public.api.bsky.app",
    blueskyServiceUrl: env.BLUESKY_SERVICE_URL ?? "https://bsky.social",
    dryRun: Boolean(options.dryRun),
    limit: clampLimit(options.limit),
    queries:
      Array.isArray(options.queries) && options.queries.length > 0
        ? options.queries
        : DEFAULT_BLUESKY_QUERIES,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export async function collectBluesky(runtimeConfig) {
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

  const configErrors = validateRuntimeConfig(runtimeConfig);

  if (configErrors.length > 0) {
    summary.errors.push(...configErrors);
    return summary;
  }

  const session = {
    attempted: false,
    token: null,
  };

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
        query,
        runtimeConfig,
        session,
        summary,
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

function validateRuntimeConfig(runtimeConfig) {
  const errors = [];

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

async function searchBlueskyPosts({ query, runtimeConfig, session, summary }) {
  const publicAttempt = await trySearchBlueskyPosts({
    authToken: null,
    baseUrl: runtimeConfig.blueskyPublicApiUrl,
    limit: runtimeConfig.limit,
    query,
  });

  if (publicAttempt.ok) {
    return publicAttempt.posts;
  }

  const canTryAuthenticated =
    publicAttempt.status &&
    [401, 403].includes(publicAttempt.status) &&
    runtimeConfig.blueskyIdentifier &&
    runtimeConfig.blueskyAppPassword;

  if (!canTryAuthenticated) {
    throw publicAttempt.error;
  }

  if (!session.attempted) {
    session.attempted = true;
    session.token = await createBlueskySession(runtimeConfig, summary);
  }

  if (!session.token) {
    throw publicAttempt.error;
  }

  const authenticatedAttempt = await trySearchBlueskyPosts({
    authToken: session.token,
    baseUrl: runtimeConfig.blueskyServiceUrl,
    limit: runtimeConfig.limit,
    query,
  });

  if (authenticatedAttempt.ok) {
    return authenticatedAttempt.posts;
  }

  throw authenticatedAttempt.error;
}

async function trySearchBlueskyPosts({ authToken, baseUrl, limit, query }) {
  const endpoint = new URL("/xrpc/app.bsky.feed.searchPosts", baseUrl);

  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("limit", String(limit));

  const headers = authToken
    ? {
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "OddSkies collector prototype/1.1",
      }
    : {
        "User-Agent": "OddSkies collector prototype/1.1",
      };

  const response = await fetch(endpoint, { headers });

  if (!response.ok) {
    const body = await readResponseText(response);

    return {
      error: new Error(`searchPosts failed (${response.status}): ${body}`),
      ok: false,
      posts: [],
      status: response.status,
    };
  }

  const data = await response.json().catch(() => ({}));

  return {
    ok: true,
    posts: Array.isArray(data.posts) ? data.posts : [],
    status: response.status,
  };
}

async function createBlueskySession(runtimeConfig, summary) {
  if (!runtimeConfig.blueskyIdentifier || !runtimeConfig.blueskyAppPassword) {
    summary.warnings.push(
      "Bluesky credentials missing. Public AppView search is the only available mode.",
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
      "User-Agent": "OddSkies collector prototype/1.1",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await readResponseText(response);
    summary.warnings.push(
      `Bluesky login failed (${response.status}). ${body}`,
    );
    return null;
  }

  const session = await response.json().catch(() => ({}));

  return typeof session.accessJwt === "string" ? session.accessJwt : null;
}

function normalizePost(post, query) {
  const uri = readString(post?.uri);
  const authorHandle = readString(post?.author?.handle);
  const record = post?.record && typeof post.record === "object" ? post.record : {};
  const text = readString(record.text);
  const postedAt =
    readDateString(record.createdAt) ?? readDateString(post?.indexedAt);
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

  const rows = await response.json().catch(() => []);

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
  const normalized = (text ?? "").toLowerCase();

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

  if (/\b(legend|folklore)\b/.test(normalized)) {
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

function clampLimit(value) {
  if (!Number.isFinite(value)) {
    return 10;
  }

  return Math.max(1, Math.min(25, Math.floor(value)));
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
