import Link from "next/link";

export default function SpanishFieldLogCaseNotFound() {
  return (
    <main className="min-h-screen bg-night-950 bg-star-field px-5 py-6 text-parchment">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-signal-teal">
          Expediente perdido
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          Esta señal salió del alcance.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          El Registro público no pudo encontrar ese reporte. Puede haber sido
          renombrado, archivado o devuelto a revisión.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-signal-teal/35 bg-signal-teal/10 px-4 py-2 text-sm font-semibold text-signal-teal transition hover:bg-signal-teal hover:text-night-950"
            href="/es/field-log"
          >
            Ver Registro completo
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-night-800 bg-night-900 px-4 py-2 text-sm font-semibold text-muted transition hover:border-signal-teal/40 hover:text-parchment"
            href="/es"
          >
            Volver al mapa
          </Link>
        </div>
      </div>
    </main>
  );
}
