const categories = [
  { icon: "ufo", label: "UFO / UAP", marker: "bg-signal-teal" },
  { icon: "lights", label: "Strange Lights", marker: "bg-signal-amber" },
  { icon: "haunted", label: "Haunted Places", marker: "bg-signal-violet" },
  { icon: "paranormal", label: "Paranormal", marker: "bg-signal-ember" },
  { icon: "legends", label: "Local Legends", marker: "bg-parchment" },
  { icon: "unknown", label: "Unknown", marker: "bg-muted" },
];

export function CategoryStrip() {
  return (
    <section className="border-b border-night-800 bg-night-950 px-5 py-3">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            className="category-chip inline-flex shrink-0 items-center gap-2 rounded-md border border-night-800 bg-night-900 px-3 py-2 text-sm font-semibold text-parchment transition hover:border-signal-teal/50 hover:bg-night-850"
            key={category.label}
            type="button"
          >
            <span
              aria-hidden="true"
              className={`category-symbol category-symbol-${category.icon}`}
            />
            <span className={`size-2 rounded-full ${category.marker}`} />
            {category.label}
          </button>
        ))}
      </div>
    </section>
  );
}
