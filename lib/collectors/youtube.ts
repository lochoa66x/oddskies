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

export type YoutubeFeedInput =
  | string
  | {
      category?: string | null;
      channelId?: string | null;
      name?: string | null;
      playlistId?: string | null;
      url?: string | null;
    };

export type YoutubeCollectorFeedSummary = {
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

export type YoutubeCollectorSummary = {
  dryRun: boolean;
  errors: string[];
  feeds: YoutubeCollectorFeedSummary[];
  runId?: string;
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    exclusionsSkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    locationNormalized?: number;
    normalized: number;
    scored?: number;
  };
  warnings: string[];
};

export type YoutubeCollectorOptions = {
  dryRun?: boolean;
  feeds?: YoutubeFeedInput[];
  limit?: number;
  logRun?: boolean;
  maxFetchedPerRun?: number;
  maxFeeds?: number;
  maxResultsPerFeed?: number;
  mode?: CollectorRunMode;
  postProcessInserted?: boolean;
};

type YoutubeCoreModule = {
  collectYoutube: (config: unknown) => Promise<YoutubeCollectorSummary>;
  createYoutubeCollectorConfig: (
    env: NodeJS.ProcessEnv,
    options: YoutubeCollectorOptions,
  ) => unknown;
};

export async function collectYoutubeFromEnv(
  options: YoutubeCollectorOptions = {},
) {
  const core = (await import("./youtube-core.mjs")) as unknown as YoutubeCoreModule;
  const config = core.createYoutubeCollectorConfig(process.env, options);
  const feedCount =
    Array.isArray((config as { feeds?: unknown[] }).feeds)
      ? (config as { feeds: unknown[] }).feeds.length
      : (options.feeds?.length ?? 0);
  const shouldLogRun = options.logRun !== false;
  const run = shouldLogRun
    ? await createCollectorRun({
        collectorName: "youtube-feeds",
        dryRun: Boolean(options.dryRun),
        mode: options.mode ?? "admin",
        platform: "youtube",
        queryCount: feedCount,
      })
    : null;

  try {
    const summary = await core.collectYoutube(config);

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

async function postProcessInsertedRawSources(summary: YoutubeCollectorSummary) {
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
