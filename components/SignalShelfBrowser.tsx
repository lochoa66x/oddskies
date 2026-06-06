"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type CuratedLink,
  isExternalCuratedLink,
} from "@/lib/curated-links";

type SignalShelfBrowserProps = {
  links: CuratedLink[];
};

const allValue = "All";

export function SignalShelfBrowser({ links }: SignalShelfBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allValue);
  const [linkType, setLinkType] = useState(allValue);
  const [region, setRegion] = useState(allValue);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const categories = useFacetOptions(links, "category");
  const linkTypes = useFacetOptions(links, "linkType");
  const regions = useFacetOptions(links, "region");

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return links.filter((link) => {
      const matchesCategory =
        category === allValue || link.category === category;
      const matchesType = linkType === allValue || link.linkType === linkType;
      const matchesRegion = region === allValue || link.region === region;
      const matchesFeatured = !featuredOnly || link.isFeatured;
      const searchable = [
        link.title,
        link.description,
        link.sourceName,
        link.category,
        link.linkType,
        link.region,
        link.safetyLabel,
        link.notes,
        ...link.tags,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchable.includes(normalizedQuery);

      return (
        matchesCategory &&
        matchesType &&
        matchesRegion &&
        matchesFeatured &&
        matchesQuery
      );
    });
  }, [category, featuredOnly, linkType, links, query, region]);

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[17rem_1fr]">
      <aside className="h-fit rounded-lg border border-night-800 bg-night-900/70 p-4">
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted"
            htmlFor="signal-shelf-search"
          >
            Search shelf
          </label>
          <input
            className="mt-2 w-full rounded-md border border-night-800 bg-night-950 px-3 py-2 text-sm text-parchment outline-none transition placeholder:text-slate-600 focus:border-signal-teal"
            id="signal-shelf-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="source, category, tag..."
            type="search"
            value={query}
          />
        </div>

        <FacetSelect
          label="Category"
          onChange={setCategory}
          options={categories}
          value={category}
        />
        <FacetSelect
          label="Type"
          onChange={setLinkType}
          options={linkTypes}
          value={linkType}
        />
        <FacetSelect
          label="Region"
          onChange={setRegion}
          options={regions}
          value={region}
        />

        <label className="mt-4 flex items-center gap-2 rounded-md border border-night-800 bg-night-950 px-3 py-2 text-sm font-semibold text-parchment">
          <input
            checked={featuredOnly}
            className="size-4 accent-signal-teal"
            onChange={(event) => setFeaturedOnly(event.target.checked)}
            type="checkbox"
          />
          Featured only
        </label>

        <p className="mt-4 rounded-md border border-signal-amber/35 bg-signal-amber/10 p-3 text-xs leading-5 text-signal-amber">
          Signal Shelf is curated navigation. It is not the Field Log, not an
          endorsement, and not verification.
        </p>
      </aside>

      <section aria-label="Signal Shelf links">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-muted">
            Showing {filteredLinks.length} of {links.length} shelf links
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Curated, cautious, source-aware
          </p>
        </div>

        {filteredLinks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredLinks.map((link) => (
              <SignalShelfCard key={link.id} link={link} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-night-800 bg-night-900/70 p-6">
            <p className="text-lg font-semibold text-parchment">
              Nothing glowing in this filter.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Clear a filter or search for a broader source trail.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function SignalShelfCard({ link }: { link: CuratedLink }) {
  const isExternal = isExternalCuratedLink(link.url);
  const actionLabel = isExternal ? "Open source" : "Open OddSkies page";

  return (
    <article className="field-card flex min-h-80 flex-col justify-between rounded-lg p-4">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-teal">
              Signal Shelf
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-parchment">
              {link.title}
            </h2>
          </div>
          {link.isFeatured ? (
            <span className="rounded-md border border-signal-violet/50 bg-signal-violet/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-signal-violet">
              Featured
            </span>
          ) : null}
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">{link.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{link.category}</Badge>
          <Badge>{formatLabel(link.linkType)}</Badge>
          <Badge>{link.region}</Badge>
          <Badge tone="amber">{formatLabel(link.safetyLabel)}</Badge>
        </div>

        <div className="mt-4 grid gap-3 border-t border-night-800 pt-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Source
            </p>
            <p className="mt-1 font-semibold text-parchment">
              {link.sourceName}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Trail note
            </p>
            <p className="mt-1 font-semibold text-parchment">
              {link.notes || "Curated for browsing context."}
            </p>
          </div>
        </div>

        {link.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {link.tags.map((tag) => (
              <span className="text-xs text-muted" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {isExternal ? (
          <a
            className="source-link inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold"
            href={link.url}
            rel="noreferrer"
            target="_blank"
          >
            {actionLabel}
          </a>
        ) : (
          <Link
            className="source-link inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold"
            href={link.url}
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </article>
  );
}

function FacetSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        className="mt-2 w-full rounded-md border border-night-800 bg-night-950 px-3 py-2 text-sm font-semibold text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value={allValue}>{allValue}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: string;
  tone?: "amber" | "default";
}) {
  return (
    <span
      className={
        tone === "amber"
          ? "rounded-md border border-signal-amber/45 bg-signal-amber/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-signal-amber"
          : "rounded-md border border-night-800 bg-night-950/70 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted"
      }
    >
      {formatLabel(children)}
    </span>
  );
}

function useFacetOptions(links: CuratedLink[], field: keyof CuratedLink) {
  return useMemo(() => {
    return Array.from(
      new Set(
        links
          .map((link) => link[field])
          .filter((value): value is string => typeof value === "string")
          .filter((value) => value.length > 0),
      ),
    ).sort((left, right) => left.localeCompare(right));
  }, [field, links]);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
