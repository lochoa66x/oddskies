import "server-only";

export const curatedLinkTypeOptions = [
  "archive",
  "article",
  "case_context",
  "culture_note",
  "debunk_or_explanation",
  "external_reference",
  "internal_resource",
  "official_source",
  "rabbit_hole",
  "source_guidance",
  "tool",
  "video",
] as const;

export const curatedLinkSafetyLabelOptions = [
  "archive",
  "culture_note",
  "debunk_or_explanation",
  "internal_resource",
  "official_source",
  "rabbit_hole",
  "tool",
  "unverified_resource",
] as const;

export type AdminCuratedLink = {
  category: string;
  createdAt: string;
  description: string;
  id: string;
  isActive: boolean;
  isFeatured: boolean;
  linkType: string;
  notes: string;
  publishedAt: string;
  region: string;
  safetyLabel: string;
  sortOrder: number;
  sourceName: string;
  tags: string[];
  title: string;
  updatedAt: string;
  url: string;
};

export type CuratedLinkInput = Partial<{
  category: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  linkType: string;
  notes: string;
  publishedAt: string;
  region: string;
  safetyLabel: string;
  sortOrder: number;
  sourceName: string;
  tags: string[] | string;
  title: string;
  url: string;
}>;

type CuratedLinkRow = {
  category: string | null;
  created_at: string;
  description: string | null;
  id: string;
  is_active: boolean;
  is_featured: boolean;
  link_type: string | null;
  notes: string | null;
  published_at: string;
  region: string | null;
  safety_label: string | null;
  sort_order: number | null;
  source_name: string | null;
  tags: string[] | null;
  title: string;
  updated_at: string;
  url: string;
};

const CURATED_LINK_SELECT = [
  "id",
  "title",
  "description",
  "url",
  "source_name",
  "category",
  "link_type",
  "region",
  "tags",
  "is_featured",
  "is_active",
  "sort_order",
  "safety_label",
  "notes",
  "published_at",
  "created_at",
  "updated_at",
].join(",");

export async function listAdminCuratedLinks() {
  const config = getSupabaseAdminConfig();
  const endpoint = new URL("/rest/v1/curated_links", config.supabaseUrl);

  endpoint.searchParams.set("select", CURATED_LINK_SELECT);
  endpoint.searchParams.set(
    "order",
    "is_active.desc,is_featured.desc,sort_order.asc,published_at.desc",
  );

  const response = await supabaseFetch(config, endpoint);
  const rows = (await response.json()) as CuratedLinkRow[];

  return rows.map(normalizeCuratedLinkRow);
}

export async function createAdminCuratedLink(input: CuratedLinkInput) {
  const config = getSupabaseAdminConfig();
  const payload = buildCuratedLinkPayload(input, { requireRequiredFields: true });
  const endpoint = new URL("/rest/v1/curated_links", config.supabaseUrl);

  const response = await supabaseFetch(config, endpoint, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "POST",
  });
  const rows = (await response.json()) as CuratedLinkRow[];

  return normalizeCuratedLinkRow(rows[0]);
}

export async function updateAdminCuratedLink(
  id: string,
  input: CuratedLinkInput,
) {
  const config = getSupabaseAdminConfig();
  const payload = buildCuratedLinkPayload(input, { requireRequiredFields: false });
  const endpoint = new URL("/rest/v1/curated_links", config.supabaseUrl);

  if (Object.keys(payload).length === 0) {
    throw new Error("No curated link fields were provided.");
  }

  endpoint.searchParams.set("id", `eq.${id}`);

  const response = await supabaseFetch(config, endpoint, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method: "PATCH",
  });
  const rows = (await response.json()) as CuratedLinkRow[];

  if (!rows[0]) {
    throw new Error("Curated link not found.");
  }

  return normalizeCuratedLinkRow(rows[0]);
}

