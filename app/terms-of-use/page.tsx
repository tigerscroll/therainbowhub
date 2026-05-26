import type { Metadata } from "next";
import { InfoPageContent, infoPageMetadata } from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = infoPageMetadata["terms-of-use"];

export default function TermsOfUsePage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/terms-of-use" locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug="terms-of-use" />
    </SiteShell>
  );
}
