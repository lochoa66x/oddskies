import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FieldLogCaseFile } from "@/components/FieldLogBrowser";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  categoryLabel,
  localizedReportCasePath,
  regionLabel,
  uiLabel,
} from "@/lib/i18n";
import {
  findReportBySlugOrId,
  getFieldLogReports,
  getReportSlug,
  getReports,
  type Report,
} from "@/lib/reports";

type CaseFilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CaseFilePageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getCaseFile(id);

  if (!report) {
    return {
      title: "Expediente no encontrado | OddSkies",
    };
  }

  const description = getMetadataDescription(report);
  const url = localizedReportCasePath(report, "es");

  return {
    alternates: {
      canonical: url,
      languages: {
        en: localizedReportCasePath(report, "en"),
        es: url,
      },
    },
    description,
    openGraph: {
      description,
      images: [
        {
          alt: "Un cielo extraño al atardecer sobre un horizonte lejano.",
          height: 916,
          url: "/images/oddskies-hero.png",
          width: 1718,
        },
      ],
      siteName: "OddSkies",
      title: `${report.title} | Registro de Campo OddSkies`,
      type: "article",
      url,
    },
    title: `${report.title} | Registro de Campo OddSkies`,
    twitter: {
      card: "summary_large_image",
      description,
      images: ["/images/oddskies-hero.png"],
      title: `${report.title} | Registro de Campo OddSkies`,
    },
  };
}

export default async function SpanishCaseFilePage({
  params,
}: CaseFilePageProps) {
  const { id } = await params;
  const reports = getFieldLogReports(await getReports());
  const report = findReportBySlugOrId(reports, id);

  if (!report) {
    notFound();
  }

  const requested = decodeURIComponent(id).trim();
  const canonicalSlug = getReportSlug(report);

  if (requested === report.id && requested !== canonicalSlug) {
    redirect(localizedReportCasePath(report, "es"));
  }

  const enHref = localizedReportCasePath(report, "en");
  const esHref = localizedReportCasePath(report, "es");
  const relatedReports = getRelatedReports(reports, report);

  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getReportJsonLd(report)),
        }}
        type="application/ld+json"
      />
      <div className="mx-auto max-w-5xl">
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
              <Link
                className="transition hover:text-signal-teal"
                href="/es/field-log"
              >
                Registro completo
              </Link>
              <Link className="transition hover:text-signal-teal" href="/es#map">
                Mapa
              </Link>
              <Link className="transition hover:text-signal-teal" href="/es#oracle">
                Oráculo
              </Link>
            </nav>
            <LanguageSwitcher enHref={enHref} esHref={esHref} locale="es" />
          </div>
        </header>

        <section className="py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
            Expediente compartible
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            {report.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            Expediente abierto. Una lectura directa del Registro de Campo para
            un reporte público y sin verificar.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-night-800 bg-night-900 px-4 py-2 text-sm font-semibold text-muted transition hover:border-signal-teal/40 hover:text-parchment"
              href="/es/field-log"
            >
              Volver al Registro
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
              href="/send-signal"
            >
              Enviar una señal
            </Link>
          </div>
        </section>

        <FieldLogCaseFile locale="es" report={report} />
        <RelatedFieldNotes reports={relatedReports} />
      </div>
    </main>
  );
}

async function getCaseFile(id: string) {
  const reports = getFieldLogReports(await getReports());

  return findReportBySlugOrId(reports, id);
}

function RelatedFieldNotes({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 border-t border-night-800 pt-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-signal-teal">
            Notas relacionadas
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-parchment">
            Rarezas cercanas
          </h2>
        </div>
        <Link
          className="text-sm font-semibold text-muted transition hover:text-signal-teal"
          href="/es/field-log"
        >
          Ver Registro completo
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {reports.map((report) => (
          <Link
            className="field-card block p-3 transition hover:border-signal-teal/40"
            href={localizedReportCasePath(report, "es")}
            key={report.id}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`size-2.5 rounded-full ${report.marker}`} />
              <span className="font-semibold uppercase tracking-[0.14em] text-parchment">
                {categoryLabel(report.category, "es")}
              </span>
              <span className="rounded border border-signal-amber/30 px-2 py-0.5 text-signal-amber">
                {uiLabel("Unverified", "es")}
              </span>
            </div>
            <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-parchment">
              {report.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              {[report.location, regionLabel(report.region, "es")]
                .filter((value) => value && value !== "Unknown")
                .join(" · ")}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
              {report.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function getRelatedReports(reports: Report[], report: Report) {
  return reports
    .filter((candidate) => candidate.id !== report.id)
    .map((candidate) => ({
      report: candidate,
      score: getRelatedScore(candidate, report),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ report: related }) => related);
}

function getRelatedScore(candidate: Report, report: Report) {
  let score = 0;

  if (candidate.category === report.category) {
    score += 4;
  }

  if (candidate.region === report.region) {
    score += 3;
  }

  if (candidate.country && candidate.country === report.country) {
    score += 2;
  }

  if (candidate.confidenceMood === report.confidenceMood) {
    score += 2;
  }

  if (candidate.sourceQualityLabel === report.sourceQualityLabel) {
    score += 1;
  }

  return score;
}

function getMetadataDescription(report: Report) {
  const location = getMetadataLocation(report);
  const summary = truncateDescription(report.summary);

  if (location) {
    return `Reporte sin verificar de OddSkies en ${location}: ${summary}. Con fuente cuando existe. No confirmado.`;
  }

  return `Reporte sin verificar de OddSkies: ${summary}. Con fuente cuando existe. No confirmado.`;
}

function getMetadataLocation(report: Report) {
  return [report.location, report.country, regionLabel(report.region, "es")]
    .filter((value) => value && value !== "Unknown")
    .join(", ");
}

function truncateDescription(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= 145) {
    return cleaned;
  }

  return `${cleaned.slice(0, 142).trim()}...`;
}

function getReportJsonLd(report: Report) {
  const url = `https://oddskies.com${localizedReportCasePath(report, "es")}`;
  const datePublished =
    getJsonDate(report.eventDateTimeRaw) ?? getJsonDate(report.createdAtRaw);
  const dateModified = getJsonDate(report.createdAtRaw) ?? datePublished;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    author: {
      "@type": "Organization",
      name: "OddSkies",
      url: "https://oddskies.com",
    },
    dateModified,
    datePublished,
    description: getMetadataDescription(report),
    headline: report.title,
    image: "https://oddskies.com/images/oddskies-hero.png",
    mainEntityOfPage: url,
    publisher: {
      "@type": "Organization",
      name: "OddSkies",
      url: "https://oddskies.com",
    },
  };
}

function getJsonDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}
