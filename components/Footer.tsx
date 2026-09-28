import { FooterChrome } from "@/components/FooterChrome";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { companyLinks, legalLinks } from "@/lib/siteLinks";

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
  const homePath = getLocalePath(locale, "/");

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
