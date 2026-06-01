const shelfCards = [
  {
    accent: "text-signal-teal",
    code: "MW",
    copy:
      "Some people remember it one way. Reality appears to have filed a different version. Check multiple sources before blaming the collider.",
    disclaimer:
      "OddSkies does not confirm timeline changes. Human memory is already weird.",
    label: "Memory glitch level: Mild",
    title: "Mandela Watch",
  },
  {
    accent: "text-signal-violet",
    code: "SS",
    copy:
      "Haunted places, whispering roads, cold hallways, local legends, and buildings where the lights flicker with suspicious timing.",
    label: "Current mood: Quietly haunted",
    title: "Spooky Shelf",
  },
  {
    accent: "text-signal-amber",
    code: "CW",
    copy:
      "Today's forecast: scattered timeline rumors, mild UFO discourse, and a 40% chance someone blames the pyramids.",
    label: "Tin foil advisory: Low",
    title: "Conspiracy Weather",
  },
];

export function WeirdShelf() {
  return (
    <section className="bg-night-950 px-5 py-12 md:py-16" id="weird-shelf">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-violet">
              Culture Shelf
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-parchment md:text-5xl">
              The Weird Shelf
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              Tiny bits of folklore, spooky culture, memory glitches, and
              internet weirdness. Unverified, unserious, and best enjoyed with
              snacks.
            </p>
          </div>
          <p className="max-w-md rounded-md border border-night-800 bg-night-900/70 px-4 py-3 text-sm leading-6 text-muted">
            Playful culture notes for the mystery atlas. Not evidence, not
            conclusions, not a portal status page.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {shelfCards.map((card) => (
            <article
              className="field-card relative overflow-hidden rounded-lg p-5"
              key={card.title}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-teal/45 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                    {card.title}
                  </p>
                  <p className="mt-3 rounded-md border border-night-800 bg-night-950/65 px-3 py-2 text-sm font-semibold text-signal-amber">
                    {card.label}
                  </p>
                </div>
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-md border border-night-800 bg-night-950/70 text-sm font-black ${card.accent}`}
                >
                  {card.code}
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-muted">{card.copy}</p>
              {card.disclaimer ? (
                <p className="mt-4 border-t border-night-800 pt-4 text-xs leading-5 text-muted">
                  {card.disclaimer}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <article className="field-card rounded-lg p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-teal">
              Reality Disturbance Watch
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-night-800 bg-night-950/60 p-4">
                <p className="font-semibold text-parchment">Collider Watch</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  When the Large Hadron Collider has scheduled activity,
                  reality is expected to remain mostly intact.
                </p>
              </div>
              <div className="rounded-md border border-night-800 bg-night-950/60 p-4">
                <p className="font-semibold text-parchment">
                  Mandela Effect Advisory
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Low to Medium. If your favorite movie quote changes, please
                  check three sources before blaming the collider.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-signal-amber/25 bg-signal-amber/10 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-signal-amber">
              Honesty Line
            </p>
            <p className="mt-3 text-sm leading-6 text-signal-amber">
              OddSkies jokes about reality glitches and internet weirdness, but
              we do not claim that conspiracies, scientific experiments, moon
              phases, or cosmic events cause UFOs, hauntings, Mandela Effects,
              portals, or timeline shifts.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
