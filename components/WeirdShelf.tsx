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
  {
    accent: "text-signal-ember",
    code: "RW",
    copy:
      "Collider Watch: the Large Hadron Collider has scheduled activity. Reality is expected to remain mostly intact.",
    disclaimer:
      "OddSkies jokes about reality glitches, but does not claim scientific experiments cause UFOs, hauntings, Mandela Effects, portals, or timeline shifts.",
    label: "Reality status: Mostly intact",
    title: "Reality Watch",
  },
];

export function WeirdShelf() {
  return (
    <section className="bg-night-950 px-5 py-8 md:py-10" id="weird-shelf">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-signal-violet">
              Culture Shelf
              <span className="ml-2 text-xs normal-case tracking-[0.16em] sm:hidden">
                swipe -&gt;
              </span>
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-parchment md:text-4xl">
              The Weird Shelf
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Tiny bits of folklore, spooky culture, memory glitches, and
              internet weirdness. Unverified, unserious, and best enjoyed with
              snacks.
            </p>
          </div>
          <p className="max-w-md rounded-md border border-night-800 bg-night-900/70 px-3 py-2 text-xs leading-5 text-muted">
            Playful culture notes for the mystery atlas. Not evidence, not
            conclusions, not a portal status page.
          </p>
        </div>

        <div className="weird-shelf-strip flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-4">
          {shelfCards.map((card) => (
            <article
              className="field-card relative min-w-[16rem] overflow-hidden rounded-lg p-3.5 sm:min-w-0"
              key={card.title}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-teal/45 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {card.title}
                  </p>
                  <p className="mt-2 rounded-md border border-night-800 bg-night-950/65 px-2.5 py-1.5 text-xs font-semibold text-signal-amber">
                    {card.label}
                  </p>
                </div>
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-md border border-night-800 bg-night-950/70 text-xs font-black ${card.accent}`}
                >
                  {card.code}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{card.copy}</p>
              {card.disclaimer ? (
                <p className="mt-3 border-t border-night-800 pt-3 text-xs leading-5 text-muted">
                  {card.disclaimer}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-lg border border-night-800 bg-night-900/70 p-3 text-xs leading-5 text-muted">
          Weird Shelf is culture flavor, not evidence. OddSkies treats folklore,
          memory glitches, and internet weirdness as odd little artifacts, not
          confirmed truth.
        </p>
      </div>
    </section>
  );
}
