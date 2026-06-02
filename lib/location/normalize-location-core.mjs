const KNOWN_PLACES = [
  place("Montreal, Quebec", ["montreal", "montréal"], "Quebec", "Canada", 45.5017, -73.5673, "city"),
  place("Quebec City, Quebec", ["quebec city", "québec city"], "Quebec", "Canada", 46.8139, -71.208, "city"),
  place("Toronto, Ontario", ["toronto"], "Ontario", "Canada", 43.6532, -79.3832, "city"),
  place("Vancouver, British Columbia", ["vancouver"], "British Columbia", "Canada", 49.2827, -123.1207, "city"),
  place("Ottawa, Ontario", ["ottawa"], "Ontario", "Canada", 45.4215, -75.6972, "city"),
  place("Saint-Constant, Quebec", ["saint-constant", "saint constant"], "Quebec", "Canada", 45.37, -73.57, "city"),
  place("Sedona, Arizona", ["sedona"], "Southwest", "United States", 34.8697, -111.761, "city"),
  place("Phoenix, Arizona", ["phoenix"], "Southwest", "United States", 33.4484, -112.074, "city"),
  place("Lake Erie, Ohio", ["lake erie"], "Great Lakes", "United States", 41.75, -81.2, "landmark"),
  place("Salem, Massachusetts", ["salem"], "Northeast", "United States", 42.5195, -70.8967, "city"),
  place("Anoka, Minnesota", ["anoka"], "Midwest", "United States", 45.1977, -93.3872, "city"),
  place("Detroit, Michigan", ["detroit"], "Midwest", "United States", 42.3314, -83.0458, "city"),
  place("Nevada Desert", ["nevada desert"], "Southwest", "United States", 38.8026, -116.4194, "region"),
  place("Las Vegas, Nevada", ["las vegas"], "Southwest", "United States", 36.1716, -115.1391, "city"),
  place("Cape Cod, Massachusetts", ["cape cod"], "Northeast", "United States", 41.6688, -70.2962, "region"),
  place("Black River Falls, Wisconsin", ["black river falls"], "Midwest", "United States", 44.2947, -90.8515, "city"),
  place("Popocatépetl, Puebla", ["popocatepetl", "popocatépetl"], "Central Mexico", "Mexico", 19.023, -98.622, "landmark"),
  place("Mexico City", ["mexico city"], "Central Mexico", "Mexico", 19.4326, -99.1332, "city"),
  place("Puebla", ["puebla"], "Central Mexico", "Mexico", 19.0414, -98.2063, "city"),
  place("Monterrey", ["monterrey"], "Nuevo Leon", "Mexico", 25.6866, -100.3161, "city"),
  place("Guadalajara", ["guadalajara"], "Jalisco", "Mexico", 20.6597, -103.3496, "city"),
  place("São Paulo", ["sao paulo", "são paulo"], "Southeast Brazil", "Brazil", -23.5558, -46.6396, "city"),
  place("Rio de Janeiro", ["rio de janeiro"], "Southeast Brazil", "Brazil", -22.9068, -43.1729, "city"),
  place("Brasília", ["brasilia", "brasília"], "Central-West Brazil", "Brazil", -15.7975, -47.8919, "city"),
  place("Edinburgh, Scotland", ["edinburgh"], "United Kingdom / Ireland", "United Kingdom", 55.9533, -3.1883, "city"),
  place("Dublin, Ireland", ["dublin"], "United Kingdom / Ireland", "Ireland", 53.3498, -6.2603, "city"),
  place("London, England", ["london"], "United Kingdom / Ireland", "United Kingdom", 51.5072, -0.1276, "city"),
  place("Transylvania, Romania", ["transylvania"], "Western Europe", "Romania", 46.7667, 23.5833, "region"),
  place("Prague, Czechia", ["prague"], "Western Europe", "Czechia", 50.0755, 14.4378, "city"),
  place("Paris, France", ["paris"], "Western Europe", "France", 48.8566, 2.3522, "city"),
  place("Madrid, Spain", ["madrid"], "Western Europe", "Spain", 40.4168, -3.7038, "city"),
  place("Rome, Italy", ["rome"], "Western Europe", "Italy", 41.9028, 12.4964, "city"),
  place("Tokyo, Japan", ["tokyo"], "East Asia", "Japan", 35.6762, 139.6503, "city"),
  place("Kyoto, Japan", ["kyoto"], "East Asia", "Japan", 35.0116, 135.7681, "city"),
  place("Osaka, Japan", ["osaka"], "East Asia", "Japan", 34.6937, 135.5023, "city"),
  place("Northern Territory Outback, Australia", ["northern territory outback", "outback"], "Oceania", "Australia", -19.4914, 132.5509, "region"),
  place("Sydney, Australia", ["sydney"], "Oceania", "Australia", -33.8688, 151.2093, "city"),
  place("Melbourne, Australia", ["melbourne"], "Oceania", "Australia", -37.8136, 144.9631, "city"),
  place("South Island, New Zealand", ["south island"], "Oceania", "New Zealand", -43.5, 170.5, "region"),
  place("Auckland, New Zealand", ["auckland"], "Oceania", "New Zealand", -36.8509, 174.7645, "city"),
];

