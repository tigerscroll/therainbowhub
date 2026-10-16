import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GalleryTemplate } from "@/components/GalleryTemplate";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getTwoSegmentContentRoutes } from "@/lib/contentCatalogue";
import { galleryArticleTheme, getGalleryBySlug, getGalleryLocales } from "@/lib/galleries";
import { getDefaultLocale, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { buildMetadata, galleryAlternates, getGalleryPath, getQuizPath, localizedQuizAlternates } from "@/lib/seo";

type LocalizedQuizPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTwoSegmentContentRoutes().map(({ first: locale, second: slug }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: LocalizedQuizPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale) || locale === getDefaultLocale()) return {};
  const gallery = getGalleryBySlug(slug, locale);
  if (gallery) {
    return buildMetadata({
      alternates: galleryAlternates(gallery.slug, locale),
      description: gallery.metadata.description,
      locale,
      path: getGalleryPath(gallery.slug, locale),
      title: gallery.metadata.title,
    });
  }
  const quiz = getQuizBySlug(slug, locale);
  if (!quiz) return {};

  return buildMetadata({
    alternates: localizedQuizAlternates(locale, quiz.slug),
    description: quiz.summary,
    image: quiz.thumbnailUrl ? {
      alt: quiz.title,
      height: 540,
      path: quiz.thumbnailUrl,
      width: 960,
    } : undefined,
    locale,
    path: getQuizPath(locale, quiz.slug),
    title: quiz.title,
  });
}

export default async function LocalizedQuizPage({ params }: LocalizedQuizPageProps) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale) || locale === getDefaultLocale()) notFound();
  const gallery = getGalleryBySlug(slug, locale);
  const translations = getTranslations(locale);
  if (gallery) {
    const localePaths = Object.fromEntries(
      getGalleryLocales(gallery.slug).map(item => [item, getGalleryPath(gallery.slug, item)]),
    );
    return (
      <SiteShell
        availableLocales={getGalleryLocales(gallery.slug)}
        currentPath={getGalleryPath(gallery.slug, locale)}
        locale={locale}
        localePaths={localePaths}
        quizTheme={galleryArticleTheme}
        translations={translations}
      >
        <GalleryTemplate gallery={gallery} />
      </SiteShell>
    );
  }
  const quiz = getQuizBySlug(slug, locale);
  if (!quiz) notFound();

  return (
    <SiteShell currentPath={getQuizPath(locale, quiz.slug)} locale={locale} quizTheme={quiz.theme} translations={translations}>
      <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
    </SiteShell>
  );
}
