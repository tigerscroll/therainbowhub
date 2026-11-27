import { SiteShell } from "@/components/SiteShell";
import { SportsPhotoGallery } from "@/components/gallery/SportsPhotoGallery";
import photos from "@/data/media/perfectly-timed-photos.json";
import ar from "@/data/media/perfectly-timed-photos.ar.json";
import de from "@/data/media/perfectly-timed-photos.de.json";
import es from "@/data/media/perfectly-timed-photos.es.json";
import fr from "@/data/media/perfectly-timed-photos.fr.json";
import hi from "@/data/media/perfectly-timed-photos.hi.json";
import id from "@/data/media/perfectly-timed-photos.id.json";
import it from "@/data/media/perfectly-timed-photos.it.json";
import nl from "@/data/media/perfectly-timed-photos.nl.json";
import pt from "@/data/media/perfectly-timed-photos.pt.json";
import { getLocaleDirection, getTranslations } from "@/lib/i18n";
import { getPerfectlyTimedPhotosCopy, getPerfectlyTimedPhotosPath, perfectlyTimedPhotoLocales, perfectlyTimedPhotos, type PhotoGalleryCopy, type PhotoLocale } from "@/lib/perfectlyTimedPhotos";
import { buildMetadata, perfectlyTimedPhotosAlternates } from "@/lib/seo";

const captions: Record<PhotoLocale, Record<string, { title: string; alt: string }>> = { ar, de, es, fr, hi, id, it, nl, pt };

function localizeCredit(credit: string, copy: PhotoGalleryCopy) {
  if (credit.endsWith(" · Resized")) return credit.replace(/ · Resized$/, ` · ${copy.resized}`);
  if (credit.startsWith("Photographer unknown · ")) return credit.replace("Photographer unknown", copy.unknownPhotographer);
  const originalUploader = /^The original uploader was (.*?) at English Wikipedia\s*\.$/.exec(credit);
  return originalUploader ? copy.originalUploader.replace("{name}", originalUploader[1]) : credit;
}

export function sportsPhotoMetadata(locale: "en" | PhotoLocale) {
  const copy = getPerfectlyTimedPhotosCopy(locale);
  return buildMetadata({
    alternates: perfectlyTimedPhotosAlternates(locale),
    description: copy.description,
    locale,
    path: getPerfectlyTimedPhotosPath(locale),
    title: copy.title,
  });
}

export function SportsPhotoRoute({ locale }: { locale: "en" | PhotoLocale }) {
  const copy = getPerfectlyTimedPhotosCopy(locale);
  const localizedPhotos = locale === "en" ? photos : photos.map(photo => {
    const caption = captions[locale][photo.src.split("/").at(-1)!];
    if (!caption) throw new Error(`Missing ${locale} caption for ${photo.src}`);
    return { ...photo, ...caption, credit: localizeCredit(photo.credit, copy) };
  });

  return (
    <SiteShell
      availableLocales={[...perfectlyTimedPhotoLocales]}
      currentPath={getPerfectlyTimedPhotosPath(locale)}
      locale={locale}
      localePaths={Object.fromEntries(perfectlyTimedPhotoLocales.map(item => [item, getPerfectlyTimedPhotosPath(item)]))}
      translations={getTranslations(locale)}
    >
      <SportsPhotoGallery photos={localizedPhotos} copy={copy} source={perfectlyTimedPhotos.source} locale={locale} rtl={getLocaleDirection(locale) === "rtl"} />
    </SiteShell>
  );
}
