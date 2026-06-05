import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FieldLogCaseFile } from "@/components/FieldLogBrowser";
import { getFieldLogReports, getReports } from "@/lib/reports";

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

  return {
    description: `${report.summary} OddSkies keeps this case unverified and source-aware.`,
    title: `${report.title} | OddSkies Case File`,
  };
}

export default async function CaseFilePage({ params }: CaseFilePageProps) {
  const { id } = await params;
  const report = await getCaseFile(id);

  if (!report) {
    notFound();
  }

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
            Open Case File
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            A direct Field Log read for one public, unverified report.
          </p>
        </section>

        <FieldLogCaseFile report={report} />
      </div>
    </main>
  );
}

async function getCaseFile(id: string) {
  const reports = getFieldLogReports(await getReports());

  return reports.find((report) => report.id === decodeURIComponent(id));
}
