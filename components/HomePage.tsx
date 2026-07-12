import Link from "next/link";
import { CategoryStrip } from "@/components/CategoryStrip";
import { FieldDispatch } from "@/components/FieldDispatch";
import { Hero } from "@/components/Hero";
import { LatestReports } from "@/components/LatestReports";
import { SignalShelfPreview } from "@/components/SignalShelfPreview";
import { SignalsWeirdness } from "@/components/SignalsWeirdness";
import { WeirdShelf } from "@/components/WeirdShelf";
import { getCuratedLinks } from "@/lib/curated-links";
import { localizedPath, type Locale } from "@/lib/i18n";
import {
  getFieldLogReports,
  getHomepageDisplayReports,
  getReports,
} from "@/lib/reports";

export async function HomePage({ locale = "en" }: { locale?: Locale }) {
  const copy = getHomePageCopy(locale);
  const reports = await getReports();
  const displayReports = getHomepageDisplayReports(reports);
  const fieldLogReports = getFieldLogReports(reports);
  const curatedLinks = await getCuratedLinks();

  return (
    <main className="min-h-screen overflow-hidden bg-night-950 text-parchment">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            description: copy.schemaDescription,
            name: "OddSkies",
            url: locale === "es" ? "https://oddskies.com/es" : "https://oddskies.com",
          }),
        }}
        type="application/ld+json"
      />
      <Hero locale={locale} reports={displayReports} />
      <CategoryStrip locale={locale} />
      <LatestReports
        locale={locale}
        reports={fieldLogReports}
        totalCount={fieldLogReports.length}
      />
      <SignalsWeirdness locale={locale} reports={fieldLogReports} />
      <WeirdShelf locale={locale} />
      <SignalShelfPreview locale={locale} links={curatedLinks} />
      <FieldDispatch locale={locale} />
      <footer className="site-footer px-5 py-6">
        <div className="mx-auto max-w-7xl border-t border-night-800 pt-5 text-sm text-muted">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="font-semibold text-parchment">OddSkies</p>
              <p className="mt-1 text-parchment">{copy.footerTagline}</p>
              <p className="mt-2 leading-6">{copy.footerDescription}</p>
              <p>oddskies.com</p>
              <p className="mt-2 text-xs text-slate-500">
                A Voynich Tech experiment
              </p>
            </div>
            <div className="flex flex-wrap gap-5">
              {copy.footerLinks.map((link) => (
                <Link
                  className="transition hover:text-signal-teal"
                  href={localizedPath(locale, link.href)}
                  key={link.label}
                >
                  {link.label}
                </Link>
              ))}
              <a className="transition hover:text-signal-teal" href="#">
                {copy.privacy}
              </a>
              <Link
                className="transition hover:text-signal-teal"
                href="/about#policy"
              >
                {copy.policy}
              </Link>
              <a className="transition hover:text-signal-teal" href="#oracle">
                {copy.oracle}
              </a>
            </div>
          </div>
          <p className="site-footer-finish mt-5 pt-4">{copy.footerFinish}</p>
        </div>
      </footer>
    </main>
  );
}

function getHomePageCopy(locale: Locale) {
  if (locale === "es") {
    return {
      footerDescription:
        "OddSkies organiza reportes públicos sin verificar para curiosidad y entretenimiento. No confirmamos avistamientos, afirmaciones paranormales ni la autenticidad de las fuentes.",
      footerFinish:
        "Fin del expediente de campo actual · Los reportes siguen sin verificarse",
      footerLinks: [
        { href: "/field-log", label: "Registro de campo" },
        { href: "/signal-shelf", label: "Estante de señales" },
        { href: "/categories", label: "Categorías" },
        { href: "/regions", label: "Regiones" },
        { href: "/about", label: "Acerca de" },
        { href: "/send-signal", label: "Enviar una señal" },
        { href: "/source-guidelines", label: "Guía de fuentes" },
      ],
      footerTagline: "Reportes extraños, mapeados con honestidad.",
      oracle: "Oráculo",
      policy: "Política",
      privacy: "Privacidad",
      schemaDescription:
        "Un atlas y Registro de Campo de reportes extraños, con fuentes y sin verificar.",
    };
  }

  return {
    footerDescription:
      "OddSkies organizes unverified public reports for curiosity and entertainment. We do not confirm sightings, paranormal claims, or source authenticity.",
    footerFinish: "End of current field file · Reports remain unverified",
    footerLinks: [
      { href: "/field-log", label: "Field Log" },
      { href: "/signal-shelf", label: "Signal Shelf" },
      { href: "/categories", label: "Categories" },
      { href: "/regions", label: "Regions" },
      { href: "/about", label: "About" },
      { href: "/send-signal", label: "Send a Signal" },
      { href: "/source-guidelines", label: "Source Guidelines" },
    ],
    footerTagline: "Strange reports, honestly mapped.",
    oracle: "Oracle",
    policy: "Policy",
    privacy: "Privacy",
    schemaDescription:
      "A source-linked, unverified strange report atlas and Field Log.",
  };
}
