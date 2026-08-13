"use client";

import { useLayoutEffect, useState } from "react";

import de from "@/data/i18n/de.json";
import en from "@/data/i18n/en.json";
import es from "@/data/i18n/es.json";
import fr from "@/data/i18n/fr.json";
import it from "@/data/i18n/it.json";
import nl from "@/data/i18n/nl.json";
import pt from "@/data/i18n/pt.json";

const translations = { de, en, es, fr, it, nl, pt };
type NotFoundLocale = keyof typeof translations;

function isNotFoundLocale(value: string): value is NotFoundLocale {
  return Object.prototype.hasOwnProperty.call(translations, value);
}

export function GlobalNotFound() {
  const [locale, setLocale] = useState<NotFoundLocale>("en");
  const copy = translations[locale];
  const homePath = locale === "en" ? "/" : `/${locale}`;

  useLayoutEffect(() => {
    const pathLocale = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
    const nextLocale = isNotFoundLocale(pathLocale) ? pathLocale : "en";
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = translations[nextLocale].locale.direction;
    document.title = `${translations[nextLocale].error.notFoundTitle} - ${translations[nextLocale].site.name}`;
  }, []);

  return (
    <div className="site-shell" dir={copy.locale.direction}>
      <header className="hub-header">
        <div className="hub-header__inner">
          <a className="hub-brand" href={homePath}>
            <span aria-hidden="true" className="hub-brand__mark"><BrandMark /></span>
            <span>{copy.site.name}</span>
          </a>
        </div>
      </header>
      <main className="site-content">
        <article className="not-found-page" aria-labelledby="not-found-title">
          <section className="not-found-hero">
            <span className="not-found-hero__code">404</span>
            <div className="not-found-hero__mark" aria-hidden="true"><span>?</span></div>
            <h1 id="not-found-title">{copy.error.notFoundTitle}</h1>
            <p>{copy.error.notFoundBody}</p>
            <a className="not-found-hero__button" href={homePath}>
              <span>{copy.error.backHome}</span>
              <span aria-hidden="true">→</span>
            </a>
          </section>
        </article>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <a className="site-footer__logo" href={homePath}>
              <span aria-hidden="true"><BrandMark /></span>
              <strong>{copy.site.name}</strong>
            </a>
            <p>{copy.footer.description}</p>
          </div>
          <div className="site-footer__bottom">
            <p>&copy; {new Date().getFullYear()} {copy.site.name}. {copy.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandMark() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32">
      <path d="M4 24a12 12 0 0 1 24 0" fill="none" stroke="#c83f55" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M7 24a9 9 0 0 1 18 0" fill="none" stroke="#ed8d37" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M10 24a6 6 0 0 1 12 0" fill="none" stroke="#46905f" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M13 24a3 3 0 0 1 6 0" fill="none" stroke="#3979aa" strokeLinecap="round" strokeWidth="3.2" />
    </svg>
  );
}
