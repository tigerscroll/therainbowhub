import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { isArticleManifest, isArticleSection } from "./articleSchema.ts";

test("article schema accepts optional gate notes, callouts and conclusions", () => {
  assert.equal(isArticleSection({
    title: "Testing journey",
    intro: "How testing works.",
    points: [{
      title: "Interpret the result",
      paragraphs: ["Results are considered together."],
      callouts: [{ question: "Does one result diagnose cancer?", answer: "No." }],
    }],
    next: {
      adNote: "One short ad, then continue.",
      ariaLabel: "Open the next chapter after an ad",
      busyNote: "Opening sponsor message…",
      copy: "See the next section.",
      cta: "Continue",
      ctaIcon: "›",
      eyebrow: "NEXT",
      showCtaIcon: true,
      title: "What happens next?",
    },
    conclusion: {
      copy: "Doctors combine several pieces of information.",
      eyebrow: "THE MAIN POINT",
    },
  }), true);
});

test("article schema rejects malformed optional fields", () => {
  const base = {
    title: "Testing journey",
    intro: "How testing works.",
    points: [{ title: "A step", paragraphs: ["Copy."] }],
  };

  assert.equal(isArticleSection({ ...base, next: { copy: "Copy only" } }), false);
  assert.equal(isArticleSection({
    ...base,
    points: [{ ...base.points[0], callouts: [{ question: "Question", answer: 1 }] }],
  }), false);
  assert.equal(isArticleSection({ ...base, conclusion: { eyebrow: "END" } }), false);
});

test("every article locale file is a complete validated manifest", () => {
  const articleRoot = path.join(process.cwd(), "data", "articles");
  const slugs = fs.readdirSync(articleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.equal(slugs.includes("cellulite"), false);
  assert.equal(slugs.includes("diabetes-foods"), false);
  assert.equal(slugs.includes("diabetics"), true);

  for (const slug of slugs) {
    const localeFiles = fs.readdirSync(path.join(articleRoot, slug))
      .filter((filename) => filename.endsWith(".json"));
    assert.ok(localeFiles.length > 0, `${slug} needs at least one locale manifest`);

    for (const filename of localeFiles) {
      const locale = filename.slice(0, -5);
      const value: unknown = JSON.parse(fs.readFileSync(path.join(articleRoot, slug, filename), "utf8"));
      assert.equal(isArticleManifest(value), true, `${slug}/${filename} should satisfy article schema v1`);
      if (!isArticleManifest(value)) continue;
      assert.equal(value.slug, slug);
      assert.equal(value.locale, locale);
      assert.notEqual(value.landing.socialProofVisible, false, `${slug}/${locale} should show the shared social-proof unit`);
      assert.ok(value.landing.socialProofCount.trim().length > 0, `${slug}/${locale} needs social-proof copy`);
      assert.ok(value.landing.socialProofLabel.trim().length > 0, `${slug}/${locale} needs a social-proof label`);
      if (locale === "en") {
        assert.equal(value.landing.cta.adNote, "One short ad, then continue.", `${slug}/${locale} needs the shared CTA note`);
        assert.equal(value.landing.cta.showIcon, true, `${slug}/${locale} should show the shared CTA arrow`);
        assert.equal(/[→›]$/.test(value.landing.cta.label.trim()), false, `${slug}/${locale} should let the shell render its CTA arrow`);
      }
      value.sections.forEach((section, index) => {
        if (index < value.sections.length - 1) {
          assert.equal(typeof section.next?.adNote, "string", `${slug}/${locale} section ${index + 1} needs a custom ad note`);
          if (locale === "en") {
            assert.equal(section.next?.adNote, "One short ad, then continue.", `${slug}/${locale} section ${index + 1} needs the shared CTA note`);
          }
        } else {
          assert.equal(section.next, undefined, `${slug}/${locale} final section must be ungated`);
        }
      });
    }
  }
});

test("rebuilt editorial journeys contain five complete lazy chapters", () => {
  const fiveChapterSlugs = [
    "beach", "brands", "colon", "diabetics", "funeral", "historical", "hotel",
    "breastcancer", "dating", "gross", "hiv", "kidney", "mobilityscooter", "nervous", "prostate", "signs", "skincancer",
  ];
  for (const slug of fiveChapterSlugs) {
    const value: unknown = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "articles", slug, "en.json"), "utf8"));
    assert.equal(isArticleManifest(value), true);
    if (isArticleManifest(value)) assert.equal(value.sections.length, 5, `${slug} should have five chapters`);
  }
});

test("localized manifests can customize their public slug and every CTA state", () => {
  const source = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), "data", "articles", "prostate", "en.json"),
    "utf8",
  )) as Record<string, unknown>;
  const landing = source.landing as Record<string, unknown>;
  const cta = landing.cta as Record<string, unknown>;
  const sections = structuredClone(source.sections) as Array<Record<string, unknown>>;
  const next = sections[0].next as Record<string, unknown>;

  const localized = {
    ...source,
    locale: "fr",
    path: "/signes-prostate",
    routeSlug: "signes-prostate",
    landing: {
      ...landing,
      cta: { ...cta, busyLabel: "Chargement…", icon: "›", label: "Voir les signes" },
    },
    sections: [{
      ...sections[0],
      next: {
        ...next,
        ariaLabel: "Ouvrir le chapitre suivant",
        busyNote: "Chargement de la publicité…",
        cta: "Voir les risques",
        ctaIcon: "›",
        showCtaIcon: true,
      },
    }, ...sections.slice(1)],
    ui: {
      defaultGateAdNote: "Une courte publicité, puis la suite.",
      gateBusyNote: "Chargement de la publicité…",
      loadingAdLabel: "Chargement…",
      preparingArticleLabel: "Préparation de l’article…",
      restoringCopy: "Chargement du chapitre débloqué.",
      restoringTitle: "Retour à votre article…",
      sourcesLabel: "Sources",
    },
  };

  assert.equal(isArticleManifest(localized), true);
});

test("historical final chapter and funeral surprise chapter do not recycle earlier subjects", () => {
  const readArticle = (slug: string) => JSON.parse(fs.readFileSync(
    path.join(process.cwd(), "data", "articles", slug, "en.json"),
    "utf8",
  ));

  const historical = readArticle("historical");
  const earlierHistoricalImages = new Set(
    historical.sections.slice(0, 4).flatMap((section: { points: Array<{ image?: { src: string } }> }) => (
      section.points.map((point) => point.image?.src).filter(Boolean)
    )),
  );
  const finalHistoricalImages = historical.sections[4].points.map((point: { image: { src: string } }) => point.image.src);
  assert.equal(finalHistoricalImages.length, 10);
  assert.equal(new Set(finalHistoricalImages).size, 10);
  assert.equal(finalHistoricalImages.some((src: string) => earlierHistoricalImages.has(src)), false);

  const funeral = readArticle("funeral");
  const rankedSongs = new Set(funeral.sections.slice(0, 2).flatMap(
    (section: { points: Array<{ title: string }> }) => section.points.map((point) => point.title),
  ));
  const surpriseSongs = funeral.sections[2].points.map((point: { title: string }) => point.title);
  assert.equal(surpriseSongs.length, 10);
  assert.equal(new Set(surpriseSongs).size, 10);
  assert.equal(surpriseSongs.some((title: string) => rankedSongs.has(title)), false);
});
