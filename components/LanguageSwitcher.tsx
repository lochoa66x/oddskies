"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { trackOddSkiesEvent } from "@/lib/client-analytics";

type LanguageSwitcherProps = {
  className?: string;
  enHref: string;
  esHref: string;
  locale: Locale;
};

const languageOptions = [
  { label: "EN", locale: "en" as const },
  { label: "ES", locale: "es" as const },
];

export function LanguageSwitcher({
  className = "",
  enHref,
  esHref,
  locale,
}: LanguageSwitcherProps) {
  const hrefs: Record<Locale, string> = {
    en: enHref,
    es: esHref,
  };

  return (
    <nav
      aria-label={locale === "es" ? "Cambiar idioma" : "Change language"}
      className={`inline-flex rounded-md border border-night-800 bg-night-900/80 p-1 text-xs font-bold uppercase tracking-[0.12em] ${className}`}
    >
      {languageOptions.map((option) => {
        const active = option.locale === locale;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-9 min-w-11 items-center justify-center rounded px-2 transition ${
              active
                ? "bg-signal-teal text-night-950 shadow-glow"
                : "text-muted hover:bg-night-850 hover:text-parchment"
            }`}
            href={hrefs[option.locale]}
            key={option.locale}
            onClick={() => {
              if (!active) {
                trackOddSkiesEvent("language_changed", {
                  locale: option.locale,
                });
              }
            }}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
