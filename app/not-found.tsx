import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export default function NotFound() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <article className="legal-page">
        <p className="legal-kicker">404</p>
        <h1>{translations.error.notFoundTitle}</h1>
        <p className="legal-updated">{translations.error.notFoundBody}</p>
        <section>
          <Link className="hub-btn-3d" href="/">
            {translations.error.backHome}
          </Link>
        </section>
      </article>
    </SiteShell>
  );
}
