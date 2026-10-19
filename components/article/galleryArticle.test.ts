import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { getArticlePopupBootstrapScript, shouldShowArticlePopup } from "../gallery/galleryPopup.ts";

test("article popups require fbclid as a query parameter, not another attribution value or URL text", () => {
  for (const search of ["?fbclid=abc", "?utm_source=facebook&fbclid=abc", "?fbclid=", "?fbclid"])
    assert.equal(shouldShowArticlePopup(search), true, search);
  for (const search of ["", "?utm_source=facebook", "?notfbclid=abc", "?FBCLID=abc", "?redirect=%3Ffbclid%3Dabc", "?utm_campaign=fbclid"])
    assert.equal(shouldShowArticlePopup(search), false, search);
});

test("article bootstrap selects the entry synchronously and respects rewarded unlocks and unavailable storage", () => {
  for (const [search, savedUnlock, storageBlocked, expected] of [
    ["?fbclid=abc", null, false, "popup"],
    ["?fbclid=", null, false, "popup"],
    ["?fbclid=abc", "1", false, "intro"],
    ["?fbclid=abc", null, true, "popup"],
    ["", null, false, "intro"],
    ["?utm_source=facebook", null, true, "intro"],
    ["?redirect=%3Ffbclid%3Dabc", null, false, "intro"],
  ] as const) {
    let entry = "";
    runInNewContext(getArticlePopupBootstrapScript("entry-key"), {
      URLSearchParams,
      document: { currentScript: { parentElement: { setAttribute(name: string, value: string) {
        assert.equal(name, "data-gallery-entry");
        entry = value;
      } } } },
      window: { location: { search }, sessionStorage: { getItem(key: string) {
        assert.equal(key, "entry-key");
        if (storageBlocked) throw new Error("Storage blocked");
        return savedUnlock;
      } } },
    });
    assert.equal(entry, expected, `${search}, saved=${savedUnlock}, blocked=${storageBlocked}`);
  }
  assert.equal(getArticlePopupBootstrapScript("</script>").includes("</script>"), false);
});

test("nude art gallery is a complete image-free 85-story experience", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/nude-art.json", "utf8"));
  assert.equal(gallery.items.length, 85);
  assert.equal(gallery.landing.presentation, "overlay");
  assert.equal(gallery.landing.eyebrow, "");
  assert.equal(gallery.gallery.flow, "article");
  assert.equal(gallery.gallery.continueLabel, "Continue Reading");
  assert.equal(gallery.landing.cta, "Continue");
  assert.equal(gallery.landing.ctaTone, "positive");
  assert.equal(gallery.landing.intro, "");
  assert.equal(gallery.landing.popupTitle, "Adults Only: This Nude Art Caused Controversy");
  assert.equal(gallery.landing.title, "Iconic Nude Art That Sparked Controversy");
  assert.equal(gallery.metadata.title, gallery.landing.title);
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 85);
  assert.equal(JSON.stringify(gallery).includes('"image"'), false);
});

test("perfectly timed gallery preserves every supplied section in a fast image-free flow", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/perfectly-timed.json", "utf8"));
  assert.equal(gallery.slug, "perfectly-timed");
  assert.equal(gallery.items.length, 57);
  assert.equal(gallery.landing.presentation, "overlay");
  assert.equal(gallery.gallery.flow, "article");
  assert.equal(gallery.gallery.continueLabel, "Continue Reading");
  assert.equal(gallery.landing.title, "Photos That Will Make You Look Twice");
  assert.equal(gallery.metadata.title, gallery.landing.title);
  assert.equal(gallery.landing.intro, "");
  assert.equal(gallery.landing.cta, "Continue");
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 57);
  assert.equal(JSON.stringify(gallery).includes('"image"'), false);
});

test("perfectly timed popup headlines are localized separately from the article and metadata titles", () => {
  const headlines = {
    en: "Adults Only: These Photos Aren’t What They Seem",
    ar: "للبالغين فقط: هذه الصور ليست كما تبدو",
    de: "Nur für Erwachsene: Bei diesen Fotos trügt der erste Eindruck",
    es: "Solo para adultos: estas fotos no son lo que parecen",
    fr: "Réservé aux adultes : ces photos ne sont pas ce que vous croyez",
    gr: "Μόνο για ενηλίκους: Αυτές οι φωτογραφίες δεν είναι αυτό που νομίζεις",
    it: "Solo per adulti: queste foto non sono quello che sembrano",
    nl: "Alleen voor volwassenen: deze foto's zijn niet wat ze lijken",
    pt: "Só para adultos: estas fotos não são o que parecem",
  };
  for (const [locale, headline] of Object.entries(headlines)) {
    const suffix = locale === "en" ? "" : `.${locale}`;
    const gallery = JSON.parse(fs.readFileSync(`data/galleries/perfectly-timed${suffix}.json`, "utf8"));
    assert.equal(gallery.landing.popupTitle, headline, locale);
    assert.notEqual(gallery.landing.popupTitle, gallery.landing.title, locale);
    assert.equal(gallery.metadata.title, gallery.landing.title, locale);
  }
});

