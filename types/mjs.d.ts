declare module "*.mjs" {
  export const REPORT_ENRICHMENT_COLUMNS: readonly string[];
  export function enrichReportDraft(
    report: Record<string, unknown>,
    options?: { now?: string },
  ): unknown;
  export function pickReportEnrichmentColumns(
    enrichment: Record<string, unknown>,
  ): Record<string, unknown>;

  const moduleExports: unknown;

  export default moduleExports;
}
