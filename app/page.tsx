import { Disclaimer } from "@/components/Disclaimer";
import { HeatMapPreview } from "@/components/HeatMapPreview";
import { Hero } from "@/components/Hero";
import { LatestReports } from "@/components/LatestReports";
import { OddSkiesOracle } from "@/components/OddSkiesOracle";
import { TrendsPreview } from "@/components/TrendsPreview";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-night-950 text-slate-100">
      <Hero />
      <HeatMapPreview />
      <LatestReports />
      <TrendsPreview />
      <OddSkiesOracle />
      <Disclaimer />
      <footer className="border-t border-white/10 bg-night-950 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-100">OddSkies</p>
            <p>oddskies.com</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <a className="transition hover:text-signal-cyan" href="#">
              Privacy
            </a>
            <a className="transition hover:text-signal-cyan" href="#">
              About
            </a>
            <span>Voynich Tech</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
