import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePageContent } from "@/components/HomePageContent";
import { GalleryTemplate } from "@/components/GalleryTemplate";
import { QuizTemplate } from "@/components/QuizTemplate";
import { SiteShell } from "@/components/SiteShell";
import { getTopLevelContentRoutes } from "@/lib/contentCatalogue";
import { getDefaultLocale, getTranslations, isSupportedLocale } from "@/lib/i18n";
import { galleryArticleTheme, getGalleryBySlug, getGalleryLocales } from "@/lib/galleries";
import { getQuizBySlug } from "@/lib/quizzes";
import { buildMetadata, galleryAlternates, getGalleryPath, getHomePath, getQuizPath, localizedHomeAlternates, quizAlternates } from "@/lib/seo";

type SegmentPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTopLevelContentRoutes().map(({ segment: locale }) => ({ locale }));
}

export async function generateMetadata({ params }: SegmentPageProps): Promise<Metadata> {
  const { locale: segment } = await params;

  if (isSupportedLocale(segment) && segment !== getDefaultLocale()) {
    const translations = getTranslations(segment);

    return {
      ...buildMetadata({
        alternates: localizedHomeAlternates(segment),
        description: translations.site.description,
        locale: segment,
        path: getHomePath(segment),
        title: `${translations.site.name} - ${translations.home.headlinePrefix} ${translations.home.headlineHighlight}`,
      }),
    };
  }

  const gallery = getGalleryBySlug(segment, getDefaultLocale());

  if (gallery) {
    return buildMetadata({
      alternates: galleryAlternates(gallery.slug),
      description: gallery.metadata.description,
      path: getGalleryPath(gallery.slug),
      title: gallery.metadata.title,
    });
  }

  const quiz = getQuizBySlug(segment, getDefaultLocale());

  if (quiz) {
    return buildMetadata({
      alternates: quizAlternates(quiz.slug),
      description: quiz.summary,
      image: quiz.thumbnailUrl ? {
        alt: quiz.title,
        height: 540,
        path: quiz.thumbnailUrl,
        width: 960,
      } : undefined,
      path: getQuizPath(getDefaultLocale(), quiz.slug),
      title: quiz.title,
    });
  }

  return {};
}

export default async function SegmentPage({ params }: SegmentPageProps) {
  const { locale: segment } = await params;

  if (isSupportedLocale(segment) && segment !== getDefaultLocale()) {
    const translations = getTranslations(segment);

    return (
      <SiteShell currentPath="/" locale={segment} translations={translations}>
        <HomePageContent locale={segment} translations={translations} />
      </SiteShell>
    );
  }

  const locale = getDefaultLocale();
  const translations = getTranslations(locale);
  const gallery = getGalleryBySlug(segment, locale);

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

  const quiz = getQuizBySlug(segment, locale);

  if (quiz) {
    return (
      <SiteShell currentPath={`/${quiz.slug}`} locale={locale} quizTheme={quiz.theme} translations={translations}>
        <QuizTemplate locale={locale} quiz={quiz} translations={translations} />
      </SiteShell>
    );
  }

  notFound();
}
