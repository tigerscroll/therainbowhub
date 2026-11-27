import { CampaignGuideEntry } from "@/components/article/CampaignGuideEntry";
import { GalleryTemplate } from "@/components/GalleryTemplate";
import { SiteShell } from "@/components/SiteShell";
import { campaignGalleryEntries } from "@/lib/campaignGuides";
import { galleryArticleTheme, getGalleryLocales, type GalleryManifest } from "@/lib/galleries";
import { getTranslations } from "@/lib/i18n";
import { getGalleryPath } from "@/lib/seo";

export function GalleryRoute({ gallery }: { gallery: GalleryManifest }) {
  const { locale, slug } = gallery;
  const path = getGalleryPath(slug, locale);
  const availableLocales = getGalleryLocales(slug);
  const campaign = campaignGalleryEntries.find(entry => entry.path === path);
  const localePaths = Object.fromEntries(availableLocales.map(item => [item, getGalleryPath(slug, item)]));

  return (
    <SiteShell
      availableLocales={availableLocales}
      currentPath={path}
      locale={locale}
      localePaths={localePaths}
      quizTheme={campaign ? undefined : galleryArticleTheme}
      translations={getTranslations(locale)}
    >
      {campaign ? (
        <CampaignGuideEntry
          guide={{ title: gallery.landing.title, intro: gallery.gallery.introduction.join(" "), ...campaign }}
          labels={campaign.labels}
          actionTone="red"
        >
          {gallery.items.map(item => (
            <section key={item.id}>
              <h2>{item.title}</h2>
              {item.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          ))}
          <section>
            <h2>{gallery.gallery.completeTitle}</h2>
            <p>{gallery.gallery.completeCopy}</p>
          </section>
        </CampaignGuideEntry>
      ) : <GalleryTemplate gallery={gallery} />}
    </SiteShell>
  );
}
