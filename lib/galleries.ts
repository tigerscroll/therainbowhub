import adultOnlyEvents from "@/data/galleries/adult-only-events.json";
import adultOnlyBeaches from "@/data/galleries/adult-only-beaches.json";
import adultOnlyHotels from "@/data/galleries/adults-only-hotels.json";
import adultOnlyParadise from "@/data/galleries/adults-only-paradise.json";
import hospiceNurses from "@/data/galleries/hospice-nurses.json";
import nudeArt from "@/data/galleries/nude-art.json";
import perfectlyTimed from "@/data/galleries/perfectly-timed.json";
import perfectlyTimedAr from "@/data/galleries/perfectly-timed.ar.json";
import perfectlyTimedDe from "@/data/galleries/perfectly-timed.de.json";
import perfectlyTimedEs from "@/data/galleries/perfectly-timed.es.json";
import perfectlyTimedFr from "@/data/galleries/perfectly-timed.fr.json";
import perfectlyTimedIt from "@/data/galleries/perfectly-timed.it.json";
import perfectlyTimedNl from "@/data/galleries/perfectly-timed.nl.json";
import perfectlyTimedPt from "@/data/galleries/perfectly-timed.pt.json";
import wildResorts from "@/data/galleries/wild-resorts.json";
import { isSupportedLocale, type SupportedLocale } from "@/lib/localeConfig";
import type { QuizTheme } from "@/lib/quizzes";

export type GalleryItem = {
  id: string;
  image?: {
    alt: string;
    src: string;
  };
  number: number;
  title: string;
  paragraphs: string[];
};

export type GalleryManifest = {
  version: 1;
  slug: string;
  locale: SupportedLocale;
  publishedAt: string;
  metadata: {
    description: string;
    title: string;
  };
  landing: {
    adNote: string;
    cta: string;
    eyebrow: string;
    intro: string;
    presentation?: "overlay" | "page";
    title: string;
  };
  gallery: {
    cardEyebrow: string;
    cardFooter: string;
    completeCopy: string;
    completeEyebrow: string;
    completeTitle: string;
    continueLabel?: string;
    finishLabel: string;
    flow?: "article" | "gallery";
    introduction: string[];
    nextLabel: string;
    restartLabel: string;
  };
  items: GalleryItem[];
};

function isGalleryManifest(value: unknown): value is GalleryManifest {
  if (!value || typeof value !== "object") return false;
  const manifest = value as Partial<GalleryManifest>;
  return manifest.version === 1
    && typeof manifest.locale === "string"
    && isSupportedLocale(manifest.locale)
    && typeof manifest.slug === "string"
    && typeof manifest.publishedAt === "string"
    && typeof manifest.metadata?.title === "string"
    && typeof manifest.metadata.description === "string"
    && typeof manifest.landing?.title === "string"
    && typeof manifest.landing.intro === "string"
    && typeof manifest.landing.cta === "string"
    && typeof manifest.landing.adNote === "string"
    && typeof manifest.landing.eyebrow === "string"
    && (manifest.landing.presentation === undefined || manifest.landing.presentation === "overlay" || manifest.landing.presentation === "page")
    && typeof manifest.gallery?.nextLabel === "string"
    && typeof manifest.gallery.finishLabel === "string"
    && typeof manifest.gallery.cardEyebrow === "string"
    && typeof manifest.gallery.cardFooter === "string"
    && typeof manifest.gallery.completeEyebrow === "string"
    && typeof manifest.gallery.completeTitle === "string"
    && typeof manifest.gallery.completeCopy === "string"
    && typeof manifest.gallery.restartLabel === "string"
    && (manifest.gallery.continueLabel === undefined || typeof manifest.gallery.continueLabel === "string")
    && (manifest.gallery.flow === undefined || manifest.gallery.flow === "article" || manifest.gallery.flow === "gallery")
    && Array.isArray(manifest.gallery.introduction)
    && manifest.gallery.introduction.every(item => typeof item === "string")
    && Array.isArray(manifest.items)
    && manifest.items.length > 0
    && manifest.items.every((item, index) => item
      && typeof item.id === "string"
      && item.number === index + 1
      && typeof item.title === "string"
      && (item.image === undefined || (typeof item.image === "object"
        && typeof item.image.alt === "string"
        && item.image.alt.length > 0
        && typeof item.image.src === "string"
        && item.image.src.length > 0))
      && Array.isArray(item.paragraphs)
      && item.paragraphs.length > 0
      && item.paragraphs.every(paragraph => typeof paragraph === "string"));
}

const galleryManifests = [
  adultOnlyBeaches,
  adultOnlyEvents,
  adultOnlyHotels,
  adultOnlyParadise,
  hospiceNurses,
  nudeArt,
  perfectlyTimed,
  perfectlyTimedAr,
  perfectlyTimedDe,
  perfectlyTimedEs,
  perfectlyTimedFr,
  perfectlyTimedIt,
  perfectlyTimedNl,
  perfectlyTimedPt,
  wildResorts,
].map((value) => {
  if (!isGalleryManifest(value)) throw new Error("Invalid gallery manifest.");
  return value;
});

export const galleryArticleTheme: QuizTheme = {
  id: "controversial-art-gallery",
  preset: "editorial",
  layout: { landing: "split", questions: "card", results: "immersive" },
  colors: {
    page: "#1b1515",
    pageAlt: "#3a2021",
    surface: "#f1e6d1",
    surfaceRaised: "#fffaf0",
    text: "#241815",
    muted: "#75675c",
    primary: "#711f28",
    primaryText: "#fff8e8",
    border: "#a77b3e",
    correct: "#52705d",
    incorrect: "#9b3943",
  },
  typography: { heading: "serif", body: "sans" },
  shape: { cardRadius: "20px", buttonRadius: "14px" },
  effects: { shadow: "dramatic", texture: "grain" },
  header: {
    background: "linear-gradient(90deg, #1a1112, #401a20 54%, #1a1112)",
    text: "#fff5dc",
    border: "#b58a49",
    shadow: "0 8px 28px rgba(12, 7, 8, .34)",
  },
};

export function getAllGalleries(locale: SupportedLocale = "en") {
  return galleryManifests.filter(gallery => gallery.locale === locale);
}

export function getGalleryBySlug(slug: string, locale: SupportedLocale = "en") {
  return galleryManifests.find(gallery => gallery.slug === slug && gallery.locale === locale);
}

export function getGalleryLocales(slug: string) {
  return galleryManifests
    .filter(gallery => gallery.slug === slug)
    .map(gallery => gallery.locale);
}
