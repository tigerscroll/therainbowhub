import type { Metadata } from "next";

import { HomePageContent } from "@/components/HomePageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = {
  title: {
    absolute: `${translations.site.name} - ${translations.home.headlinePrefix} ${translations.home.headlineHighlight}`,
  },
  description: translations.site.description,
};

export default function HomePage() {
  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <HomePageContent locale={locale} translations={translations} />
    </SiteShell>
  );
}
