import "server-only";

export type LocationConfidence = "none" | "low" | "medium" | "high";

export type LocationResolution =
  | "none"
  | "city"
  | "region"
  | "country"
  | "landmark"
  | "approximate"
  | "private_or_sensitive";

export type LocationNormalization = {
  last_location_normalized_at: string;
  location_confidence: LocationConfidence;
  location_resolution: LocationResolution;
  location_warnings: string[];
  normalized_country: string | null;
  normalized_latitude: number | null;
  normalized_location_name: string | null;
  normalized_longitude: number | null;
  normalized_region: string | null;
};

export type NormalizableRawSource = {
  extracted_location_text?: string | null;
  location_hint?: string | null;
  normalized_location_name?: string | null;
  raw_text?: string | null;
  raw_title?: string | null;
};

type LocationNormalizerCore = {
  normalizeLocation: (rawSource: NormalizableRawSource) => LocationNormalization;
};

export async function normalizeLocation(rawSource: NormalizableRawSource) {
  const core = (await import(
    "./normalize-location-core.mjs"
  )) as unknown as LocationNormalizerCore;

  return core.normalizeLocation(rawSource);
}
