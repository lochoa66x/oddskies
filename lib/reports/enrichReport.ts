import {
  enrichReportDraft as enrichReportDraftCore,
  pickReportEnrichmentColumns as pickReportEnrichmentColumnsCore,
  REPORT_ENRICHMENT_COLUMNS as REPORT_ENRICHMENT_COLUMNS_CORE,
} from "./enrich-report-core.mjs";

export type ReportEnrichment = {
  display_title: string;
  display_summary: string;
  enrichment_notes: string[];
  has_location: boolean;
  has_media_hint: boolean;
  has_source_link: boolean;
  has_time: boolean;
  last_enriched_at: string;
  mood_label: string;
  oracle_prompt_seed: string | null;
  oracle_ready: boolean;
  short_label: string;
  source_quality_label: string;
  source_quality_reasons: string[];
};

export const REPORT_ENRICHMENT_COLUMNS =
  REPORT_ENRICHMENT_COLUMNS_CORE as readonly (keyof ReportEnrichment)[];

export function enrichReportDraft(
  report: Record<string, unknown>,
  options: { now?: string } = {},
): ReportEnrichment {
  return enrichReportDraftCore(report, options) as ReportEnrichment;
}

export function pickReportEnrichmentColumns(
  enrichment: Partial<ReportEnrichment>,
) {
  return pickReportEnrichmentColumnsCore(enrichment) as Partial<ReportEnrichment>;
}
