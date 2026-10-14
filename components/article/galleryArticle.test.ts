import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("nude art gallery is a complete image-free 85-story experience", () => {
  const gallery = JSON.parse(fs.readFileSync("data/galleries/nude-art.json", "utf8"));
  assert.equal(gallery.items.length, 85);
  assert.equal(gallery.landing.cta, "Start");
  assert.match(gallery.landing.adNote, /short ad/i);
  assert.match(gallery.disclaimer, /no nude imagery/i);
  assert.equal(new Set(gallery.items.map(item => item.id)).size, 85);
  assert.equal(JSON.stringify(gallery).includes('"image"'), false);
});

test("gallery uses rewarded entry and interstitial-eligible story navigation", () => {
  const source = fs.readFileSync("components/gallery/GalleryExperience.tsx", "utf8");
  assert.match(source, /useRewardedGate\(\{ attempts: 3, preload: true \}\)/);
  assert.match(source, /mountQuizInterstitial\(siteConfig\.displayAdUnitPath\)/);
  assert.match(source, /data-google-interstitial="true"/);
  assert.match(source, /signalSpaNavigation\(\)/);
});
