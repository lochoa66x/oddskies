import "server-only";

export type ScorableRawSource = {
  author_handle?: string | null;
  category_guess?: string | null;
  event_datetime_guess?: string | null;
  id?: string | null;
  location_hint?: string | null;
  platform?: string | null;
  posted_at?: string | null;
  raw_media_url?: string | null;
  raw_text?: string | null;
  raw_title?: string | null;
  source_post_id?: string | null;
  source_url?: string | null;
};

export type RawSourceCurationScore = {
  curation_label: string;
  curation_reasons: string[];
  curation_score: number;
  extracted_country_guess: string | null;
  extracted_event_datetime_text: string | null;
  extracted_location_text: string | null;
  extracted_region_guess: string | null;
  has_location_hint: boolean;
  has_media_hint: boolean;
  has_time_hint: boolean;
  last_scored_at: string;
  normalized_summary: string | null;
  normalized_title: string | null;
  possible_ai_generated: boolean;
  possible_duplicate: boolean;
  possible_joke: boolean;
  possible_private_location: boolean;
};

export type ScoreRawSourceOptions = {
  possibleDuplicate?: boolean;
};

type ScoreRawSourceCore = {
  scoreRawSource: (
    rawSource: ScorableRawSource,
    options?: ScoreRawSourceOptions,
  ) => RawSourceCurationScore;
};

export async function scoreRawSource(
  rawSource: ScorableRawSource,
  options: ScoreRawSourceOptions = {},
) {
  const core = (await import(
    "./score-raw-source-core.mjs"
  )) as unknown as ScoreRawSourceCore;

  return core.scoreRawSource(rawSource, options);
}
