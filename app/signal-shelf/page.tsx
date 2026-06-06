import type { Metadata } from "next";
import Link from "next/link";
import { SignalShelfBrowser } from "@/components/SignalShelfBrowser";
import { getCuratedLinks } from "@/lib/curated-links";

const pageTitle = "Signal Shelf | OddSkies";
const pageDescription =
  "Curated OddSkies links and public source-context resources. Useful trails for strange reports, not proof or verification.";

export const metadata: Metadata = {
  alternates: {
    canonical: "/signal-shelf",
  },
  description: pageDescription,
  openGraph: {
    description: pageDescription,
    images: [
      {
        alt: "A strange twilight sky above a distant horizon.",
        height: 916,
        url: "/images/oddskies-hero.png",
        width: 1718,
      },
    ],
    siteName: "OddSkies",
    title: pageTitle,
    type: "website",
    url: "/signal-shelf",
  },
  title: pageTitle,
  twitter: {
    card: "summary_large_image",
    description: pageDescription,
    images: ["/images/oddskies-hero.png"],
    title: pageTitle,
  },
};

export default async function SignalShelfPage() {
  const links = await getCuratedLinks();

  return (
    <main className="min-h-screen bg-night-950 text-parchment">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            description: pageDescription,
            name: "OddSkies Signal Shelf",
            url: "https://oddskies.com/signal-shelf",
          }),
        }}
        type="application/ld+json"
      />
      <section className="px-5 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-8 flex flex-wrap gap-3 text-sm font-semibold text-muted">
            <Link className="transition hover:text-signal-teal" href="/">
              OddSkies
            </Link>
            <span>/</span>
            <Link
              className="transition hover:text-signal-teal"
              href="/field-log"
            >
              Field Log
            </Link>
            <span>/</span>
            <span className="text-parchment">Signal Shelf</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-signal-teal">
                Signal Shelf
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-parchment md:text-6xl">
                Curated trails for keeping the weird organized.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
                Signal Shelf holds useful OddSkies pages and curated public
                resources when they are worth keeping nearby. It is separate
                from the Field Log, separate from raw sources, and very much
                not a truth machine.
              </p>
            </div>

            <aside className="rounded-lg border border-signal-amber/35 bg-signal-amber/10 p-4 text-sm leading-6 text-signal-amber">
              <p className="font-bold">Curated does not mean confirmed.</p>
              <p className="mt-2">
                Links here are browsing aids. Public reports remain unverified,
                and raw source staging stays private until review.
              </p>
            </aside>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-night-800 bg-night-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Shelf rule
              </p>
              <p className="mt-2 font-semibold text-parchment">
                Helpful context, not evidence.
              </p>
            </div>
            <div className="rounded-lg border border-night-800 bg-night-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Public flow
              </p>
              <p className="mt-2 font-semibold text-parchment">
                Reports still live in Field Log.
              </p>
            </div>
            <div className="rounded-lg border border-night-800 bg-night-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Review line
              </p>
              <p className="mt-2 font-semibold text-parchment">
                Raw sources stay backstage.
              </p>
            </div>
          </div>

          <SignalShelfBrowser links={links} />
        </div>
      </section>
    </main>
  );
}
