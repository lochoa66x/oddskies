export const DEFAULT_BLUESKY_QUERIES: string[];

export function createBlueskyCollectorConfig(
  env: NodeJS.ProcessEnv,
  options?: {
    dryRun?: boolean;
    limit?: number;
    queries?: string[];
  },
): unknown;

export function collectBluesky(config: unknown): Promise<{
  dryRun: boolean;
  errors: string[];
  queries: Array<{
    duplicatesSkipped: number;
    errors: string[];
    fetched: number;
    inserted: number;
    normalized: number;
    query: string;
  }>;
  totals: {
    duplicatesSkipped: number;
    fetched: number;
    inserted: number;
    normalized: number;
  };
  warnings: string[];
}>;
