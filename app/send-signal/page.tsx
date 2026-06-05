import type { Metadata } from "next";
import Link from "next/link";
import { SendSignalForm } from "@/components/SendSignalForm";

export const metadata: Metadata = {
  title: "Send a Signal | OddSkies",
  description:
    "Send a public strange-report source link into the OddSkies review queue.",
};

export default function SendSignalPage() {
  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto max-w-6xl">
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
            <Link className="transition hover:text-signal-teal" href="/field-log">
              Field Log
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
          </nav>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
              Signal Drop
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Add a little spice to the skies.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              Saw something odd in a public post, article, old field note, or
              local story? Send the source link into the OddSkies review queue.
              We check the trail before anything reaches the map.
            </p>
            <p className="mt-4 inline-flex rounded-md border border-signal-amber/35 bg-signal-amber/10 px-3 py-2 text-sm font-semibold text-signal-amber">
              Reviewed before public. Reports remain unverified.
            </p>
          </div>

          <aside className="field-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-amber">
              Before you drop it
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted">
              <li>Public links are best.</li>
              <li>No private messages, private accounts, or exact addresses.</li>
              <li>No harassment, doxxing, or unsafe material.</li>
              <li>OddSkies may reject low-context or messy signals.</li>
            </ul>
          </aside>
        </section>

        <section className="grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <SendSignalForm />

          <div className="grid gap-4">
            <section className="field-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-teal">
                What happens next
              </p>
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-muted">
                <li>The signal lands in the internal raw source queue.</li>
                <li>A human checks the trail, privacy, category, and context.</li>
                <li>
                  Maybe it becomes a Field Log. Maybe it waits for better
                  breadcrumbs.
                </li>
              </ol>
            </section>

            <section className="field-card border-signal-violet/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-violet">
                Not a claim box
              </p>
              <p className="mt-4 text-sm leading-6 text-muted">
                Sending a signal does not mean OddSkies believes it, verifies
                it, publishes it, or tells the sky to behave. It just gives the
                review queue something to inspect.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
