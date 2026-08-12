import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InfoPageContent,
  getInfoPageMetadata,
  infoPageSlugs,
  isInfoPageSlug,
} from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getSupportedLocales, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { buildMetadata, getInfoPath, infoAlternates } from "@/lib/seo";

type LocaleInfoPageProps = {
  params: Promise<{
    locale: string;
    page: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getSupportedLocales()
    .filter((locale) => locale !== getDefaultLocale())
    .flatMap((locale) => infoPageSlugs.map((page) => ({ locale, page })));
}

export async function generateMetadata({ params }: LocaleInfoPageProps): Promise<Metadata> {
  const { locale, page } = await params;

  if (!isSupportedLocale(locale) || locale === getDefaultLocale() || !isInfoPageSlug(page)) {
    return {};
  }

  const metadata = getInfoPageMetadata(locale, page);

  return buildMetadata({
    alternates: infoAlternates(locale, page),
    description: metadata.description,
    locale,
    path: getInfoPath(locale, page),
    title: `${metadata.title} - The Rainbow Hub`,
  });
}

export default async function LocaleInfoPage({ params }: LocaleInfoPageProps) {
  const { locale, page } = await params;

  if (!isSupportedLocale(locale) || locale === getDefaultLocale() || !isInfoPageSlug(page)) {
    notFound();
  }

  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={`/info/${page}`} locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug={page} />
    </SiteShell>
  );
}
