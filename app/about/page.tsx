import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "About OddSkies | Content & Trust",
  description:
    "What OddSkies is, what it is not, and how unverified public report sources work.",
};

const navItems = [
  { href: "/", label: "Map" },
  { href: "/#reports", label: "Reports" },
  { href: "/#oracle", label: "Oracle" },
  { href: "/source-guidelines", label: "Sources" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-night-950 text-parchment">
      <header className="border-b border-night-800 bg-night-950 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid size-10 place-items-center rounded-md border border-signal-teal/40 bg-signal-teal/10 text-sm font-black text-signal-teal shadow-glow">
              OS
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-parchment">
                OddSkies
              </span>
              <span className="block text-xs text-muted">oddskies.com</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-md border border-night-800 bg-night-900/80 p-1 text-sm text-muted md:flex">
            {navItems.map((item) => (
              <Link
                className="rounded px-3 py-2 transition hover:bg-night-850 hover:text-parchment"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-night-800 bg-night-950 px-5 py-14 md:py-18">
        <div className="absolute inset-0 bg-star-field opacity-40" />
        <div className="paranormal-haze absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-amber">
              About / Source Policy
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-parchment md:text-6xl">
              The honest part of the strange map.
            </h1>
          </div>
          <div className="field-card rounded-lg p-5">
            <p className="text-lg font-semibold leading-7 text-parchment">
              OddSkies is for curiosity, patterns, and source trails. It is not
              a proof machine.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              We organize unverified public reports so people can explore the
              weird without being told what to believe.
            </p>
            <p className="mt-4 rounded-md border border-signal-teal/25 bg-signal-teal/10 px-3 py-2 text-sm font-semibold text-signal-teal">
              Verified? No. Interesting? Maybe. Source-linked? Always.
            </p>
            <Link
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-signal-teal/30 bg-signal-teal/10 px-3 py-2 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
              href="/source-guidelines"
            >
              Read our Source Guidelines
            </Link>
          </div>
        </div>
      </section>

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
          </div>
          <div className="flex flex-wrap gap-5">
            <Link className="transition hover:text-signal-teal" href="/">
              Home
            </Link>
            <Link
              className="transition hover:text-signal-teal"
              href="/source-guidelines"
            >
              Source Guidelines
            </Link>
            <a className="transition hover:text-signal-teal" href="#policy">
              Policy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
