import type { Metadata } from "next";
import Link from "next/link";
import { getRegionCounts, regionDefinitions } from "@/lib/report-taxonomy";
import { getFieldLogReports, getReports } from "@/lib/reports";

export const metadata: Metadata = {
  alternates: {
    canonical: "/regions",
  },
  description:
    "Browse approved, unverified OddSkies reports by region. Source-linked where possible, never confirmed.",
  openGraph: {
    description:
      "Browse approved, unverified OddSkies reports by region. Source-linked where possible, never confirmed.",
    images: ["/images/oddskies-hero.png"],
    siteName: "OddSkies",
    title: "OddSkies Regions",
    type: "website",
    url: "/regions",
  },
  title: "OddSkies Regions",
  twitter: {
    card: "summary_large_image",
    description:
      "Browse approved, unverified OddSkies reports by region. Source-linked where possible, never confirmed.",
    images: ["/images/oddskies-hero.png"],
    title: "OddSkies Regions",
  },
};

export default async function RegionsPage() {
  const reports = getFieldLogReports(await getReports());
  const counts = getRegionCounts(reports);

  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto max-w-7xl">
        <BrowseHeader />

        <section className="grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
              Browse by Region
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              The map, filed into human-sized shelves.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              Regions help you scan the public Field Log by broad place. They
              do not confirm exact location, witnesses, causes, or sources.
            </p>
          </div>

          <aside className="field-card border-signal-amber/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-amber">
              Reading rule
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Regional pages are browsing aids only. Every report remains
              unverified, even when the source trail looks tidy.
            </p>
          </aside>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {regionDefinitions.map((region) => (
            <Link
              className="field-card group p-4 transition hover:border-signal-teal/45"
              href={`/regions/${region.slug}`}
              key={region.slug}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-signal-teal">
                    {region.shortLabel}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-parchment transition group-hover:text-signal-teal">
                    {region.label}
                  </h2>
                </div>
                <span className="rounded-md border border-night-800 bg-night-950/70 px-2.5 py-1 text-xs font-semibold text-muted">
                  {counts.get(region.slug) ?? 0}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {region.description}
              </p>
              <p className="mt-4 rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
                {region.trustLine}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function BrowseHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-night-800 pb-5 md:flex-row md:items-center md:justify-between">
      <Link className="flex items-center gap-3" href="/">
        <span className="grid size-11 place-items-center rounded-md border border-signal-teal/40 bg-signal-teal/10 text-sm font-black text-signal-teal">
          OS
        </span>
        <span>
          <span className="block text-sm font-semibold uppercase tracking-[0.34em] text-parchment">
            OddSkies
          </span>
          <span className="text-sm text-muted">oddskies.com</span>
        </span>
      </Link>
      <nav className="flex flex-wrap gap-3 text-sm text-muted">
        <Link className="transition hover:text-signal-teal" href="/field-log">
          Field Log
        </Link>
        <Link className="transition hover:text-signal-teal" href="/categories">
          Categories
        </Link>
        <Link className="transition hover:text-signal-teal" href="/send-signal">
          Send a Signal
        </Link>
        <Link
          className="transition hover:text-signal-teal"
          href="/source-guidelines"
        >
          Source Guidelines
        </Link>
      </nav>
    </header>
  );
}