function buildCuratedLinkPayload(
  input: CuratedLinkInput,
  { requireRequiredFields }: { requireRequiredFields: boolean },
) {
  const payload: Record<string, unknown> = {};
  const title = readString(input.title);
  const url = readString(input.url);
  const description = readString(input.description);
  const linkType = readString(input.linkType);
  const safetyLabel = readString(input.safetyLabel);
  const sortOrder = readNumber(input.sortOrder);

  if (requireRequiredFields && !title) {
    throw new Error("Title is required.");
  }

  if (requireRequiredFields && !url) {
    throw new Error("URL is required.");
  }

  if (title !== undefined) {
    if (!title) {
      throw new Error("Title is required.");
    }

    payload.title = title;
  }

  if (url !== undefined) {
    if (!url) {
      throw new Error("URL is required.");
    }

    if (!isAllowedUrl(url)) {
      throw new Error("URL must be http(s) or an internal OddSkies path.");
    }

    payload.url = url;
  }

  if (description !== undefined) {
    if (description.length > 320) {
      throw new Error("Description should stay under 320 characters.");
    }

    payload.description = description;
  }

  setOptionalText(payload, "source_name", input.sourceName);
  setOptionalText(payload, "category", input.category);
  setOptionalText(payload, "region", input.region);
  setOptionalText(payload, "notes", input.notes);

  if (linkType !== undefined) {
    if (!curatedLinkTypeOptions.includes(linkType as CuratedLinkType)) {
      throw new Error(`Invalid link type: ${linkType}.`);
    }

    payload.link_type = linkType;
  }

  if (safetyLabel !== undefined) {
    if (
      !curatedLinkSafetyLabelOptions.includes(
        safetyLabel as CuratedLinkSafetyLabel,
      )
    ) {
      throw new Error(`Invalid safety label: ${safetyLabel}.`);
    }

    payload.safety_label = safetyLabel;
  }

  if (input.tags !== undefined) {
    payload.tags = normalizeTags(input.tags);
  }

  if (typeof input.isActive === "boolean") {
    payload.is_active = input.isActive;
  }

  if (typeof input.isFeatured === "boolean") {
    payload.is_featured = input.isFeatured;
  }

  if (sortOrder !== undefined) {
    payload.sort_order = sortOrder;
  }

  return payload;
}

type CuratedLinkType = (typeof curatedLinkTypeOptions)[number];
type CuratedLinkSafetyLabel = (typeof curatedLinkSafetyLabelOptions)[number];

function normalizeCuratedLinkRow(row: CuratedLinkRow): AdminCuratedLink {
  return {
    category: row.category ?? "",
    createdAt: row.created_at,
    description: row.description ?? "",
    id: row.id,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    linkType: row.link_type ?? "external_reference",
    notes: row.notes ?? "",
    publishedAt: row.published_at,
    region: row.region ?? "",
    safetyLabel: row.safety_label ?? "unverified_resource",
    sortOrder: row.sort_order ?? 0,
    sourceName: row.source_name ?? "",
    tags: row.tags ?? [],
    title: row.title,
    updatedAt: row.updated_at,
    url: row.url,
  };
}

function setOptionalText(
  payload: Record<string, unknown>,
  column: string,
  value: unknown,
) {
  if (value !== undefined) {
    payload[column] = readString(value) ?? "";
  }
}

function readString(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error("Sort order must be a number.");
  }

  return Math.trunc(number);
}

function normalizeTags(value: string[] | string) {
  const values = Array.isArray(value) ? value : value.split(",");

  return Array.from(
    new Set(
      values
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)
        .map((tag) => tag.replace(/\s+/g, "-")),
    ),
  );
}

function isAllowedUrl(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(url);

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

type SupabaseAdminConfig = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

function getSupabaseAdminConfig(): SupabaseAdminConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  if (serviceRoleKey.startsWith("sb_publishable_")) {
    throw new Error("Use the server-only Supabase secret key, not a publishable key.");
  }

  return { serviceRoleKey, supabaseUrl };
}

async function supabaseFetch(
  config: SupabaseAdminConfig,
  endpoint: URL,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);

  headers.set("apikey", config.serviceRoleKey);
  headers.set("Authorization", `Bearer ${config.serviceRoleKey}`);

  const response = await fetch(endpoint, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Supabase request failed (${response.status}): ${await response.text()}`,
    );
  }

  return response;
}
