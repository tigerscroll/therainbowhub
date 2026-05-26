import type { Metadata } from "next";
import { InfoPageContent, infoPageMetadata } from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = infoPageMetadata["cookie-policy"];

export default function CookiePolicyPage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/cookie-policy" locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug="cookie-policy" />
    </SiteShell>
  );
}
