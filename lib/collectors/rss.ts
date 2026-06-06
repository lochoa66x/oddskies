import "server-only";

import {
  createCollectorRun,
  finishCollectorRun,
  type CollectorRunMode,
} from "@/lib/collector-runs";
import {
  normalizeRawSourceLocationById,
  scoreRawSourceById,
} from "@/lib/admin-raw-sources";

export type RssFeedInput =
  | string
  | {
      category?: string | null;
      name?: string | null;
      url: string;
    };

export type RssCollectorFeedSummary = {
  duplicatesSkipped: number;
  emptySkipped: number;
  errors: string[];
  exclusionsSkipped: number;
  feed: string;
  fetched: number;
  inserted: number;
  insertedIds: string[];
  normalized: number;
  url: string;
};

export type RssCollectorSummary = {
  dryRun: boolean;
  errors: string[];
  feeds: RssCollectorFeedSummary[];
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    exclusionsSkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
    scored?: number;
    locationNormalized?: number;
  };
  runId?: string;
  warnings: string[];
};

export type RssCollectorOptions = {
  dryRun?: boolean;
  feeds?: RssFeedInput[];
  limit?: number;
  logRun?: boolean;
  maxFetchedPerRun?: number;
  maxFeeds?: number;
  maxResultsPerFeed?: number;
  mode?: CollectorRunMode;
  postProcessInserted?: boolean;
};

type RssCoreModule = {
  collectRss: (config: unknown) => Promise<RssCollectorSummary>;
  createRssCollectorConfig: (
    env: NodeJS.ProcessEnv,
    options: RssCollectorOptions,
  ) => unknown;
};

export async function collectRssFromEnv(options: RssCollectorOptions = {}) {
  const core = (await import("./rss-core.mjs")) as unknown as RssCoreModule;
  const config = core.createRssCollectorConfig(process.env, options);
  const feedCount =
    Array.isArray((config as { feeds?: unknown[] }).feeds)
      ? (config as { feeds: unknown[] }).feeds.length
      : (options.feeds?.length ?? 0);
  const shouldLogRun = options.logRun !== false;
  const run = shouldLogRun
    ? await createCollectorRun({
        collectorName: "rss-feed",
        dryRun: Boolean(options.dryRun),
        mode: options.mode ?? "admin",
        platform: "rss",
        queryCount: feedCount,
      })
    : null;

  try {
    const summary = await core.collectRss(config);

    if (!summary.dryRun && options.postProcessInserted !== false) {
      await postProcessInsertedRawSources(summary);
    }

    if (run) {
      await finishCollectorRun(run.id, {
        summary: {
          ...summary,
          queries: summary.feeds,
        },
      });
      summary.runId = run.id;
    }

    return summary;
  } catch (error) {
    const message = formatError(error);

    if (run) {
      await finishCollectorRun(run.id, {
        errorMessage: message,
        status: "failed",
        summary: {
          dryRun: Boolean(options.dryRun),
          errors: [message],
          queries: [],
          totals: {
            duplicatesSkipped: 0,
            fetched: 0,
            inserted: 0,
          },
        },
      });
    }

    throw error;
  }
}

async function postProcessInsertedRawSources(summary: RssCollectorSummary) {
  const ids = summary.totals.insertedIds ?? [];

  summary.totals.scored = 0;
  summary.totals.locationNormalized = 0;

  for (const id of ids) {
    try {
      await scoreRawSourceById(id);
      summary.totals.scored += 1;
    } catch (error) {
      summary.errors.push(`Score helper failed for ${id}: ${formatError(error)}`);
    }

    try {
      await normalizeRawSourceLocationById(id);
      summary.totals.locationNormalized += 1;
    } catch (error) {
      summary.errors.push(
        `Location helper failed for ${id}: ${formatError(error)}`,
      );
    }
  }
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
