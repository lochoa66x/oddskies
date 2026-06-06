export type FediverseSourceInput =
  | string
  | {
      category?: string | null;
      instance: string;
      tag: string;
    };

export function createFediverseCollectorConfig(
  env: NodeJS.ProcessEnv,
  options?: {
    dryRun?: boolean;
    limit?: number;
    maxFetchedPerRun?: number;
    maxResultsPerSource?: number;
    maxSources?: number;
    sources?: FediverseSourceInput[];
  },
): unknown;

export function collectFediverse(config: unknown): Promise<{
  dryRun: boolean;
  errors: string[];
  queries: Array<{
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
  }>;
  sources: Array<{
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
  }>;
  totals: {
    duplicatesSkipped: number;
    emptySkipped: number;
    exclusionsSkipped: number;
    fetched: number;
    inserted: number;
    insertedIds: string[];
    normalized: number;
    repliesSkipped?: number;
  };
  warnings: string[];
}>;
