const regions = [
  {
    label: "North America",
    note: "Desert triangles, lake lights, and coastal sky reports.",
  },
  {
    label: "UK & Ireland",
    note: "Castle echoes, old roads, and local haunted-place stories.",
  },
  {
    label: "Latin America",
    note: "Volcano watches, city signals, and regional mystery threads.",
  },
  {
    label: "Western Europe",
    note: "Forest legends, old villages, and recurring strange-light reports.",
  },
  {
    label: "East Asia",
    note: "Urban sky pulses, harbor lights, and fast-moving aerial reports.",
  },
  {
    label: "Oceania",
    note: "Outback glows, coastal sightings, and remote local legends.",
  },
];

export function FeaturedRegions() {
  return (
    <section className="border-b border-night-800 bg-night-950 px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
              Global Watchlist
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-parchment md:text-3xl">
              Featured mystery regions
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted">
            OddSkies explores strange reports from around the world, from sky
            anomalies to haunted places and local legends.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <article
              className="field-card rounded-lg p-4 transition hover:border-signal-teal/40"
              key={region.label}
            >
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-signal-teal shadow-[0_0_14px_rgba(72,224,194,0.65)]" />
                <h3 className="font-semibold text-parchment">
                  {region.label}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {region.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
