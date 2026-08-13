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
            <Link href={getLocalePath(locale, "/")} className="site-footer__logo" prefetch={false}>
              <span aria-hidden="true"><FooterBrandMark /></span>
              <strong>{translations.site.name}</strong>
            </Link>
            <p>{translations.footer.description}</p>
          </div>

          <nav className="site-footer__nav" aria-label={`${translations.footer.company} / ${translations.footer.legal}`}>
            <div className="site-footer__links">
              <strong>{translations.footer.company}</strong>
              {companyLinks.map((link) => (
                <Link key={link.href} href={getLocalePath(locale, link.href)} prefetch={false}>
                  {translations.footer.links[footerCompanyLabels[link.href]]}
                </Link>
              ))}
            </div>
            <div className="site-footer__links">
              <strong>{translations.footer.legal}</strong>
              {legalLinks.map((link) => (
                <Link key={link.href} href={getLocalePath(locale, link.href)} prefetch={false}>
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

function FooterBrandMark() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32">
      <path d="M4 24a12 12 0 0 1 24 0" fill="none" stroke="#c83f55" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M7 24a9 9 0 0 1 18 0" fill="none" stroke="#ed8d37" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M10 24a6 6 0 0 1 12 0" fill="none" stroke="#46905f" strokeLinecap="round" strokeWidth="3.2" />
      <path d="M13 24a3 3 0 0 1 6 0" fill="none" stroke="#3979aa" strokeLinecap="round" strokeWidth="3.2" />
    </svg>
  );
}
