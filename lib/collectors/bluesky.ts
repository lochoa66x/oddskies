import "server-only";

export type BlueskyCollectorQuerySummary = {
  duplicatesSkipped: number;
  errors: string[];
  fetched: number;
  inserted: number;
  normalized: number;
  query: string;
};

export type BlueskyCollectorSummary = {
  dryRun: boolean;
  errors: string[];
  queries: BlueskyCollectorQuerySummary[];
  totals: {
    duplicatesSkipped: number;
    fetched: number;
    inserted: number;
    normalized: number;
  };
  warnings: string[];
};

export type BlueskyCollectorOptions = {
  dryRun?: boolean;
  limit?: number;
  queries?: string[];
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

  return core.collectBluesky(config);
}

export async function getDefaultBlueskyQueries() {
  const core = (await import("./bluesky-core.mjs")) as unknown as BlueskyCoreModule;

  return core.DEFAULT_BLUESKY_QUERIES;
}
