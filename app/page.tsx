import Link from "next/link";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FieldDispatch } from "@/components/FieldDispatch";
import { Hero } from "@/components/Hero";
import { LatestReports } from "@/components/LatestReports";
import { OddSkiesOracle } from "@/components/OddSkiesOracle";
import { SignalsWeirdness } from "@/components/SignalsWeirdness";
import { WeirdShelf } from "@/components/WeirdShelf";
import {
  getFieldLogReports,
  getHomepageDisplayReports,
  getHomepageFieldLogReports,
  getReports,
} from "@/lib/reports";

export default async function Home() {
  const reports = await getReports();
  const displayReports = getHomepageDisplayReports(reports);
  const fieldLogReports = getFieldLogReports(reports);
  const latestFieldLogReports = getHomepageFieldLogReports(reports);

  return (
    <main className="min-h-screen overflow-hidden bg-night-950 text-parchment">
      <Hero reports={displayReports} />
      <CategoryStrip />
      <LatestReports
        reports={latestFieldLogReports}
        totalCount={fieldLogReports.length}
      />
      <OddSkiesOracle />
      <SignalsWeirdness reports={fieldLogReports} />
      <WeirdShelf />
      <FieldDispatch />
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
              <Link
                className="transition hover:text-signal-teal"
                href="/field-log"
              >
                Field Log
              </Link>
              <Link className="transition hover:text-signal-teal" href="/about">
                About
              </Link>
              <Link
                className="transition hover:text-signal-teal"
                href="/send-signal"
              >
                Send a Signal
              </Link>
              <Link
                className="transition hover:text-signal-teal"
                href="/source-guidelines"
              >
                Source Guidelines
              </Link>
              <a className="transition hover:text-signal-teal" href="#">
                Privacy
              </a>
              <Link
                className="transition hover:text-signal-teal"
                href="/about#policy"
              >
                Policy
              </Link>
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
