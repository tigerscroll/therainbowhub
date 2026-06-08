import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export function NotFoundContent() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <article className="legacy-main not-found-page" aria-labelledby="not-found-title">
        <section className="legacy-card not-found-hero">
          <div className="not-found-hero__mark" aria-hidden="true">
            <span>?</span>
          </div>
          <h1 id="not-found-title">{translations.error.notFoundTitle}</h1>
          <p>{translations.error.notFoundBody} Head back to the homepage to pick a fresh quiz.</p>
          <div className="hub-load-more">
            <Link className="hub-load-more__button hub-load-more__button--plain" href="/">
              Home
            </Link>
          </div>
        </section>
      </article>
    </SiteShell>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}
