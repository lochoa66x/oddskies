import Link from "next/link";
import {
  type CuratedLink,
  getFeaturedCuratedLinks,
  isExternalCuratedLink,
} from "@/lib/curated-links";

type SignalShelfPreviewProps = {
  links: CuratedLink[];
};

export function SignalShelfPreview({ links }: SignalShelfPreviewProps) {
  const previewLinks = getFeaturedCuratedLinks(links, 3);

  return (
    <section className="bg-night-950 px-5 py-6 md:py-8" id="signal-shelf">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3.5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Signal Shelf
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-parchment md:text-4xl">
              Useful trails, not verdicts.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              A small shelf of OddSkies links and future public resources that
              help with source context. Not reports, not proof, not a scoreboard.
            </p>
          </div>
          <Link
            className="source-link inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-bold"
            href="/signal-shelf"
          >
            Open Signal Shelf
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {previewLinks.map((link) => (
            <article className="field-card rounded-lg p-4" key={link.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {formatLabel(link.linkType)}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-parchment">
                    {link.title}
                  </h3>
                </div>
                <span className="rounded-md border border-signal-amber/40 bg-signal-amber/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-signal-amber">
                  {formatLabel(link.safetyLabel)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {link.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span>{link.sourceName}</span>
                <span>/</span>
                <span>{link.category}</span>
                <span>/</span>
                <span>{link.region}</span>
              </div>
              <div className="mt-4">
                {isExternalCuratedLink(link.url) ? (
                  <a
                    className="text-sm font-bold text-signal-teal transition hover:text-parchment"
                    href={link.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open source
                  </a>
                ) : (
                  <Link
                    className="text-sm font-bold text-signal-teal transition hover:text-parchment"
                    href={link.url}
                  >
                    Open page
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-3 rounded-lg border border-night-800 bg-night-900/70 p-3 text-xs leading-5 text-muted">
          Signal Shelf is curated navigation. Public reports still belong in
          the Field Log, and raw sources still wait behind the review door.
        </p>
      </div>
    </section>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
