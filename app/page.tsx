import { HomePageContent } from "@/components/HomePageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";

export default function HomePage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <HomePageContent locale={locale} translations={translations} />
    </SiteShell>
  );
}
