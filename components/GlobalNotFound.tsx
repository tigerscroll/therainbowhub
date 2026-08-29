"use client";

import { useLayoutEffect, useState } from "react";

import { FooterChrome } from "@/components/FooterChrome";
import { HeaderChrome, type HeaderLanguageOption } from "@/components/HeaderChrome";
import { TrackingPageView } from "@/components/TrackingPageView";
import de from "@/data/i18n/de.json";
import en from "@/data/i18n/en.json";
import es from "@/data/i18n/es.json";
import fr from "@/data/i18n/fr.json";
import it from "@/data/i18n/it.json";
import nl from "@/data/i18n/nl.json";
import pt from "@/data/i18n/pt.json";
import { getLocaleOptions, getLocalePath } from "@/lib/localeConfig";
import { companyLinks, legalLinks } from "@/lib/siteLinks";

const translations = { de, en, es, fr, it, nl, pt };
type NotFoundLocale = keyof typeof translations;

function isNotFoundLocale(value: string): value is NotFoundLocale {
  return Object.prototype.hasOwnProperty.call(translations, value);
}

export function GlobalNotFound() {
  const [locale, setLocale] = useState<NotFoundLocale>("en");
  const copy = translations[locale];
  const homePath = getLocalePath(locale, "/");
  const languageOptions: HeaderLanguageOption[] = getLocaleOptions().map((option) => ({
    ...option,
    href: getLocalePath(option.code, "/"),
  }));

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
      <TrackingPageView />
      <HeaderChrome homePath={homePath} languageOptions={languageOptions} locale={locale} translations={copy} />
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
      <FooterChrome
        companyLinks={companyLinks.map((link) => ({
          href: getLocalePath(locale, link.href),
          label: copy.footer.links[link.href === "/info/about" ? "about" : link.href === "/info/contact" ? "contact" : "accessibility"],
        }))}
        homePath={homePath}
        legalLinks={legalLinks.map((link) => ({
          href: getLocalePath(locale, link.href),
          label: copy.footer.links[
            link.href === "/info/privacy-policy" ? "privacyPolicy"
              : link.href === "/info/cookie-policy" ? "cookiePolicy"
                : link.href === "/info/terms-of-use" ? "termsOfUse"
                  : "disclaimer"
          ],
        }))}
        translations={copy}
      />
    </div>
  );
}
