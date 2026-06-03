import { CategoryStrip } from "@/components/CategoryStrip";
import { Hero } from "@/components/Hero";
import { LatestReports } from "@/components/LatestReports";
import { OddSkiesOracle } from "@/components/OddSkiesOracle";
import { SignalsWeirdness } from "@/components/SignalsWeirdness";
import { WeirdShelf } from "@/components/WeirdShelf";
import { getReports } from "@/lib/reports";

export default async function Home() {
  const reports = await getReports();

  return (
    <main className="min-h-screen overflow-hidden bg-night-950 text-parchment">
      <Hero reports={reports} />
      <CategoryStrip />
      <LatestReports reports={reports} />
      <OddSkiesOracle />
      <SignalsWeirdness reports={reports} />
      <WeirdShelf />
      <footer className="site-footer px-5 py-6">
        <div className="mx-auto max-w-7xl border-t border-night-800 pt-5 text-sm text-muted">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-semibold text-parchment">OddSkies</p>
              <p className="mt-1 text-parchment">
                Strange reports, honestly mapped.
              </p>
              <p className="mt-2 leading-6">
                OddSkies organizes unverified public reports for curiosity and
                entertainment. We do not confirm sightings, paranormal claims,
                or source authenticity.
              </p>
              <p>oddskies.com</p>
              <p className="mt-2 text-xs text-slate-500">
                A Voynich Tech experiment
              </p>
            </div>
            <div className="flex flex-wrap gap-5">
              <a className="transition hover:text-signal-teal" href="/about">
                About
              </a>
              <a
                className="transition hover:text-signal-teal"
                href="/source-guidelines"
              >
                Source Guidelines
              </a>
              <a className="transition hover:text-signal-teal" href="#">
                Privacy
              </a>
              <a
                className="transition hover:text-signal-teal"
                href="/about#policy"
              >
                Policy
              </a>
              <a className="transition hover:text-signal-teal" href="#oracle">
                Oracle
              </a>
            </div>
          </div>
          <p className="site-footer-finish mt-5 pt-4">
            End of current field file · Reports remain unverified
          </p>
        </div>
      </footer>
    </main>
  );
}
