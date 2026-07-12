import type { Metadata } from "next";
import Link from "next/link";
import {
  FieldLogBrowser,
  type FieldLogInitialFilters,
} from "@/components/FieldLogBrowser";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { pathWithSearchParams } from "@/lib/i18n";
import { getFieldLogReports, getReports } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  alternates: {
    canonical: "/es/field-log",
    languages: {
      en: "/field-log",
      es: "/es/field-log",
    },
  },
  description:
    "Explora el Registro de Campo de OddSkies: reportes sin verificar de OVNI / FANI, luces extrañas, lugares embrujados, paranormal, leyendas locales y rarezas organizados por fuente, lugar y fecha.",
  openGraph: {
    description:
      "Explora el Registro de Campo de OddSkies: reportes sin verificar de OVNI / FANI, luces extrañas, lugares embrujados, paranormal, leyendas locales y rarezas organizados por fuente, lugar y fecha.",
    images: [
      {
        alt: "Un cielo extraño al atardecer sobre un horizonte lejano.",
        height: 916,
        url: "/images/oddskies-hero.png",
        width: 1718,
      },
    ],
    siteName: "OddSkies",
    title: "Registro de Campo OddSkies -- OVNI, paranormal y rarezas",
    type: "website",
    url: "/es/field-log",
  },
  title: "Registro de Campo OddSkies -- OVNI, paranormal y rarezas",
  twitter: {
    card: "summary_large_image",
    description:
      "Explora el Registro de Campo de OddSkies: reportes sin verificar de OVNI / FANI, luces extrañas, lugares embrujados, paranormal, leyendas locales y rarezas organizados por fuente, lugar y fecha.",
    images: ["/images/oddskies-hero.png"],
    title: "Registro de Campo OddSkies -- OVNI, paranormal y rarezas",
  },
};

type FieldLogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SpanishFieldLogPage({
  searchParams,
}: FieldLogPageProps) {
  const params = (await searchParams) ?? {};
  const reports = getFieldLogReports(await getReports());
  const initialFilters: FieldLogInitialFilters = {
    category: readSearchParam(params.category),
    date: readSearchParam(params.date),
    from: readSearchParam(params.from),
    locationConfidence: readSearchParam(params.locationConfidence),
    query: readSearchParam(params.query),
    region: readSearchParam(params.region),
    sort: readSearchParam(params.sort),
    sourceQuality: readSearchParam(params.sourceQuality),
    sourceType: readSearchParam(params.sourceType),
    to: readSearchParam(params.to),
  };
  const enHref = pathWithSearchParams("/field-log", params);
  const esHref = pathWithSearchParams("/es/field-log", params);

  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-night-800 pb-5 md:flex-row md:items-center md:justify-between">
          <Link className="flex items-center gap-3" href="/es">
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
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <nav className="flex flex-wrap gap-3 text-sm text-muted">
              <Link className="transition hover:text-signal-teal" href="/es#map">
                Mapa
              </Link>
              <Link
                className="transition hover:text-signal-teal"
                href="/es#reports"
              >
                Vista de portada
              </Link>
              <Link className="transition hover:text-signal-teal" href="/categories">
                Categorías
              </Link>
              <Link className="transition hover:text-signal-teal" href="/regions">
                Regiones
              </Link>
              <Link className="transition hover:text-signal-teal" href="/es#oracle">
                Oráculo
              </Link>
              <Link
                className="transition hover:text-signal-teal"
                href="/send-signal"
              >
                Enviar una señal
              </Link>
              <Link
                className="transition hover:text-signal-teal"
                href="/source-guidelines"
              >
                Guía de fuentes
              </Link>
            </nav>
            <LanguageSwitcher enHref={enHref} esHref={esHref} locale="es" />
          </div>
        </header>

        <section className="grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
              Registro de Campo completo
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Explora el registro vivo de lo raro.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              Notas públicas y sin verificar, agrupadas por cuándo entraron a
              OddSkies. Busca por título, fuente, ubicación, región, categoría,
              calidad y fecha de archivo sin saturar el mapa principal.
            </p>
          </div>

          <aside className="field-card border-signal-amber/25 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-signal-amber">
              Reglas de lectura
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Cada expediente sigue sin verificarse. Los enlaces de fuente se
              mantienen visibles cuando existen, y el Oráculo solo ofrece un
              chequeo juguetón de realidad.
            </p>
            <p className="mt-3 rounded-md border border-night-800 bg-night-950/60 px-3 py-2 text-xs leading-5 text-muted">
              Los barridos mensuales mantienen vivo el Registro: los archivos
              nuevos de julio siguen visibles aunque lo raro haya ocurrido
              antes.
            </p>
          </aside>
        </section>

        <FieldLogBrowser
          initialFilters={initialFilters}
          locale="es"
          reports={reports}
        />
      </div>
    </main>
  );
}

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
