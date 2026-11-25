import { SiteShell } from "@/components/SiteShell";
import { SportsPhotoGallery } from "@/components/gallery/SportsPhotoGallery";
import photos from "@/data/media/perfectly-timed-photos.json";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { perfectlyTimedPhotos as content } from "@/lib/perfectlyTimedPhotos";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  alternates: { canonical: absoluteUrl(content.path) },
  description: content.description,
  path: content.path,
  title: content.title,
});

export default function PerfectlyTimedPhotosPage() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);

  return (
    <SiteShell availableLocales={[locale]} currentPath={content.path} locale={locale} translations={translations}>
      <SportsPhotoGallery photos={photos} content={content} />
    </SiteShell>
  );
}
