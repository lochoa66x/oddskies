const badges = [
  "Unverified by default",
  "Source-linked when available",
  "AI summaries may be imperfect",
  "Public reports, not confirmed events",
];

const notItems = [
  "Not a verification authority",
  "Not a government database",
  "Not proof of UFOs or paranormal activity",
  "Not a replacement for checking original sources",
];

const sourceGuidelines = [
  "Reports should link to an original public source whenever possible.",
  "Reports are labeled unverified by default.",
  "AI summaries or future Oracle responses may be imperfect.",
  "Users should review the original source before forming conclusions.",
  "Duplicates, jokes, and low-context reports may be filtered or labeled later.",
];

const categoryNotes = [
  {
    label: "UFO / UAP",
    note: "Unusual aerial reports or objects in the sky.",
  },
  {
    label: "Strange Lights",
    note: "Lights, flashes, or formations that may or may not be explainable.",
  },
  {
    label: "Haunted Places",
    note: "Places connected to ghost stories or eerie reports.",
  },
  {
    label: "Paranormal",
    note: "Unusual experiences that do not fit the other categories.",
  },
  {
    label: "Local Legends",
    note: "Folklore, recurring stories, and regional mysteries.",
  },
  {
    label: "Unknown",
    note: "Reports without enough context to classify.",
  },
];

export function Disclaimer() {
  return (
    <section
      className="border-y border-night-800 bg-night-900 px-5 py-16 md:py-20"
      id="about"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-amber">
            Content & Trust Layer
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-parchment md:text-5xl">
            What OddSkies is
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            OddSkies is a mystery atlas for strange public reports. We organize
            sightings and stories by time, place, category, and source so
            curious people can explore patterns without pretending every report
            is confirmed.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="field-card rounded-lg p-6 md:p-7" id="policy">
            <h3 className="text-2xl font-semibold text-parchment">
              What OddSkies is not
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted">
              We do not confirm sightings or paranormal claims. A report may be
              real, mistaken, AI-generated, staged, edited, satire, or a joke.
              OddSkies simply keeps the trail organized.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {notItems.map((item) => (
                <div
                  className="rounded-md border border-night-800 bg-night-850 px-4 py-3 text-sm font-semibold text-parchment"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  className="rounded-md border border-night-800 bg-night-850 px-3 py-2 text-xs font-semibold text-parchment"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div
            className="field-card rounded-lg p-6 md:p-7"
            id="source-guidelines"
          >
            <h3 className="text-2xl font-semibold text-parchment">
              How sources work
            </h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
              {sourceGuidelines.map((item) => (
                <li className="flex gap-3" key={item}>
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal-teal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 field-card rounded-lg p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-teal">
                Category Notes
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-parchment">
                How reports get grouped
              </h3>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted">
              Categories are labels for browsing, not conclusions about what
              happened.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categoryNotes.map((category) => (
              <article
                className="rounded-md border border-night-800 bg-night-850 p-4"
                key={category.label}
              >
                <h4 className="font-semibold text-parchment">
                  {category.label}
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {category.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
