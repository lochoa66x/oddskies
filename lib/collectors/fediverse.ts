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

export type FediverseSourceInput =
  | string
  | {
      category?: string | null;
      instance: string;
      tag: string;
    };

export type FediverseCollectorSourceSummary = {
  duplicatesSkipped: number;
  emptySkipped: number;
  errors: string[];
  exclusionsSkipped: number;
  fetched: number;
  inserted: number;
  insertedIds: string[];
  instance: string;
  normalized: number;
  query: string;
  repliesSkipped: number;
  tag: string;
};

export type FediverseCollectorSummary = {
  dryRun: boolean;
  errors: string[];
  queries: FediverseCollectorSourceSummary[];
  runId?: string;
  sources: FediverseCollectorSourceSummary[];
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    exclusionsSkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    locationNormalized?: number;
    normalized: number;
    repliesSkipped?: number;
    scored?: number;
  };
  warnings: string[];
};

export type FediverseCollectorOptions = {
  dryRun?: boolean;
  limit?: number;
  logRun?: boolean;
  maxFetchedPerRun?: number;
  maxResultsPerSource?: number;
  maxSources?: number;
  mode?: CollectorRunMode;
  postProcessInserted?: boolean;
  sources?: FediverseSourceInput[];
};

type FediverseCoreModule = {
  collectFediverse: (config: unknown) => Promise<FediverseCollectorSummary>;
  createFediverseCollectorConfig: (
    env: NodeJS.ProcessEnv,
    options: FediverseCollectorOptions,
  ) => unknown;
};

export async function collectFediverseFromEnv(
  options: FediverseCollectorOptions = {},
) {
  const core = (await import("./fediverse-core.mjs")) as unknown as FediverseCoreModule;
  const config = core.createFediverseCollectorConfig(process.env, options);
  const sourceCount =
    Array.isArray((config as { sources?: unknown[] }).sources)
      ? (config as { sources: unknown[] }).sources.length
      : (options.sources?.length ?? 0);
  const shouldLogRun = options.logRun !== false;
  const run = shouldLogRun
    ? await createCollectorRun({
        collectorName: "fediverse-tags",
        dryRun: Boolean(options.dryRun),
        mode: options.mode ?? "admin",
        platform: "fediverse",
        queryCount: sourceCount,
      })
    : null;

  try {
    const summary = await core.collectFediverse(config);

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

async function postProcessInsertedRawSources(
  summary: FediverseCollectorSummary,
) {
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
