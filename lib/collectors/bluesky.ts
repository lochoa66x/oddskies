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

export type BlueskyCollectorQuerySummary = {
  duplicatesSkipped: number;
  emptySkipped: number;
  errors: string[];
  fetched: number;
  inserted: number;
  insertedIds: string[];
  normalized: number;
  query: string;
  repliesSkipped: number;
};

export type BlueskyCollectorSummary = {
  dateWindow: {
    since: string | null;
    until: string | null;
  };
  dryRun: boolean;
  errors: string[];
  queries: BlueskyCollectorQuerySummary[];
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
    repliesSkipped: number;
    scored?: number;
    locationNormalized?: number;
  };
  runId?: string;
  warnings: string[];
};

export type BlueskyCollectorOptions = {
  dryRun?: boolean;
  limit?: number;
  logRun?: boolean;
  maxFetchedPerRun?: number;
  maxQueries?: number;
  maxResultsPerQuery?: number;
  mode?: CollectorRunMode;
  postProcessInserted?: boolean;
  queries?: string[];
  since?: string | null;
  until?: string | null;
};

type BlueskyCoreModule = {
  DEFAULT_BLUESKY_QUERIES: string[];
  collectBluesky: (config: unknown) => Promise<BlueskyCollectorSummary>;
  createBlueskyCollectorConfig: (
    env: NodeJS.ProcessEnv,
    options: BlueskyCollectorOptions,
  ) => unknown;
};

export async function collectBlueskyFromEnv(options: BlueskyCollectorOptions = {}) {
  const core = (await import("./bluesky-core.mjs")) as unknown as BlueskyCoreModule;
  const config = core.createBlueskyCollectorConfig(process.env, options);
  const queries = await getDefaultedQueries(core, options.queries);
  const shouldLogRun = options.logRun !== false;
  const run = shouldLogRun
    ? await createCollectorRun({
        collectorName: "bluesky-search",
        dryRun: Boolean(options.dryRun),
        mode: options.mode ?? "admin",
        platform: "bluesky",
        queryCount: queries.length,
      })
    : null;

  try {
    const summary = await core.collectBluesky(config);

    if (!summary.dryRun && options.postProcessInserted !== false) {
      await postProcessInsertedRawSources(summary);
    }

    if (run) {
      await finishCollectorRun(run.id, { summary });
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
          dateWindow: {
            since: options.since ?? null,
            until: options.until ?? null,
          },
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

export async function getDefaultBlueskyQueries() {
  const core = (await import("./bluesky-core.mjs")) as unknown as BlueskyCoreModule;

  return core.DEFAULT_BLUESKY_QUERIES;
}

async function getDefaultedQueries(
  core: BlueskyCoreModule,
  queries: string[] | undefined,
) {
  const cleaned = queries
    ?.map((query) => query.trim())
    .filter((query) => query.length > 0);

  return cleaned?.length ? cleaned : core.DEFAULT_BLUESKY_QUERIES;
}

async function postProcessInsertedRawSources(summary: BlueskyCollectorSummary) {
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
