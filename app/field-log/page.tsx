import type { Metadata } from "next";
import Link from "next/link";
import {
  FieldLogBrowser,
  type FieldLogInitialFilters,
} from "@/components/FieldLogBrowser";
import { getFieldLogReports, getReports } from "@/lib/reports";

export const metadata: Metadata = {
  alternates: {
    canonical: "/field-log",
  },
  description:
    "Browse the OddSkies Field Log: unverified UFO / UAP, strange light, haunted place, paranormal, local legend, and weird public reports organized by source, place, and time.",
  openGraph: {
    description:
      "Browse the OddSkies Field Log: unverified UFO / UAP, strange light, haunted place, paranormal, local legend, and weird public reports organized by source, place, and time.",
    images: [
      {
        alt: "A strange twilight sky above a distant horizon.",
        height: 916,
        url: "/images/oddskies-hero.png",
        width: 1718,
      },
    ],
    siteName: "OddSkies",
    title: "OddSkies Field Log -- Unverified UFO, Paranormal & Strange Reports",
    type: "website",
    url: "/field-log",
  },
  title: "OddSkies Field Log -- Unverified UFO, Paranormal & Strange Reports",
  twitter: {
    card: "summary_large_image",
    description:
      "Browse the OddSkies Field Log: unverified UFO / UAP, strange light, haunted place, paranormal, local legend, and weird public reports organized by source, place, and time.",
    images: ["/images/oddskies-hero.png"],
    title: "OddSkies Field Log -- Unverified UFO, Paranormal & Strange Reports",
  },
};

type FieldLogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FieldLogPage({ searchParams }: FieldLogPageProps) {
  const params = (await searchParams) ?? {};
  const reports = getFieldLogReports(await getReports());
  const initialFilters: FieldLogInitialFilters = {
    category: readSearchParam(params.category),
    date: readSearchParam(params.date),
    from: readSearchParam(params.from),
    query: readSearchParam(params.query),
    region: readSearchParam(params.region),
    locationConfidence: readSearchParam(params.locationConfidence),
    sourceQuality: readSearchParam(params.sourceQuality),
    sourceType: readSearchParam(params.sourceType),
    sort: readSearchParam(params.sort),
    to: readSearchParam(params.to),
  };

  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto max-w-7xl">
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
            <Link className="transition hover:text-signal-teal" href="/#map">
              Map
            </Link>
            <Link className="transition hover:text-signal-teal" href="/#reports">
              Homepage Preview
            </Link>
            <Link className="transition hover:text-signal-teal" href="/categories">
              Categories
            </Link>
            <Link className="transition hover:text-signal-teal" href="/regions">
              Regions
            </Link>
            <Link className="transition hover:text-signal-teal" href="/#oracle">
              Oracle
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

        <section className="grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
              Full Field Log
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Browse the living record of weird.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              Public, unverified field notes grouped into monthly sweeps.
              Search by title, source, location, region, category, quality, and
              date without cluttering the front map.
            </p>
          </div>

          <aside className="field-card border-signal-amber/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-amber">
              Reading rules
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Every case file stays unverified. Source links are kept visible
              when available, and the Oracle can only offer a playful reality
              check.
            </p>
            <p className="mt-3 rounded-md border border-night-800 bg-night-950/60 px-3 py-2 text-xs leading-5 text-muted">
              Monthly Sweeps keep older weirdness organized without turning the
              homepage into a filing cabinet.
            </p>
          </aside>
        </section>

        <FieldLogBrowser initialFilters={initialFilters} reports={reports} />
      </div>
    </main>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
