"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminCuratedLink = {
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

type FormState = {
  category: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  linkType: string;
  notes: string;
  region: string;
  safetyLabel: string;
  sortOrder: string;
  sourceName: string;
  tags: string;
  title: string;
  url: string;
};

const linkTypeOptions = [
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

const safetyLabelOptions = [
  "archive",
  "culture_note",
  "debunk_or_explanation",
  "internal_resource",
  "official_source",
  "rabbit_hole",
  "tool",
  "unverified_resource",
] as const;

const emptyForm: FormState = {
  category: "OddSkies",
  description: "",
  isActive: true,
  isFeatured: false,
  linkType: "external_reference",
  notes: "",
  region: "Global",
  safetyLabel: "unverified_resource",
  sortOrder: "100",
  sourceName: "",
  tags: "",
  title: "",
  url: "",
};

export function CuratedLinksAdmin() {
  const [rows, setRows] = useState<AdminCuratedLink[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [safetyFilter, setSafetyFilter] = useState("");

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );
  const categories = useFacet(rows, "category");
  const regions = useFacet(rows, "region");
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const searchable = [
        row.title,
        row.description,
        row.sourceName,
        row.url,
        row.category,
        row.linkType,
        row.region,
        row.safetyLabel,
        row.notes,
        ...row.tags,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (!categoryFilter || row.category === categoryFilter) &&
        (!typeFilter || row.linkType === typeFilter) &&
        (!regionFilter || row.region === regionFilter) &&
        (!safetyFilter || row.safetyLabel === safetyFilter) &&
        (!activeFilter ||
          (activeFilter === "active" ? row.isActive : !row.isActive)) &&
        (!featuredFilter ||
          (featuredFilter === "featured" ? row.isFeatured : !row.isFeatured))
      );
    });
  }, [
    activeFilter,
    categoryFilter,
    featuredFilter,
    query,
    regionFilter,
    rows,
    safetyFilter,
    typeFilter,
  ]);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const body = await adminFetch<{ rows: AdminCuratedLink[] }>(
        "/api/admin/curated-links",
      );

      setRows(body.rows);
      setSelectedId((current) =>
        body.rows.some((row) => row.id === current) ? current : "",
      );
    } catch (loadError) {
      setError(formatError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  function selectRow(row: AdminCuratedLink) {
    setSelectedId(row.id);
    setForm(linkToForm(row));
    setError("");
  }

  function startNewLink() {
    setSelectedId("");
    setForm(emptyForm);
    setError("");
  }

  async function saveLink() {
    setActionLoading("save");
    setError("");

    try {
      const payload = formToPayload(form);
      const endpoint = selected
        ? `/api/admin/curated-links/${selected.id}`
        : "/api/admin/curated-links";
      const method = selected ? "PATCH" : "POST";
      const body = await adminFetch<{ row: AdminCuratedLink }>(endpoint, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method,
      });

      await loadLinks();
      setSelectedId(body.row.id);
      setForm(linkToForm(body.row));
    } catch (saveError) {
      setError(formatError(saveError));
    } finally {
      setActionLoading("");
    }
  }

  async function patchSelected(patch: Partial<FormState>) {
    if (!selected) {
      return;
    }

    setActionLoading("patch");
    setError("");

    try {
      const body = await adminFetch<{ row: AdminCuratedLink }>(
        `/api/admin/curated-links/${selected.id}`,
        {
          body: JSON.stringify(formToPayload({ ...form, ...patch })),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );

      await loadLinks();
      setSelectedId(body.row.id);
      setForm(linkToForm(body.row));
    } catch (patchError) {
      setError(formatError(patchError));
    } finally {
      setActionLoading("");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-night-800 bg-night-900 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <FilterInput label="Search" onChange={setQuery} value={query} />
          <FilterSelect
            label="Category"
            onChange={setCategoryFilter}
            value={categoryFilter}
          >
            <option value="">Any category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Type" onChange={setTypeFilter} value={typeFilter}>
            <option value="">Any type</option>
            {linkTypeOptions.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Region"
            onChange={setRegionFilter}
            value={regionFilter}
          >
            <option value="">Any region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Active"
            onChange={setActiveFilter}
            value={activeFilter}
          >
            <option value="">Any</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
          <FilterSelect
            label="Featured"
            onChange={setFeaturedFilter}
            value={featuredFilter}
          >
            <option value="">Any</option>
            <option value="featured">Featured</option>
            <option value="not_featured">Not featured</option>
          </FilterSelect>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterSelect
            className="min-w-60"
            label="Safety"
            onChange={setSafetyFilter}
            value={safetyFilter}
          >
            <option value="">Any safety label</option>
            {safetyLabelOptions.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </FilterSelect>
          <button className={secondaryButtonClass} onClick={() => void loadLinks()}>
            Refresh
          </button>
          <button className={secondaryButtonClass} onClick={startNewLink}>
            New link
          </button>
          <button className={secondaryButtonClass} onClick={() => void logout()}>
            Lock
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-signal-ember/40 bg-signal-ember/10 px-4 py-3 text-sm text-signal-ember">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)]">
        <div className="rounded-lg border border-night-800 bg-night-900">
          <div className="flex items-center justify-between border-b border-night-800 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
                Shelf records
              </p>
              <p className="mt-1 text-sm text-muted">
                {loading ? "Loading..." : `${filteredRows.length} curated links`}
              </p>
            </div>
          </div>
          <div className="max-h-[760px] space-y-3 overflow-y-auto p-3">
            {filteredRows.length === 0 && !loading ? (
              <p className="rounded-lg border border-night-800 bg-night-950 p-4 text-sm text-muted">
                No Signal Shelf links match these filters.
              </p>
            ) : null}
            {filteredRows.map((row) => (
              <button
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedId === row.id
                    ? "border-signal-teal bg-signal-teal/10"
                    : "border-night-800 bg-night-950 hover:border-night-800/80 hover:bg-night-850"
                }`}
                key={row.id}
                onClick={() => selectRow(row)}
                type="button"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill active={row.isActive} />
                  {row.isFeatured ? <Pill tone="violet">featured</Pill> : null}
                  <Pill>{formatLabel(row.linkType)}</Pill>
                  <Pill tone="amber">{formatLabel(row.safetyLabel)}</Pill>
                </div>
                <p className="mt-3 text-base font-semibold text-parchment">
                  {row.title}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {row.description || "No description yet."}
                </p>
                <p className="mt-3 break-words text-xs text-signal-teal">
                  {row.url}
                </p>
                <div className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
                  <span>Source: {row.sourceName || "Unknown"}</span>
                  <span>Sort: {row.sortOrder}</span>
                  <span>Category: {row.category || "Unsorted"}</span>
                  <span>Region: {row.region || "Global"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-night-800 bg-night-900 p-4 md:p-5">
          <div className="flex flex-col gap-3 border-b border-night-800 pb-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
                {selected ? "Edit shelf link" : "Create shelf link"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {selected ? selected.title : "New Signal Shelf link"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Signal Shelf links are browsing aids, not verification.
              </p>
            </div>
            {selected ? (
              <div className="flex flex-wrap gap-2">
                <StatusPill active={selected.isActive} />
                {selected.isFeatured ? <Pill tone="violet">featured</Pill> : null}
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <FormInput
              className="md:col-span-2"
              label="Title"
              onChange={(title) => setForm((current) => ({ ...current, title }))}
              value={form.title}
            />
            <FormInput
              className="md:col-span-2"
              label="URL"
              onChange={(url) => setForm((current) => ({ ...current, url }))}
              value={form.url}
            />
            <FormTextArea
              className="md:col-span-2"
              label="Description"
              onChange={(description) =>
                setForm((current) => ({ ...current, description }))
              }
              placeholder="Short public description. Keep it useful, not breathless."
              value={form.description}
            />
            <FormInput
              label="Source name"
              onChange={(sourceName) =>
                setForm((current) => ({ ...current, sourceName }))
              }
              value={form.sourceName}
            />
            <FormInput
              label="Category"
              onChange={(category) =>
                setForm((current) => ({ ...current, category }))
              }
              value={form.category}
            />
            <FormSelect
              label="Link type"
              onChange={(linkType) =>
                setForm((current) => ({ ...current, linkType }))
              }
              value={form.linkType}
            >
              {linkTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Safety label"
              onChange={(safetyLabel) =>
                setForm((current) => ({ ...current, safetyLabel }))
              }
              value={form.safetyLabel}
            >
              {safetyLabelOptions.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="Region"
              onChange={(region) =>
                setForm((current) => ({ ...current, region }))
              }
              value={form.region}
            />
            <FormInput
              label="Sort order"
              onChange={(sortOrder) =>
                setForm((current) => ({ ...current, sortOrder }))
              }
              value={form.sortOrder}
            />
            <FormInput
              className="md:col-span-2"
              label="Tags"
              onChange={(tags) => setForm((current) => ({ ...current, tags }))}
              placeholder="sources, review, sky-tool"
              value={form.tags}
            />
            <FormTextArea
              className="md:col-span-2"
              label="Public curator note"
              onChange={(notes) => setForm((current) => ({ ...current, notes }))}
              placeholder="Public note only. Do not store private review notes here."
              value={form.notes}
            />
            <label className="flex items-center gap-3 rounded-lg border border-night-800 bg-night-950 px-3 py-3 text-sm text-muted">
              <input
                checked={form.isActive}
                className="size-4 accent-signal-teal"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Active on public shelf
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-night-800 bg-night-950 px-3 py-3 text-sm text-muted">
              <input
                checked={form.isFeatured}
                className="size-4 accent-signal-violet"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isFeatured: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Featured on homepage
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-signal-teal/40 bg-signal-teal/10 px-4 py-2 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={Boolean(actionLoading)}
              onClick={() => void saveLink()}
            >
              {actionLoading === "save"
                ? "Saving..."
                : selected
                  ? "Save changes"
                  : "Create link"}
            </button>
            {selected ? (
              <>
                <button
                  className={secondaryButtonClass}
                  disabled={Boolean(actionLoading)}
                  onClick={() =>
                    void patchSelected({ isActive: !selected.isActive })
                  }
                >
                  {selected.isActive ? "Deactivate" : "Reactivate"}
                </button>
                <button
                  className={secondaryButtonClass}
                  disabled={Boolean(actionLoading)}
                  onClick={() =>
                    void patchSelected({ isFeatured: !selected.isFeatured })
                  }
                >
                  {selected.isFeatured ? "Unfeature" : "Feature"}
                </button>
              </>
            ) : null}
          </div>

          {selected ? (
            <div className="mt-5 grid gap-3 border-t border-night-800 pt-4 text-sm text-muted md:grid-cols-2">
              <Detail label="Created" value={formatDate(selected.createdAt)} />
              <Detail label="Updated" value={formatDate(selected.updatedAt)} />
              <Detail label="Published" value={formatDate(selected.publishedAt)} />
              <Detail label="ID" value={selected.id} />
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function FilterInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function FilterSelect({
  children,
  className = "",
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm font-semibold text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function FormInput({
  className = "",
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <input
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function FormSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <select
        className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm font-semibold text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

function FormTextArea({
  className = "",
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-28 w-full rounded-lg border border-night-800 bg-night-950 px-3 py-2 text-sm text-parchment outline-none transition focus:border-signal-teal"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <Pill tone={active ? "teal" : "muted"}>{active ? "active" : "inactive"}</Pill>
  );
}

function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "amber" | "muted" | "teal" | "violet";
}) {
  const className =
    tone === "teal"
      ? "border-signal-teal/35 bg-signal-teal/10 text-signal-teal"
      : tone === "violet"
        ? "border-signal-violet/35 bg-signal-violet/10 text-signal-violet"
        : tone === "amber"
          ? "border-signal-amber/35 bg-signal-amber/10 text-signal-amber"
          : "border-night-800 bg-night-950 text-muted";

  return (
    <span className={`rounded-full border px-2 py-1 text-xs ${className}`}>
      {children}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-night-800 bg-night-950 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 break-words text-parchment">{value}</p>
    </div>
  );
}

function useFacet(rows: AdminCuratedLink[], field: "category" | "region") {
  return useMemo(
    () =>
      Array.from(
        new Set(rows.map((row) => row[field]).filter((value) => value.length > 0)),
      ).sort((left, right) => left.localeCompare(right)),
    [field, rows],
  );
}

function linkToForm(link: AdminCuratedLink): FormState {
  return {
    category: link.category,
    description: link.description,
    isActive: link.isActive,
    isFeatured: link.isFeatured,
    linkType: link.linkType,
    notes: link.notes,
    region: link.region,
    safetyLabel: link.safetyLabel,
    sortOrder: String(link.sortOrder),
    sourceName: link.sourceName,
    tags: link.tags.join(", "),
    title: link.title,
    url: link.url,
  };
}

function formToPayload(form: FormState) {
  return {
    category: form.category,
    description: form.description,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    linkType: form.linkType,
    notes: form.notes,
    region: form.region,
    safetyLabel: form.safetyLabel,
    sortOrder: Number(form.sortOrder),
    sourceName: form.sourceName,
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    title: form.title,
    url: form.url,
  };
}

async function adminFetch<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Admin request failed.");
  }

  return body;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

const secondaryButtonClass =
  "rounded-lg border border-night-800 bg-night-950 px-4 py-2 text-sm font-bold text-parchment transition hover:border-signal-teal/50 disabled:cursor-not-allowed disabled:opacity-60";
