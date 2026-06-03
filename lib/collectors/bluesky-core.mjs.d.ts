export const DEFAULT_BLUESKY_QUERIES: string[];

export function createBlueskyCollectorConfig(
  env: NodeJS.ProcessEnv,
  options?: {
    dryRun?: boolean;
    limit?: number;
    maxFetchedPerRun?: number;
    maxQueries?: number;
    maxResultsPerQuery?: number;
    queries?: string[];
  },
): unknown;

export function collectBluesky(config: unknown): Promise<{
  dryRun: boolean;
  errors: string[];
  queries: Array<{
    duplicatesSkipped: number;
    emptySkipped: number;
    errors: string[];
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
    query: string;
    repliesSkipped: number;
  }>;
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
    repliesSkipped: number;
  };
  warnings: string[];
}>;
