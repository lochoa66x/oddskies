import { CategoryStrip } from "@/components/CategoryStrip";
import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LatestReports } from "@/components/LatestReports";
import { OddSkiesOracle } from "@/components/OddSkiesOracle";
import { TonightsOddSkies } from "@/components/TonightsOddSkies";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-night-950 text-parchment">
      <Hero />
      <CategoryStrip />
      <TonightsOddSkies />
      <LatestReports />
      <OddSkiesOracle />
      <Disclaimer />
      <footer className="bg-night-950 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-night-800 pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-semibold text-parchment">OddSkies</p>
            <p className="mt-1 text-parchment">
              Strange reports, honestly mapped.
            </p>
            <p className="mt-2 leading-6">
              OddSkies organizes unverified public reports for curiosity and
              entertainment. We do not confirm sightings, paranormal claims, or
              source authenticity.
            </p>
            <p>oddskies.com</p>
            <p className="mt-2 text-xs text-slate-500">
              A Voynich Tech experiment
            </p>
          </div>
          <div className="flex flex-wrap gap-5">
            <a className="transition hover:text-signal-teal" href="#about">
              About
            </a>
            <a
              className="transition hover:text-signal-teal"
              href="#source-guidelines"
            >
              Source Guidelines
            </a>
            <a className="transition hover:text-signal-teal" href="#">
              Privacy
            </a>
            <a className="transition hover:text-signal-teal" href="#">
              Policy
            </a>
            <a className="transition hover:text-signal-teal" href="#oracle">
              Oracle
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
