import type { Metadata } from "next";
import { InfoPageContent, infoPageMetadata } from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = infoPageMetadata["privacy-policy"];

export default function PrivacyPolicyPage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/privacy-policy" locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug="privacy-policy" />
    </SiteShell>
  );
}
