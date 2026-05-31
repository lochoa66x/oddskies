import Image from "next/image";

const navItems = ["Map", "Reports", "Trends", "Oracle"];

export function Hero() {
  return (
    <section className="relative min-h-[86svh] overflow-hidden border-b border-white/10">
      <Image
        alt="Strange twilight sky over a distant horizon"
        className="absolute inset-0 h-full w-full object-cover"
        fill
        priority
        sizes="100vw"
        src="/images/oddskies-hero.png"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/[0.78] to-night-950/[0.18]" />
      <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/[0.28]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <a className="group flex items-center gap-3" href="#">
          <span className="grid size-9 place-items-center rounded-lg border border-signal-cyan/40 bg-signal-cyan/10 text-sm font-black text-signal-cyan shadow-glow">
            OS
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-slate-100">
              OddSkies
            </span>
            <span className="block text-xs text-slate-400">oddskies.com</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-night-950/[0.45] p-1 text-sm text-slate-300 backdrop-blur md:flex">
          {navItems.map((item) => (
            <a
              className="rounded-md px-3 py-2 transition hover:bg-white/[0.08] hover:text-white"
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto flex max-w-7xl px-5 pb-16 pt-16 md:pb-24 md:pt-28">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-lg border border-signal-teal/30 bg-signal-teal/10 px-3 py-2 text-sm font-medium text-signal-green">
            Strange reports, honestly mapped.
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] text-white sm:text-6xl md:text-7xl">
            Explore strange reports from the skies and beyond.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            OddSkies maps public, unverified reports by time, place, category,
            and source.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-signal-cyan px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-signal-green"
              href="#reports"
            >
              Explore Reports
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/[0.14] bg-white/[0.08] px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-signal-teal/50 hover:bg-signal-teal/[0.12]"
              href="#oracle"
            >
              Ask the Oracle
            </a>
          </div>
          <p className="mt-7 max-w-2xl rounded-lg border border-white/10 bg-night-950/[0.42] px-4 py-3 text-sm text-slate-300 backdrop-blur">
            Reports are unverified and source-linked when available.
          </p>
        </div>
      </div>
    </section>
  );
}
