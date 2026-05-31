import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  InfoPageContent,
  getInfoPageMetadata,
  infoPageSlugs,
  isInfoPageSlug,
} from "@/components/InfoPageContent";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { buildMetadata, getInfoPath, infoAlternates } from "@/lib/seo";

type InfoPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return infoPageSlugs.map((page) => ({ page }));
}

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const { page } = await params;

  if (!isInfoPageSlug(page)) {
    return {};
  }

  const locale = getDefaultLocale();
  const metadata = getInfoPageMetadata(locale, page);

  return buildMetadata({
    alternates: infoAlternates(locale, page),
    description: metadata.description,
    locale,
    path: getInfoPath(locale, page),
    title: `${metadata.title} - The Rainbow Hub`,
  });
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { page } = await params;

  if (!isInfoPageSlug(page)) {
    notFound();
  }

  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell currentPath={`/info/${page}`} locale={locale} translations={translations}>
      <InfoPageContent locale={locale} slug={page} />
    </SiteShell>
  );
}
