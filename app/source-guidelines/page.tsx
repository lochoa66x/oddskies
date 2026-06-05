import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Source Guidelines | OddSkies",
  description:
    "How OddSkies handles strange public reports without pretending they are confirmed.",
};

const navItems = [
  { href: "/", label: "Map" },
  { href: "/field-log", label: "Field Log" },
  { href: "/#oracle", label: "Oracle" },
  { href: "/about", label: "About" },
];

const guidelineCards = [
  {
    eyebrow: "Default state",
    title: "Unverified by default",
    copy:
      "OddSkies organizes strange public reports. We do not confirm whether reports are real, mistaken, AI-generated, edited, staged, satire, folklore, or jokes.",
    note: "Counts are real. Conclusions are not.",
  },
  {
    eyebrow: "Source boundary",
    title: "Public sources only",
    copy:
      "OddSkies should only use public source material or user-submitted material shared with permission. Private messages, private accounts, leaked material, personal addresses, and sensitive personal information do not belong here.",
  },
  {
    eyebrow: "Context trail",
    title: "Source links matter",
    copy:
      "Whenever possible, each report should point back to the original public source so visitors can review context, timing, comments, edits, and source history themselves.",
    note: "Source-linked? Always, whenever the source trail exists.",
  },
  {
    eyebrow: "No magic stamp",
    title: "No automatic truth",
    copy:
      "Future collectors or AI tools may help classify, summarize, and organize reports. They should not verify claims or declare something alien, paranormal, supernatural, staged, or real.",
  },
  {
    eyebrow: "Privacy",
    title: "Location privacy",
    copy:
      "OddSkies should avoid publishing exact private addresses or personal locations. City or region-level locations are preferred unless the place is a public landmark or already public context.",
  },
  {
    eyebrow: "Promise",
    title: "The OddSkies promise",
    copy:
      "OddSkies is here for curiosity, patterns, folklore, and weird little signals - not fear, harassment, or fake certainty.",
    note: "Verified? No. Interesting? Maybe. Source-linked? Always.",
  },
];

const filteredItems = [
  "duplicates",
  "obvious jokes",
  "low-context posts",
  "private information",
  "harassment",
  "harmful claims",
  "spam",
  "misleading reposts",
  "suspected AI-generated or edited media",
];

export default function SourceGuidelinesPage() {
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
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Source Guidelines
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-parchment md:text-6xl">
              How OddSkies handles strange reports.
            </h1>
          </div>
          <div className="field-card rounded-lg p-5">
            <p className="text-lg font-semibold leading-7 text-parchment">
              Strange reports are interesting. That does not make them
              confirmed.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              This page explains how OddSkies keeps source trails, privacy, and
              review boundaries intact before weird little signals reach the
              public map.
            </p>
            <p className="mt-4 rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-sm font-semibold text-signal-amber">
              How OddSkies handles strange reports without pretending they are
              confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-night-800 bg-night-900 px-5 py-10 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guidelineCards.map((card) => (
            <article
              className="field-card relative overflow-hidden rounded-lg p-5"
              key={card.title}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-teal/45 to-transparent" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {card.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-parchment">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{card.copy}</p>
              {card.note ? (
                <p className="mt-4 rounded-md border border-signal-teal/25 bg-signal-teal/10 px-3 py-2 text-sm font-semibold text-signal-teal">
                  {card.note}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="bg-night-950 px-5 py-10 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-amber">
              What may be filtered
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-parchment md:text-4xl">
              Some weird stays backstage.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              OddSkies can be curious without becoming careless. Future review
              tools may label, filter, or reject material that makes the map
              less honest or less safe.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <span
                className="rounded-md border border-night-800 bg-night-900 px-3 py-2 text-sm font-semibold text-muted"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-night-800 bg-night-900 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-lg border border-signal-violet/25 bg-signal-violet/[0.08] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-violet">
              Staging rule
            </p>
            <p className="mt-2 max-w-3xl text-lg font-semibold leading-7 text-parchment">
              Raw internet posts should never go straight onto the public map.
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Future collectors should save material into internal staging
              first. Only reviewed and approved items should become public
              reports.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-2 text-sm font-bold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            href="/about"
          >
            About OddSkies
          </Link>
        </div>
      </section>

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
            <Link className="transition hover:text-signal-teal" href="/about">
              About
            </Link>
            <Link
              className="transition hover:text-signal-teal"
              href="/source-guidelines"
            >
              Source Guidelines
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
