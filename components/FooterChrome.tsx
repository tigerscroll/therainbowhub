import Link from "next/link";

import type { Translations } from "@/lib/i18n";

export type FooterChromeLink = {
  href: string;
  label: string;
};

type FooterChromeProps = {
  companyLinks: FooterChromeLink[];
  homePath: string;
  legalLinks: FooterChromeLink[];
  translations: Translations;
};

export function FooterChrome({ companyLinks, homePath, legalLinks, translations }: FooterChromeProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link href={homePath} className="site-footer__logo" prefetch={false}>
              <span aria-hidden="true"><FooterBrandMark /></span>
              <strong>{translations.site.name}</strong>
            </Link>
            <p>{translations.footer.description}</p>
          </div>

          <nav className="site-footer__nav" aria-label={`${translations.footer.company} / ${translations.footer.legal}`}>
            <div className="site-footer__links">
              <strong>{translations.footer.company}</strong>
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href} prefetch={false}>{link.label}</Link>
              ))}
            </div>
            <div className="site-footer__links">
              <strong>{translations.footer.legal}</strong>
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} prefetch={false}>{link.label}</Link>
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
