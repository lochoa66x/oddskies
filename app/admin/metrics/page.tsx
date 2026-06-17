import Link from "next/link";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminMetricsDashboard } from "@/components/admin/AdminMetricsDashboard";
import {
  getAdminTokenMissingMessage,
  hasAdminSession,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { getAdminMetrics } from "@/lib/admin-metrics";

export const dynamic = "force-dynamic";

export default async function AdminMetricsPage() {
  const configured = isAdminConfigured();
  const authorized = configured ? await hasAdminSession() : false;
  const metrics = authorized ? await getAdminMetrics() : null;

  return (
    <main className="min-h-screen bg-night-950 px-4 py-6 text-parchment sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-night-800 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              className="text-xs font-semibold uppercase tracking-[0.32em] text-signal-teal"
              href="/"
            >
              OddSkies internal
            </Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              Signal Room
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base">
              Private dashboard for collector health, community uploads, review
              queues, Oracle cache, and future visitor signals. Counts guide
              cleanup; they do not verify reports.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <div className="rounded-lg border border-signal-amber/35 bg-signal-amber/10 px-4 py-3 text-sm text-parchment">
              Internal only. Operational signals, not public proof.
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                className="text-sm font-semibold text-signal-teal transition hover:text-parchment"
                href="/admin/raw-sources"
              >
                Raw Source Review
              </Link>
              <Link
                className="text-sm font-semibold text-signal-teal transition hover:text-parchment"
                href="/admin/curated-links"
              >
                Signal Shelf Admin
              </Link>
            </div>
          </div>
        </header>

        {!configured ? (
          <section className="rounded-lg border border-signal-ember/40 bg-night-900 p-6 shadow-heat">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-signal-ember">
              Locked
            </p>
            <h2 className="mt-3 text-2xl font-bold">Admin token missing</h2>
            <p className="mt-2 max-w-2xl text-muted">
              {getAdminTokenMissingMessage()} Add it in Vercel and locally before
              using this internal signal room.
            </p>
          </section>
        ) : authorized && metrics ? (
          <AdminMetricsDashboard metrics={metrics} />
        ) : (
          <AdminLogin />
        )}
      </div>
    </main>
  );
}
