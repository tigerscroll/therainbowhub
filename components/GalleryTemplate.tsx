import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import type { GalleryManifest } from "@/lib/galleries";
import { galleryArticleTheme } from "@/lib/galleries";
import { SHARED_SHELL_CSS_HREF } from "@/lib/quizzes";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export function GalleryTemplate({ gallery }: { gallery: GalleryManifest }) {
  const path = `/${gallery.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: gallery.metadata.title,
    description: gallery.metadata.description,
    inLanguage: gallery.locale,
    datePublished: gallery.publishedAt,
    url: absoluteUrl(path),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <style dangerouslySetInnerHTML={{ __html: `html,body{background:${galleryArticleTheme.colors.page}}` }} />
      <ExperienceThemeBoundary shellCssHref={SHARED_SHELL_CSS_HREF} theme={galleryArticleTheme}>
        <div className="gallery-article quiz-engine__flow-container">
          <GalleryExperience gallery={gallery} path={path} />
        </div>
      </ExperienceThemeBoundary>
    </>
  );
}
