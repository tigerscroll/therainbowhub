import type { Metadata } from "next";
import { InfoPageContent, infoPageMetadata } from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export const metadata: Metadata = infoPageMetadata.contact;

export default function ContactPage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/contact" locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug="contact" />
    </SiteShell>
  );
}
