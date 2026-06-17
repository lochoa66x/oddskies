import type {
  AdminMetricCard,
  AdminMetricTone,
  AdminMetrics,
} from "@/lib/admin-metrics";

type AdminMetricsDashboardProps = {
  metrics: AdminMetrics;
};

const toneClasses: Record<AdminMetricTone, string> = {
  amber: "border-signal-amber/35 bg-signal-amber/10 text-signal-amber",
  ember: "border-signal-ember/35 bg-signal-ember/10 text-signal-ember",
  muted: "border-night-800 bg-night-950 text-muted",
  teal: "border-signal-teal/35 bg-signal-teal/10 text-signal-teal",
  violet: "border-signal-violet/35 bg-signal-violet/10 text-signal-violet",
};

export function AdminMetricsDashboard({ metrics }: AdminMetricsDashboardProps) {
  return (
    <div className="space-y-6">
      {metrics.warnings.length > 0 ? (
        <section className="rounded-lg border border-signal-ember/40 bg-signal-ember/10 p-5 text-sm text-parchment shadow-heat">
          <p className="font-semibold uppercase tracking-[0.24em] text-signal-ember">
            Signal room warning
          </p>
          <ul className="mt-3 space-y-2 text-muted">
            {metrics.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.overview.map((item) => (
          <MetricCard key={item.label} item={item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel
          eyebrow="Intake split"
          title="Collector/API lane"
          subtitle="Automated pulls land here first. Nothing becomes public until review."
        >
          <MetricGrid items={metrics.collectorFeed} />
        </Panel>

        <Panel
          eyebrow="Community lane"
          title="Signal uploads"
          subtitle="Human-submitted signals get their own lane so spam and messy uploads do not muddy collector review."
        >
          <MetricGrid items={metrics.communityFeed} />
        </Panel>
      </section>

      <Panel
        eyebrow="Review weather"
        title="Queue comparison"
        subtitle="Collector/API rows and community uploads should be judged with different expectations."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.22em] text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Stage</th>
                <th className="px-3 py-2 font-semibold">Collector/API</th>
                <th className="px-3 py-2 font-semibold">Community</th>
                <th className="px-3 py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {metrics.reviewFunnel.map((row) => (
                <tr key={row.label} className="rounded-lg bg-night-950">
                  <td className="rounded-l-lg border-y border-l border-night-800 px-3 py-3 font-semibold text-parchment">
                    {row.label}
                  </td>
                  <td className="border-y border-night-800 px-3 py-3 text-signal-teal">
                    {row.collector}
                  </td>
                  <td className="border-y border-night-800 px-3 py-3 text-signal-violet">
                    {row.community}
                  </td>
                  <td className="rounded-r-lg border-y border-r border-night-800 px-3 py-3 text-muted">
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          eyebrow="Collector health"
          title="Recent pull runs"
          subtitle="A quick pulse check for staged collector activity."
        >
          {metrics.latestRun ? (
            <div className="mb-4 rounded-lg border border-night-800 bg-night-950 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Latest run
                  </p>
                  <p className="mt-2 font-semibold text-parchment">
                    {metrics.latestRun.label}
                  </p>
                </div>
                <span className="rounded-full border border-signal-teal/35 bg-signal-teal/10 px-3 py-1 text-sm font-semibold text-signal-teal">
                  {metrics.latestRun.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
                <p>Started: {metrics.latestRun.startedAt}</p>
                <p>Finished: {metrics.latestRun.finishedAt ?? "Still open"}</p>
                <p>Fetched: {metrics.latestRun.fetched}</p>
                <p>Inserted: {metrics.latestRun.inserted}</p>
                <p>Duplicates: {metrics.latestRun.duplicates}</p>
                <p>Errors: {metrics.latestRun.errors}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-night-800 bg-night-950 p-4 text-muted">
              No collector runs logged yet.
            </p>
          )}

          <div className="space-y-2">
            {metrics.recentRuns.map((run) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-night-800 bg-night-950 px-4 py-3 text-sm"
                key={run.id}
              >
                <span className="font-semibold text-parchment">{run.label}</span>
                <span className="text-muted">
                  {run.dryRun ? "Dry run" : "Staged insert"} · {run.fetched} fetched ·{" "}
                  {run.inserted} inserted
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          eyebrow="Visitor signals"
          title="Traffic room placeholder"
          subtitle="For now this stays intentionally quiet. Later we can connect privacy-friendly analytics here."
        >
          <MetricGrid items={metrics.visitorSignals} />
          <div className="mt-4 rounded-lg border border-signal-amber/35 bg-signal-amber/10 p-4 text-sm leading-6 text-muted">
            Visitor location and traffic sources should be aggregated and internal
            only. The public site should stay playful, not surveillance-flavored.
          </div>
        </Panel>
      </section>

      <section className="rounded-lg border border-night-800 bg-night-900 p-5 shadow-map">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal-teal">
          Operating notes
        </p>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted md:grid-cols-3">
          {metrics.notes.map((note) => (
            <li className="rounded-lg border border-night-800 bg-night-950 p-4" key={note}>
              {note}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
          Generated {formatGeneratedAt(metrics.generatedAt)}
        </p>
      </section>
    </div>
  );
}

function MetricGrid({ items }: { items: AdminMetricCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <MetricCard item={item} key={item.label} />
      ))}
    </div>
  );
}

function MetricCard({ item }: { item: AdminMetricCard }) {
  const tone = item.tone ?? "muted";

  return (
    <article className="rounded-lg border border-night-800 bg-night-950 p-4 shadow-map">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          {item.label}
        </p>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          {tone}
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-parchment">
        {item.value}
      </p>
      {item.detail ? (
        <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
      ) : null}
    </article>
  );
}

function Panel({
  children,
  eyebrow,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-night-800 bg-night-900 p-5 shadow-map">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal-teal">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-parchment">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
