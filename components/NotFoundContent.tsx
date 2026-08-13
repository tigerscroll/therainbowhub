import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import {
  getDefaultLocale,
  getLocalePath,
  getTranslations,
  type SupportedLocale,
} from "@/lib/i18n";

export function NotFoundContent({ locale = getDefaultLocale() }: { locale?: SupportedLocale }) {
  const translations = getTranslations(locale);
  const homePath = getLocalePath(locale, "/");

  return (
    <SiteShell currentPath={homePath} locale={locale} translations={translations}>
      <article className="not-found-page" aria-labelledby="not-found-title">
        <section className="not-found-hero">
          <div className="not-found-hero__mark" aria-hidden="true">
            <span>?</span>
          </div>
          <h1 id="not-found-title">{translations.error.notFoundTitle}</h1>
          <p>{translations.error.notFoundBody}</p>
          <div className="hub-load-more">
            <Link className="hub-load-more__button hub-load-more__button--plain" href={homePath}>
              {translations.error.backHome}
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
