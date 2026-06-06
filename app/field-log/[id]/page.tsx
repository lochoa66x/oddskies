import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FieldLogCaseFile } from "@/components/FieldLogBrowser";
import {
  findReportBySlugOrId,
  getFieldLogReports,
  getReportCasePath,
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
      title: "Case File Not Found | OddSkies",
    };
  }

  const description = getMetadataDescription(report);
  const url = getReportCasePath(report);

  return {
    alternates: {
      canonical: url,
    },
    description,
    openGraph: {
      description,
      siteName: "OddSkies",
      title: `${report.title} | OddSkies Field Log`,
      type: "article",
      url,
    },
    title: `${report.title} | OddSkies Field Log`,
  };
}

export default async function CaseFilePage({ params }: CaseFilePageProps) {
  const { id } = await params;
  const reports = getFieldLogReports(await getReports());
  const report = findReportBySlugOrId(reports, id);

  if (!report) {
    notFound();
  }

  const requested = decodeURIComponent(id).trim();
  const canonicalSlug = getReportSlug(report);

  if (requested === report.id && requested !== canonicalSlug) {
    redirect(getReportCasePath(report));
  }

  const relatedReports = getRelatedReports(reports, report);

  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto max-w-5xl">
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
            <Link className="transition hover:text-signal-teal" href="/field-log">
              Full Field Log
            </Link>
            <Link className="transition hover:text-signal-teal" href="/#map">
              Map
            </Link>
            <Link className="transition hover:text-signal-teal" href="/#oracle">
              Oracle
            </Link>
          </nav>
        </header>

        <section className="py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
            Shareable Case File
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            {report.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            Open Case File. A direct Field Log read for one public, unverified
            report.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-night-800 bg-night-900 px-4 py-2 text-sm font-semibold text-muted transition hover:border-signal-teal/40 hover:text-parchment"
              href="/field-log"
            >
              Back to Field Log
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
              href="/send-signal"
            >
              Send a Signal
            </Link>
          </div>
        </section>

        <FieldLogCaseFile report={report} />
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
            Related field notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-parchment">
            Nearby weirdness
          </h2>
        </div>
        <Link
          className="text-sm font-semibold text-muted transition hover:text-signal-teal"
          href="/field-log"
        >
          View Full Field Log
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {reports.map((report) => (
          <Link
            className="field-card block p-3 transition hover:border-signal-teal/40"
            href={getReportCasePath(report)}
            key={report.id}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`size-2.5 rounded-full ${report.marker}`} />
              <span className="font-semibold uppercase tracking-[0.14em] text-parchment">
                {report.category}
              </span>
              <span className="rounded border border-signal-amber/30 px-2 py-0.5 text-signal-amber">
                Unverified
              </span>
            </div>
            <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-parchment">
              {report.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-muted">
              {[report.location, report.region]
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
    return `Unverified OddSkies report in ${location}: ${summary}. Source-linked, not confirmed.`;
  }

  return `Unverified OddSkies Field Log report: ${summary}. Source-linked, not confirmed.`;
}

function getMetadataLocation(report: Report) {
  return [report.location, report.country, report.region]
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
