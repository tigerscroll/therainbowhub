import { FooterChrome } from "@/components/FooterChrome";
import Link from "next/link";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { companyLinks, legalLinks } from "@/lib/siteLinks";

type FooterProps = {
  variant?: "default" | "simple";
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

export function Footer({ locale, translations, variant = "default" }: FooterProps) {
  const homePath = getLocalePath(locale, "/");

  if (variant === "simple") {
    const links = [...companyLinks, ...legalLinks];
    return (
      <footer className="simple-footer">
        <nav aria-label={`${translations.footer.company} / ${translations.footer.legal}`}>
          {links.map(link => <Link key={link.href} href={getLocalePath(locale, link.href)} prefetch={false}>
            {translations.footer.links[footerCompanyLabels[link.href] ?? footerLegalLabels[link.href]]}
          </Link>)}
        </nav>
        <p>&copy; {new Date().getFullYear()} {translations.site.name}. {translations.footer.rights}</p>
      </footer>
    );
  }

  return (
    <FooterChrome
      companyLinks={companyLinks.map((link) => ({
        href: getLocalePath(locale, link.href),
        label: translations.footer.links[footerCompanyLabels[link.href]],
      }))}
      homePath={homePath}
      legalLinks={legalLinks.map((link) => ({
        href: getLocalePath(locale, link.href),
        label: translations.footer.links[footerLegalLabels[link.href]],
      }))}
      translations={translations}
    />
  );
}
