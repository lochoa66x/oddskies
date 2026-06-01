const tonight = [
  { label: "Most active window", value: "9 PM - 1 AM" },
  { label: "Trending category", value: "Strange Lights" },
  { label: "Hot region", value: "Global watchlist" },
  { label: "Oracle mood", value: "Suspiciously Interesting" },
];

export function TonightsOddSkies() {
  return (
    <section className="bg-night-950 px-5 py-12 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="field-card rounded-lg p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-amber">
                Field Log
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-parchment md:text-4xl">
                Tonight&apos;s OddSkies
              </h2>
            </div>
            <p className="max-w-sm rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-sm text-signal-amber">
              Preview data shown for concept only.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tonight.map((item) => (
              <div
                className="flex min-h-28 flex-col justify-between rounded-md border border-night-800 bg-night-850 p-4"
                key={item.label}
              >
                <p className="text-sm text-muted">{item.label}</p>
                <p className="mt-3 text-xl font-semibold text-parchment">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
