export type CuratedLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceName: string;
  category: string;
  linkType: string;
  region: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  safetyLabel: string;
  notes: string;
  publishedAt: string;
};

type CuratedLinkRow = Record<string, unknown>;

const fallbackCuratedLinks: CuratedLink[] = [
  {
    category: "OddSkies",
    description:
      "How OddSkies treats source trails, public links, screenshots, and uncertainty before anything reaches the Field Log.",
    id: "fallback-source-guidelines",
    isActive: true,
    isFeatured: true,
    linkType: "source_guidance",
    notes: "Internal reference. Useful before sending or reading a signal.",
    publishedAt: "2026-06-06T00:00:00.000Z",
    region: "Global",
    safetyLabel: "internal_resource",
    sortOrder: 10,
    sourceName: "OddSkies",
    tags: ["sources", "review", "privacy"],
    title: "Source Guidelines",
    url: "/source-guidelines",
  },
  {
    category: "OddSkies",
    description:
      "The full public archive of approved, source-linked field notes. Still unverified, just easier to browse.",
    id: "fallback-field-log",
    isActive: true,
    isFeatured: true,
    linkType: "archive",
    notes: "Internal archive. Reports are browsable, not confirmed.",
    publishedAt: "2026-06-06T00:00:00.000Z",
    region: "Global",
    safetyLabel: "internal_resource",
    sortOrder: 20,
    sourceName: "OddSkies",
    tags: ["field-log", "reports", "archive"],
    title: "Full Field Log",
    url: "/field-log",
  },
  {
    category: "OddSkies",
    description:
      "A cautious intake doorway for public source links or screenshots that should wait for human review.",
    id: "fallback-send-signal",
    isActive: true,
    isFeatured: true,
    linkType: "tool",
    notes: "Internal intake. Nothing submitted here publishes automatically.",
    publishedAt: "2026-06-06T00:00:00.000Z",
    region: "Global",
    safetyLabel: "internal_resource",
    sortOrder: 30,
    sourceName: "OddSkies",
    tags: ["submission", "review", "staging"],
    title: "Send a Signal",
    url: "/send-signal",
  },
  {
    category: "Browse",
    description:
      "Browse public reports by broad strange-report category without treating any category as proof.",
    id: "fallback-categories",
    isActive: true,
    isFeatured: false,
    linkType: "archive",
    notes: "Internal browse page.",
    publishedAt: "2026-06-06T00:00:00.000Z",
    region: "Global",
    safetyLabel: "internal_resource",
    sortOrder: 40,
    sourceName: "OddSkies",
    tags: ["categories", "field-log"],
    title: "Category Index",
    url: "/categories",
  },
  {
    category: "Browse",
    description:
      "Browse public reports by region while keeping location confidence and source context in view.",
    id: "fallback-regions",
    isActive: true,
    isFeatured: false,
    linkType: "archive",
    notes: "Internal browse page.",
    publishedAt: "2026-06-06T00:00:00.000Z",
    region: "Global",
    safetyLabel: "internal_resource",
    sortOrder: 50,
    sourceName: "OddSkies",
    tags: ["regions", "field-log"],
    title: "Region Index",
    url: "/regions",
  },
];

export async function getCuratedLinks(): Promise<CuratedLink[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackCuratedLinks;
  }

  try {
    const endpoint = new URL("/rest/v1/curated_links", supabaseUrl);
    endpoint.searchParams.set("select", "*");
    endpoint.searchParams.set("is_active", "eq.true");

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return fallbackCuratedLinks;
    }

    const rows = (await response.json()) as CuratedLinkRow[];
    const links = rows
      .map(normalizeCuratedLink)
      .filter((link): link is CuratedLink => link !== null);

    if (links.length === 0) {
      return fallbackCuratedLinks;
    }

    return sortCuratedLinks(links);
  } catch {
    return fallbackCuratedLinks;
  }
}

export function getFeaturedCuratedLinks(
  links: CuratedLink[],
  limit = 3,
): CuratedLink[] {
  const featured = links.filter((link) => link.isFeatured);

  return (featured.length > 0 ? featured : links).slice(0, limit);
}

export function isExternalCuratedLink(url: string) {
  return /^https?:\/\//i.test(url);
}

function normalizeCuratedLink(row: CuratedLinkRow): CuratedLink | null {
  const title = readString(row.title);
  const url = readString(row.url);

  if (!title || !url) {
    return null;
  }

  return {
    category: readString(row.category) || "Unsorted",
    description: readString(row.description),
    id: readString(row.id) || url,
    isActive: readBoolean(row.is_active, true),
    isFeatured: readBoolean(row.is_featured, false),
    linkType: readString(row.link_type) || "external_reference",
    notes: readString(row.notes),
    publishedAt:
      readString(row.published_at) ||
      readString(row.created_at) ||
      new Date(0).toISOString(),
    region: readString(row.region) || "Global",
    safetyLabel: readString(row.safety_label) || "unverified_resource",
    sortOrder: readNumber(row.sort_order),
    sourceName: readString(row.source_name) || "Source trail",
    tags: readStringArray(row.tags),
    title,
    url,
  };
}

function sortCuratedLinks(links: CuratedLink[]) {
  return [...links].sort((left, right) => {
    if (left.isFeatured !== right.isFeatured) {
      return left.isFeatured ? -1 : 1;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return (
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime()
    );
  });
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => readString(item))
    .filter((item) => item.length > 0);
}
