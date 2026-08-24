import Link from "next/link";

import {
  getInfoPage,
  getInfoPageMetadata,
  infoPageSlugs,
  isInfoPageSlug,
  type InfoPageSlug,
} from "@/lib/infoPages";
import { getLocalePath, type SupportedLocale } from "@/lib/i18n";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";

export { getInfoPageMetadata, infoPageSlugs, isInfoPageSlug };

type InfoPageContentProps = {
  locale: SupportedLocale;
  slug: InfoPageSlug;
};

export function InfoPageContent({ locale, slug }: InfoPageContentProps) {
  const page = getInfoPage(locale, slug);
  const labels = infoPageLabels[locale];
  const relatedPages = relatedPageSlugs[slug].map((relatedSlug) => ({
    page: getInfoPage(locale, relatedSlug),
    slug: relatedSlug,
  }));

  return (
    <article className={`legal-page info-page info-page--${slug}`}>
      <header className="info-page__hero">
        <div aria-hidden="true" className="info-page__mark"><InfoPageIcon slug={slug} /></div>
        <div className="info-page__hero-copy">
          <p className="info-page__kicker">{page.kicker}</p>
          <h1>{page.title}</h1>
          <p className="info-page__lead">{page.metaDescription}</p>
          <p className="legal-updated">
            <time dateTime={page.lastModified}>{page.updated}</time>
          </p>
        </div>
      </header>

      <div className="info-page__layout">
        <div className="info-page__sections">
          {page.sections.map((section, index) => (
            <section key={section.heading}>
              <div className="info-page__section-heading">
                <h2>{section.heading}</h2>
              </div>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {slug === "contact" && index === 0 ? <ObfuscatedEmail /> : null}
              {section.list ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.after?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <nav aria-label={labels.related} className="info-page__related">
        <strong>{labels.related}</strong>
        <div>
          {relatedPages.map(({ page: relatedPage, slug: relatedSlug }) => (
            <Link href={getLocalePath(locale, `/info/${relatedSlug}`)} key={relatedSlug} prefetch={false}>
              <span>{relatedPage.kicker}</span>
              <b>{relatedPage.title}</b>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </nav>
    </article>
  );
}

const infoPageLabels: Record<SupportedLocale, { related: string }> = {
  en: { related: "Related information" },
  fr: { related: "Informations associées" },
  de: { related: "Verwandte Informationen" },
  it: { related: "Informazioni correlate" },
  nl: { related: "Gerelateerde informatie" },
  es: { related: "Información relacionada" },
  pt: { related: "Informações relacionadas" },
};

const relatedPageSlugs: Record<InfoPageSlug, InfoPageSlug[]> = {
  about: ["accessibility", "disclaimer", "contact"],
  contact: ["accessibility", "privacy-policy", "about"],
  accessibility: ["contact", "about", "privacy-policy"],
  "privacy-policy": ["cookie-policy", "terms-of-use", "contact"],
  "cookie-policy": ["privacy-policy", "terms-of-use", "contact"],
  "terms-of-use": ["disclaimer", "privacy-policy", "contact"],
  disclaimer: ["terms-of-use", "about", "contact"],
};

function InfoPageIcon({ slug }: { slug: InfoPageSlug }) {
  const paths: Record<InfoPageSlug, React.ReactNode> = {
    about: <><circle cx="12" cy="12" r="8" /><path d="M12 10v6M12 7.2h.01" /></>,
    contact: <><rect height="13" rx="2" width="18" x="3" y="5.5" /><path d="m4 7 8 6 8-6" /></>,
    accessibility: <><circle cx="12" cy="4.5" r="2" /><path d="M4 8h16M12 8v12M8 21l4-7 4 7" /></>,
    "privacy-policy": <><rect height="10" rx="2" width="14" x="5" y="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></>,
    "cookie-policy": <><path d="M19.5 13.5A8 8 0 1 1 10.5 4a4 4 0 0 0 4.5 4.5 4 4 0 0 0 4.5 5Z" /><path d="M8 13h.01M12 17h.01M7.5 8.5h.01" /></>,
    "terms-of-use": <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></>,
    disclaimer: <><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5M12 17h.01" /></>,
  };

  return <svg fill="none" focusable="false" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[slug]}</svg>;
}
