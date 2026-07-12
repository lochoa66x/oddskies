import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

const homeTitle =
  "OddSkies -- Reportes extraños, OVNI / FANI y registro paranormal";
const homeDescription =
  "OddSkies mapea reportes públicos sin verificar de OVNI / FANI, luces extrañas, lugares embrujados, paranormal, leyendas locales y rarezas por fuente, lugar y fecha. ¿Verificado? No. ¿Interesante? Tal vez. ¿Con fuentes? Siempre.";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  alternates: {
    canonical: "/es",
    languages: {
      en: "/",
      es: "/es",
    },
  },
  description: homeDescription,
  openGraph: {
    description: homeDescription,
    images: [
      {
        alt: "Un cielo extraño al atardecer sobre un horizonte lejano.",
        height: 916,
        url: "/images/oddskies-hero.png",
        width: 1718,
      },
    ],
    siteName: "OddSkies",
    title: homeTitle,
    type: "website",
    url: "/es",
  },
  title: homeTitle,
  twitter: {
    card: "summary_large_image",
    description: homeDescription,
    images: ["/images/oddskies-hero.png"],
    title: homeTitle,
  },
};

export default async function SpanishHome() {
  return <HomePage locale="es" />;
}
