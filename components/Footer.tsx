import Link from "next/link";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { companyLinks, legalLinks } from "@/lib/siteConfig";

type FooterProps = {
  locale: SupportedLocale;
  translations: Translations;
};

const footerCompanyLabels: Record<string, keyof Translations["footer"]["links"]> = {
  "/info/about": "about",
  "/info/contact": "contact",
  "/info/accessibility": "accessibility",
};

const footerLegalLabels: Record<string, keyof Translations["footer"]["links"]> = {
  "/info/privacy-policy": "privacyPolicy",
  "/info/cookie-policy": "cookiePolicy",
  "/info/terms-of-use": "termsOfUse",
  "/info/disclaimer": "disclaimer",
};

export function Footer({ locale, translations }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link href={getLocalePath(locale, "/")} className="site-footer__logo">
              <span aria-hidden="true">🌈</span>
              <strong>{translations.site.name}</strong>
            </Link>
            <p>{translations.footer.description}</p>
          </div>

          <nav className="site-footer__nav" aria-label={`${translations.footer.company} / ${translations.footer.legal}`}>
            <div className="site-footer__links">
              <strong>{translations.footer.company}</strong>
              {companyLinks.map((link) => (
                <Link key={link.href} href={getLocalePath(locale, link.href)}>
                  {translations.footer.links[footerCompanyLabels[link.href]]}
                </Link>
              ))}
            </div>
            <div className="site-footer__links">
              <strong>{translations.footer.legal}</strong>
              {legalLinks.map((link) => (
                <Link key={link.href} href={getLocalePath(locale, link.href)}>
                  {translations.footer.links[footerLegalLabels[link.href]]}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <p>&copy; {new Date().getFullYear()} {translations.site.name}. {translations.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
