const categories = [
  { label: "UFO / UAP", marker: "bg-signal-teal" },
  { label: "Strange Lights", marker: "bg-signal-amber" },
  { label: "Haunted Places", marker: "bg-signal-violet" },
  { label: "Paranormal", marker: "bg-signal-ember" },
  { label: "Local Legends", marker: "bg-parchment" },
  { label: "Unknown", marker: "bg-muted" },
];

export function CategoryStrip() {
  return (
    <section className="border-b border-night-800 bg-night-950 px-5 py-5">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-night-800 bg-night-900 px-4 py-3 text-sm font-semibold text-parchment transition hover:border-signal-teal/50 hover:bg-night-850"
            key={category.label}
            type="button"
          >
            <span className={`size-2 rounded-full ${category.marker}`} />
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
}
