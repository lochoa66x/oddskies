import Link from "next/link";

export default function FieldLogCaseNotFound() {
  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
          Case file missing
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          This signal drifted out of range.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          The public Field Log could not find that report. It may have been
          renamed, archived, or pulled back for review.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            href="/field-log"
          >
            View Full Field Log
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-night-800 bg-night-900 px-4 py-2 text-sm font-semibold text-muted transition hover:border-signal-teal/40 hover:text-parchment"
            href="/"
          >
            Back to the Map
          </Link>
        </div>
      </div>
    </main>
  );
}
