import beachCampaigns from "@/data/beaches-campaign-copy.json";
import localizedCopy from "@/data/media/perfectly-timed-photos-ui.json";

export const perfectlyTimedPhotos = {
  slug: "perfectly-timed-photos",
  path: "/perfectly-timed-photos",
  title: "The Timing Of This Was Just Perfect",
  popupTitle: "Perfectly Timed Photos",
  description: "Funny moments in women’s sports, captured at just the right time.",
  source: "https://jobs.therainbowhub.com/perfectly-timed",
  publishedAt: "2026-11-25",
} as const;

const englishCopy = {
  title: perfectlyTimedPhotos.title,
  popupTitle: perfectlyTimedPhotos.popupTitle,
  description: perfectlyTimedPhotos.description,
  galleryLabel: "Sports photo gallery",
  navigationLabel: "Photo navigation",
  originalPhoto: "Original photo",
  position: "Photo {number} of {total}",
  previousPhoto: "Previous photo",
  nextPhoto: "Next photo",
  nextAd: "Watch a short ad to see the next photo.",
  loadingPhotos: "Loading photos…",
  photoCount: "{total} perfectly timed sports photos",
  reopen: "Open Gallery Popup",
  adError: "No ad is available right now. Please try again shortly.",
  photoError: "This photo couldn’t load. Try the next one or open the original below.",
  popupAdNote: "Watch one short ad to open the gallery.",
  viewWithoutAd: "View without an ad",
  enableJavascript: "Enable JavaScript to browse, or",
  originalGallery: "view the original gallery",
  resized: "Resized",
  unknownPhotographer: "Photographer unknown",
  originalUploader: "The original uploader was {name} at English Wikipedia .",
};

export type PhotoLocale = keyof typeof localizedCopy;
export type PhotoGalleryCopy = Record<keyof typeof englishCopy | "loading" | "popupStart" | "popupLoading" | "popupUnavailable", string>;

export const perfectlyTimedPhotoLocales = ["en", ...Object.keys(localizedCopy) as PhotoLocale[]] as const;

export function isPhotoLocale(locale: string): locale is PhotoLocale {
  return Object.hasOwn(localizedCopy, locale);
}

export function getPerfectlyTimedPhotosPath(locale: "en" | PhotoLocale) {
  return locale === "en" ? perfectlyTimedPhotos.path : `/${locale}${perfectlyTimedPhotos.path}`;
}

export function getPerfectlyTimedPhotosCopy(locale: "en" | PhotoLocale): PhotoGalleryCopy {
  if (locale === "en") return {
    ...englishCopy,
    loading: "Loading…",
    popupStart: "CONTINUE",
    popupLoading: "LOADING...",
    popupUnavailable: "No ad is available right now.",
  };
  const labels = beachCampaigns[locale].labels;
  return {
    ...localizedCopy[locale],
    loading: labels.loading,
    popupStart: labels.start,
    popupLoading: labels.startLoading,
    popupUnavailable: labels.unavailable,
  };
}
