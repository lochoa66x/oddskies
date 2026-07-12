import { getReportCasePath, type Report } from "@/lib/reports";

export type Locale = "en" | "es";
export type SearchParamsLike = Record<string, string | string[] | undefined>;

export function isSpanish(locale: Locale) {
  return locale === "es";
}

export function localizedPath(locale: Locale, path: string) {
  if (!isSpanish(locale)) {
    return path;
  }

  if (path.startsWith("#")) {
    return path;
  }

  if (path === "/") {
    return "/es";
  }

  if (path.startsWith("/#")) {
    return `/es${path.slice(1)}`;
  }

  if (
    path === "/field-log" ||
    path.startsWith("/field-log/") ||
    path.startsWith("/field-log?")
  ) {
    return `/es${path}`;
  }

  return path;
}

export function localizedReportCasePath(report: Report, locale: Locale) {
  return localizedPath(locale, getReportCasePath(report));
}

export function pathWithSearchParams(
  path: string,
  params: SearchParamsLike = {},
) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) {
          search.append(key, entry);
        }
      });
      return;
    }

    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();

  return query ? `${path}?${query}` : path;
}

const categoryLabels: Record<string, string> = {
  "All categories": "Todas las categorías",
  "Haunted Place": "Lugar embrujado",
  "Haunted Places": "Lugares embrujados",
  "Local Legends": "Leyendas locales",
  Paranormal: "Paranormal",
  "Strange Lights": "Luces extrañas",
  "UFO / UAP": "OVNI / FANI",
  Unknown: "Sin clasificar",
};

const regionLabels: Record<string, string> = {
  All: "Todo",
  "East Asia": "Asia oriental",
  "Latin America": "Latinoamérica",
  "North America": "Norteamérica",
  Oceania: "Oceanía",
  "UK & Ireland": "Reino Unido e Irlanda",
  "Western Europe": "Europa occidental",
};

const commonLabels: Record<string, string> = {
  Archived: "Archivado",
  "Active Watch": "Observación activa",
  "Bring another witness": "Trae otro testigo",
  "Card PNG": "Tarjeta PNG",
  Caption: "Texto breve",
  "Citizen science project": "Proyecto de ciencia ciudadana",
  "Community post": "Publicación comunitaria",
  "Collector test file":
    "Archivo de prueba del colector: salida revisada antes de aparecer públicamente.",
  "Context-rich": "Con contexto",
  "Copied": "Copiado",
  "Culture note": "Nota cultural",
  "Cultural commentary": "Contexto cultural",
  "Curiosity meter, not evidence.": "Medidor de curiosidad, no evidencia.",
  "Demo seed file":
    "Archivo demo: contenido de muestra para probar el atlas, no una afirmación en vivo.",
  "Eerie but Thin": "Inquietante pero débil",
  Featured: "Destacado",
  "Folklore Signal": "Señal folclórica",
  "Folklore reference": "Referencia de folclore",
  "Full read": "Lectura completa",
  Global: "Global",
  "Government historic site": "Sitio histórico oficial",
  "Guarded Folklore": "Folclore con cuidado",
  High: "Alta",
  high: "Alta",
  "Internal resource": "Recurso interno",
  internal_resource: "Recurso interno",
  landmark: "Lugar reconocido",
  Landmark: "Lugar reconocido",
  Link: "Enlace",
  "Linked trail": "Ruta de fuentes",
  Local: "Local",
  local: "Local",
  "Local legend reference": "Referencia de leyenda local",
  Locality: "Localidad",
  locality: "Localidad",
  Low: "Baja",
  "Low Context": "Bajo contexto",
  "Low-context collector test":
    "Prueba de colector con poco contexto: material con rastro débil, aún en revisión.",
  "Maybe-weird": "Quizá raro",
  Medium: "Media",
  medium: "Media",
  "Mildly Odd": "Medianamente raro",
  "Mildly odd": "Medianamente raro",
  "Mostly Explained": "Mayormente explicado",
  "News article": "Artículo de noticias",
  "No fake certainty": "Sin falsa certeza",
  "Official site": "Sitio oficial",
  "Oracle read": "Lectura del Oráculo",
  "Oracle sleeping": "Oráculo dormido",
  "Probably Rocket Junk": "Probable chatarra espacial",
  "Public forum post": "Publicación pública",
  "Public blog post": "Publicación pública de blog",
  "Public news report": "Reporte público de noticias",
  "Public report file":
    "Archivo público: incluido para revisión y curiosidad; sigue sin verificarse.",
  "Public source": "Fuente pública",
  "Public video post": "Publicación pública de video",
  "Reference article": "Artículo de referencia",
  "Regional": "Regional",
  regional: "Regional",
  Reviewing: "En revisión",
  "Signal shelf": "Estante de señales",
  Share: "Compartir",
  Shared: "Compartido",
  "Social thread": "Hilo social",
  "Social post": "Publicación social",
  "Source guidance": "Guía de fuentes",
  "Source guidelines": "Guía de fuentes",
  "Source-light": "Pocas fuentes",
  source_guidance: "Guía de fuentes",
  "Static fallback": "Lectura local",
  Summary: "Resumen",
  "Suspiciously Interesting": "Sospechosamente interesante",
  Unverified: "Sin verificar",
};

const sortLabels: Record<string, string> = {
  "Maybe-weird first": "Primero lo más raro",
  "Newest first": "Más recientes primero",
  "Oldest first": "Más antiguos primero",
  "Source-rich first": "Mejores fuentes primero",
};

export function categoryLabel(value: string, locale: Locale) {
  return isSpanish(locale) ? categoryLabels[value] ?? value : value;
}

export function regionLabel(value: string, locale: Locale) {
  return isSpanish(locale) ? regionLabels[value] ?? value : value;
}

export function uiLabel(value: string, locale: Locale) {
  return isSpanish(locale) ? commonLabels[value] ?? value : value;
}

export function sortLabel(value: string, locale: Locale) {
  return isSpanish(locale) ? sortLabels[value] ?? value : value;
}

export function displayLabel(value: string, locale: Locale) {
  if (!isSpanish(locale)) {
    return value;
  }

  return commonLabels[value] ?? categoryLabels[value] ?? regionLabels[value] ?? value;
}
