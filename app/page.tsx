import type { Metadata } from "next";

import { HomePageContent } from "@/components/HomePageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata, homeAlternates } from "@/lib/seo";

const locale = getDefaultLocale();
const translations = getTranslations(locale);

export const metadata: Metadata = buildMetadata({
  alternates: homeAlternates(),
  description: translations.site.description,
  locale,
  path: "/",
  title: `${translations.site.name} - ${translations.home.headlinePrefix} ${translations.home.headlineHighlight}`,
});

export default function HomePage() {
  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <HomePageContent locale={locale} translations={translations} />
    </SiteShell>
  );
}
