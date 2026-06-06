export type YoutubeFeedInput =
  | string
  | {
      category?: string | null;
      channelId?: string | null;
      name?: string | null;
      playlistId?: string | null;
      url?: string | null;
    };

export function createYoutubeCollectorConfig(
  env: NodeJS.ProcessEnv,
  options?: {
    dryRun?: boolean;
    feeds?: YoutubeFeedInput[];
    limit?: number;
    maxFetchedPerRun?: number;
    maxFeeds?: number;
    maxResultsPerFeed?: number;
  },
): unknown;

export function collectYoutube(config: unknown): Promise<{
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
