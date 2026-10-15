import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("nude art gallery is a complete image-free 85-story experience", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/nude-art.json", "utf8"));
  assert.equal(gallery.items.length, 85);
  assert.equal(gallery.landing.cta, "Start");
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 85);
  assert.equal(JSON.stringify(gallery).includes('"image"'), false);
});

test("perfectly timed gallery preserves every supplied section in a fast image-free flow", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/perfectly-timed.json", "utf8"));
  assert.equal(gallery.slug, "perfectly-timed");
  assert.equal(gallery.items.length, 57);
  assert.equal(gallery.landing.cta, "Start");
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 57);
  assert.equal(JSON.stringify(gallery).includes('"image"'), false);
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
    assert.equal(gallery.landing.cta, "Start");
    assert.match(gallery.landing.adNote, /short ad/i);
    assert.equal(new Set(gallery.items.map(item => item.id)).size, itemCount);
    assert.equal(JSON.stringify(gallery).includes('"image"'), false);
  });
}

test("gallery uses rewarded entry and interstitial-eligible story navigation", () => {
  const source = fs.readFileSync("components/gallery/GalleryExperience.tsx", "utf8");
  assert.match(source, /useRewardedGate\(\{ attempts: 3 \}\)/);
  assert.doesNotMatch(source, /preload:\s*true/);
  assert.match(source, /mountQuizInterstitial\(siteConfig\.displayAdUnitPath\)/);
  assert.match(source, /data-google-interstitial="true"/);
  assert.match(source, /signalSpaNavigation\(\)/);
});
