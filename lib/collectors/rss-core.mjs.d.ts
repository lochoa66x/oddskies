export type RssFeedInput =
  | string
  | {
      category?: string | null;
      name?: string | null;
      url: string;
    };

export function createRssCollectorConfig(
  env: NodeJS.ProcessEnv,
  options?: {
    dryRun?: boolean;
    feeds?: RssFeedInput[];
    limit?: number;
    maxFetchedPerRun?: number;
    maxFeeds?: number;
    maxResultsPerFeed?: number;
  },
): unknown;

export function collectRss(config: unknown): Promise<{
  dryRun: boolean;
  errors: string[];
  feeds: Array<{
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
  }>;
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    exclusionsSkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
  };
  warnings: string[];
}>;
