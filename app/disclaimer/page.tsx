import type { Metadata } from "next";
import { InfoPageContent, infoPageMetadata } from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = infoPageMetadata.disclaimer;

export default function DisclaimerPage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/disclaimer" locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug="disclaimer" />
    </SiteShell>
  );
}