const PRIVATE_LOCATION_PATTERNS = [
  /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|way|circle|cir)\b/i,
  /\b(?:apt|apartment|unit|suite|ste|room|rm)\s*#?\s*[A-Za-z0-9-]+\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  /\bmy house\b/i,
  /\bmy apartment\b/i,
  /\bmy neighbor'?s house\b/i,
  /\bat my address\b/i,
  /\bmy school\b/i,
  /\bmy workplace\b/i,
];

const LOCATION_PATTERN =
  /\b(?:in|over|near|above|at|around|outside)\s+([A-Z][\p{L}.'-]*(?:\s+[A-Z][\p{L}.'-]*){0,3})/u;

export function normalizeLocation(rawSource) {
  const text = [
    rawSource.location_hint,
    rawSource.extracted_location_text,
    rawSource.raw_title,
    rawSource.raw_text,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ");
  const warnings = [];

  if (PRIVATE_LOCATION_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      last_location_normalized_at: new Date().toISOString(),
      location_confidence: "low",
      location_resolution: "private_or_sensitive",
      location_warnings: ["possible_private_location"],
      normalized_country: null,
      normalized_latitude: null,
      normalized_location_name: null,
      normalized_longitude: null,
      normalized_region: null,
    };
  }

  const normalizedText = normalizeForSearch(text);
  const matchedPlace = KNOWN_PLACES.find((knownPlace) =>
    knownPlace.aliases.some((alias) => normalizedText.includes(alias)),
  );

  if (matchedPlace) {
    if (matchedPlace.resolution !== "city") {
      warnings.push("approximate_location");
    }

    return {
      last_location_normalized_at: new Date().toISOString(),
      location_confidence: matchedPlace.resolution === "region" ? "medium" : "high",
      location_resolution: matchedPlace.resolution,
      location_warnings: warnings,
      normalized_country: matchedPlace.country,
      normalized_latitude: matchedPlace.latitude,
      normalized_location_name: matchedPlace.name,
      normalized_longitude: matchedPlace.longitude,
      normalized_region: matchedPlace.region,
    };
  }

  const phraseMatch = text.match(LOCATION_PATTERN);

  if (phraseMatch?.[1]) {
    return {
      last_location_normalized_at: new Date().toISOString(),
      location_confidence: "low",
      location_resolution: "approximate",
      location_warnings: ["unmatched_location_phrase", "needs_manual_location_review"],
      normalized_country: null,
      normalized_latitude: null,
      normalized_location_name: phraseMatch[1].trim(),
      normalized_longitude: null,
      normalized_region: null,
    };
  }

  return {
    last_location_normalized_at: new Date().toISOString(),
    location_confidence: "none",
    location_resolution: "none",
    location_warnings: ["no_location_match"],
    normalized_country: null,
    normalized_latitude: null,
    normalized_location_name: null,
    normalized_longitude: null,
    normalized_region: null,
  };
}

function place(name, aliases, region, country, latitude, longitude, resolution) {
  return {
    aliases: aliases.map(normalizeForSearch),
    country,
    latitude,
    longitude,
    name,
    region,
    resolution,
  };
}

function normalizeForSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
