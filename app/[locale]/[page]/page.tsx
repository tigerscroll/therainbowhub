import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InfoPageContent,
  getInfoPageMetadata,
  infoPageSlugs,
  isInfoPageSlug,
} from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import {
  getSupportedLocales,
  getTranslations,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n";

type LocalizedInfoPageProps = {
  params: Promise<{
    locale: string;
    page: string;
  }>;
};

export function generateStaticParams() {
  return getSupportedLocales()
    .filter((locale) => locale !== "en")
    .flatMap((locale) => infoPageSlugs.map((page) => ({ locale, page })));
}

export async function generateMetadata({ params }: LocalizedInfoPageProps): Promise<Metadata> {
  const { locale, page } = await params;

  if (!isSupportedLocale(locale) || locale === "en" || !isInfoPageSlug(page)) {
    return {};
  }

  return getInfoPageMetadata(locale, page);
}

export default async function LocalizedInfoPage({ params }: LocalizedInfoPageProps) {
  const { locale, page } = await params;

  if (!isSupportedLocale(locale) || locale === "en" || !isInfoPageSlug(page)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const translations = getTranslations(safeLocale);

  return (
    <SiteShell currentPath={`/${page}`} locale={safeLocale} translations={translations}>
      <InfoPageContent locale={safeLocale} slug={page} />
    </SiteShell>
  );
}