for (const [locale, expectedTitle, expectedCta] of [
  ["ar", "صور ستجعلك تلقي نظرة ثانية", "متابعة"],
  ["de", "Fotos, bei denen man zweimal hinschaut", "Weiter"],
  ["gr", "Φωτογραφίες που θα σε κάνουν να κοιτάξεις δεύτερη φορά", "Συνέχεια"],
  ["es", "Fotos que te harán mirar dos veces", "Continuar"],
  ["fr", "Des photos qui vous feront y regarder à deux fois", "Continuer"],
  ["it", "Foto che ti faranno guardare due volte", "Continua"],
  ["nl", "Foto's waar je twee keer naar kijkt", "Doorgaan"],
  ["pt", "Fotos que fazem olhar duas vezes", "Continuar"],
]) test(`perfectly timed ${locale} gallery matches the complete English article structure`, () => {
  const english = JSON.parse(fs.readFileSync("data/galleries/perfectly-timed.json", "utf8"));
  const localized = JSON.parse(fs.readFileSync(`data/galleries/perfectly-timed.${locale}.json`, "utf8"));
  assert.equal(localized.locale, locale);
  assert.equal(localized.landing.title, expectedTitle);
  assert.equal(localized.metadata.title, expectedTitle);
  assert.equal(localized.landing.cta, expectedCta);
  assert.equal(localized.landing.presentation, "overlay");
  assert.equal(localized.landing.intro, "");
  assert.equal(localized.gallery.flow, "article");
  assert.equal(localized.items.length, 57);
  assert.deepEqual(localized.items.map(item => item.id), english.items.map(item => item.id));
  assert.deepEqual(localized.items.map(item => item.number), english.items.map(item => item.number));
  assert.equal(localized.items.every(item => item.title.length > 0 && item.paragraphs.length === 2 && item.paragraphs.every(Boolean)), true);
  assert.notEqual(localized.landing.title, english.landing.title);
});

test("adult-only events gallery preserves all 60 supplied sections without imagery", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/adult-only-events.json", "utf8"));
  assert.equal(gallery.slug, "events");
  assert.equal(gallery.items.length, 60);
  assert.equal(gallery.landing.title, "Everything You Need To Know About Adult-Only Events");
  assert.equal(gallery.landing.cta, "Start");
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 60);
  assert.equal(JSON.stringify(gallery).includes('"image"'), false);
});

const additionalAdultTravelGalleries = [
  ["adult-only-beaches", "beaches", "All You Need To Know About Adults Only Beaches", 47],
  ["adults-only-hotels", "hotels", "Adults-Only Hotels With A Wild Side: Luxury Escapes That Might Surprise You", 53],
  ["adults-only-paradise", "paradise", "Adults-Only Paradise: Inside The All-Inclusive Escapes That Aren't For Kids", 33],
  ["wild-resorts", "wild-resorts", "Adults-Only All-Inclusive Resorts Where Things Get Wild After Dark", 53],
];

for (const [fileName, slug, title, itemCount] of additionalAdultTravelGalleries) {
  test(`${slug} preserves its complete, relevant image-free source article`, () => {
    const gallery = JSON.parse(fs.readFileSync(`data/galleries/${fileName}.json`, "utf8"));
    assert.equal(gallery.slug, slug);
    assert.equal(gallery.landing.title, title);
    assert.equal(gallery.items.length, itemCount);
    assert.equal(gallery.landing.cta, slug === "wild-resorts" ? "Continue" : "Start");
    if (slug === "wild-resorts") {
      assert.equal(gallery.landing.presentation, "overlay");
      assert.equal(gallery.landing.popupTitle, "Adults Only: The Resorts Get Wild After Dark");
      assert.equal(gallery.landing.ctaTone, "positive");
      assert.equal(gallery.landing.intro, "");
      assert.notEqual(gallery.gallery.flow, "article", "keep story-by-story navigation unchanged");
    }
    assert.match(gallery.landing.adNote, /short ad/i);
    assert.equal(new Set(gallery.items.map(item => item.id)).size, itemCount);
    assert.equal(JSON.stringify(gallery).includes('"image"'), false);
  });
}

test("nurse gallery preserves all 70 supplied stories and matching CDN images", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/hospice-nurses.json", "utf8"));
  assert.equal(gallery.slug, "nurse");
  assert.equal(gallery.landing.title, "What Nurses See Before The End");
  assert.equal(gallery.landing.presentation, "overlay");
  assert.equal(gallery.gallery.flow, "article");
  assert.equal(gallery.gallery.continueLabel, "Continue Reading");
  assert.equal(gallery.items.length, 70);
  assert.equal(gallery.landing.cta, "Start");
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 70);
  assert.equal(new Set(gallery.items.map(item => item.image.src)).size, 70);
  assert.equal(gallery.items.every(item => item.image.src.startsWith("https://jobs.therainbowhub.com/media/")), true);
  assert.equal(gallery.items.every(item => item.image.src.endsWith(".webp") && item.image.alt.length > 0), true);
});

test("gallery uses rewarded article gates and keeps interstitials out of article flow", () => {
  const source = fs.readFileSync("components/gallery/GalleryExperience.tsx", "utf8");
  assert.match(source, /useRewardedGate\(\{ attempts: 3 \}\)/);
  assert.doesNotMatch(source, /preload:\s*true/);
  assert.match(source, /mountQuizInterstitial\(siteConfig\.displayAdUnitPath\)/);
  assert.match(source, /phase !== "landing" && !articleFlow/);
  assert.match(source, /data-google-interstitial="true"/);
  assert.match(source, /data-google-interstitial="false"/);
  assert.match(source, /function continueArticle\(\)/);
  assert.match(source, /window\.sessionStorage\.setItem\(articleUnlockKey, "1"\)/);
  assert.match(source, /busyLabel=\{loadingLabel\}/);
  assert.match(source, /signalSpaNavigation\(\)/);
  assert.match(source, /item\.image/);
  assert.match(source, /gallery\.landing\.presentation === "overlay"/);
  assert.match(source, /gallery-article__overlay-scrim/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /data-google-interstitial="true"/);
  assert.match(source, /gallery-article__introduction/);
  assert.match(source, /gallery-article__article-sections/);
});
