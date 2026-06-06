import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicReportGrid } from "@/components/PublicReportGrid";
import {
  categoryDefinitions,
  getCategoryDefinition,
  getReportsForCategory,
  getTaxonomyPageDescription,
} from "@/lib/report-taxonomy";
import { getFieldLogReports, getReports } from "@/lib/reports";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categoryDefinitions.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryDefinition(slug);

  if (!category) {
    return {
      title: "Category Not Found | OddSkies",
    };
  }

  const reports = getReportsForCategory(
    getFieldLogReports(await getReports()),
    category,
  );
  const description =
    reports.length > 0
      ? getTaxonomyPageDescription("category", category.label, reports.length)
      : `Latest unverified OddSkies field notes filed under ${category.label}. Source-linked where possible, never confirmed.`;
  const title = `${category.label} Reports | OddSkies`;
  const url = `/categories/${category.slug}`;

  return {
    alternates: {
      canonical: url,
    },
    description,
    openGraph: {
      description,
      images: ["/images/oddskies-hero.png"],
      siteName: "OddSkies",
      title,
      type: "website",
      url,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: ["/images/oddskies-hero.png"],
      title,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryDefinition(slug);

  if (!category) {
    notFound();
  }

  const reports = getReportsForCategory(
    getFieldLogReports(await getReports()),
    category,
  );
  const relatedCategories = categoryDefinitions.filter(
    (item) => item.slug !== category.slug,
  );

  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto max-w-7xl">
        <BrowseHeader />

        <section className="grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
              Category File
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              {category.label} reports
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              {category.description}
            </p>
          </div>

          <aside className="field-card border-signal-amber/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-amber">
              {reports.length} latest field notes
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              {category.trustLine}
            </p>
          </aside>
        </section>

        <div className="mb-5 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            href="/field-log"
          >
            Open Full Field Log
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-night-800 bg-night-900 px-4 py-2 text-sm font-semibold text-muted transition hover:border-signal-teal/40 hover:text-parchment"
            href="/send-signal"
          >
            Send a Signal
          </Link>
        </div>

        <PublicReportGrid reports={reports} />

        <section className="mt-8 border-t border-night-800 pt-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-signal-violet">
            Related shelves
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedCategories.slice(0, 6).map((item) => (
              <Link
                className="rounded-md border border-night-800 bg-night-900 px-3 py-2 text-sm font-semibold text-muted transition hover:border-signal-violet/50 hover:text-parchment"
                href={`/categories/${item.slug}`}
                key={item.slug}
              >
                {item.label}
              </Link>
            ))}
          </div>
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
        <Link className="transition hover:text-signal-teal" href="/categories">
          Categories
        </Link>
        <Link className="transition hover:text-signal-teal" href="/regions">
          Regions
        </Link>
        <Link className="transition hover:text-signal-teal" href="/field-log">
          Field Log
        </Link>
        <Link className="transition hover:text-signal-teal" href="/send-signal">
          Send a Signal
        </Link>
      </nav>
    </header>
  );
}
