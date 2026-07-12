import Link from "next/link";
import {
  type CuratedLink,
  getFeaturedCuratedLinks,
  isExternalCuratedLink,
} from "@/lib/curated-links";
import {
  categoryLabel,
  localizedPath,
  regionLabel,
  uiLabel,
  type Locale,
} from "@/lib/i18n";

type SignalShelfPreviewProps = {
  locale?: Locale;
  links: CuratedLink[];
};

export function SignalShelfPreview({
  locale = "en",
  links,
}: SignalShelfPreviewProps) {
  const copy = getSignalShelfCopy(locale);
  const previewLinks = getFeaturedCuratedLinks(links, 3);

  return (
    <section className="bg-night-950 px-5 py-6 md:py-8" id="signal-shelf">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3.5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              {copy.kicker}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-parchment md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {copy.description}
            </p>
          </div>
          <Link
            className="source-link inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-bold"
            href={localizedPath(locale, "/signal-shelf")}
          >
            {copy.openShelf}
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {previewLinks.map((link) => (
            <article className="field-card rounded-lg p-4" key={link.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {formatLabel(link.linkType, locale)}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-parchment">
                    {link.title}
                  </h3>
                </div>
                <span className="rounded-md border border-signal-amber/40 bg-signal-amber/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-signal-amber">
                  {formatLabel(link.safetyLabel, locale)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {link.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span>{link.sourceName}</span>
                <span>/</span>
                <span>{categoryLabel(link.category, locale)}</span>
                <span>/</span>
                <span>{regionLabel(link.region, locale)}</span>
              </div>
              <div className="mt-4">
                {isExternalCuratedLink(link.url) ? (
                  <a
                    className="text-sm font-bold text-signal-teal transition hover:text-parchment"
                    href={link.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {copy.openSource}
                  </a>
                ) : (
                  <Link
                    className="text-sm font-bold text-signal-teal transition hover:text-parchment"
                    href={localizedPath(locale, link.url)}
                  >
                    {copy.openPage}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-3 rounded-lg border border-night-800 bg-night-900/70 p-3 text-xs leading-5 text-muted">
          {copy.footerNote}
        </p>
      </div>
    </section>
  );
}

function formatLabel(value: string, locale: Locale) {
  const label = value.replaceAll("_", " ");

  return uiLabel(label, locale);
}

function getSignalShelfCopy(locale: Locale) {
  if (locale === "es") {
    return {
      description:
        "Un pequeño estante de enlaces de OddSkies y recursos públicos futuros que ayudan con el contexto de fuentes. No son reportes, no son prueba, no son marcador.",
      footerNote:
        "El Estante de señales es navegación curada. Los reportes públicos siguen perteneciendo al Registro de Campo, y las fuentes crudas siguen esperando detrás de la puerta de revisión.",
      kicker: "Estante de señales",
      openPage: "Abrir página",
      openShelf: "Abrir Estante de señales",
      openSource: "Abrir fuente",
      title: "Rutas útiles, no veredictos.",
    };
  }

  return {
    description:
      "A small shelf of OddSkies links and future public resources that help with source context. Not reports, not proof, not a scoreboard.",
    footerNote:
      "Signal Shelf is curated navigation. Public reports still belong in the Field Log, and raw sources still wait behind the review door.",
    kicker: "Signal Shelf",
    openPage: "Open page",
    openShelf: "Open Signal Shelf",
    openSource: "Open source",
    title: "Useful trails, not verdicts.",
  };
}
