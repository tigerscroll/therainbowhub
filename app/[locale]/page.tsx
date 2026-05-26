import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePageContent } from "@/components/HomePageContent";
import { SiteShell } from "@/components/SiteShell";
import { getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";

type LocaleHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return getSupportedLocales()
    .filter((locale) => locale !== "en")
    .map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleHomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale) || locale === "en") {
    return {};
  }

  const translations = getTranslations(locale);

  return {
    title: {
      absolute: `${translations.site.name} - ${translations.home.headlinePrefix} ${translations.home.headlineHighlight}`,
    },
    description: translations.site.description,
  };
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale) || locale === "en") {
    notFound();
  }

  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <HomePageContent locale={locale} translations={translations} />
    </SiteShell>
  );
}
