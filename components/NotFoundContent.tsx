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
          <span className="not-found-hero__code">404</span>
          <div className="not-found-hero__mark" aria-hidden="true">
            <span>?</span>
          </div>
          <h1 id="not-found-title">{translations.error.notFoundTitle}</h1>
          <p>{translations.error.notFoundBody}</p>
          <Link className="not-found-hero__button" href={homePath} prefetch={false}>
            <span>{translations.error.backHome}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </article>
    </SiteShell>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}
