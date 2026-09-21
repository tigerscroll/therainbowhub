import assert from "node:assert/strict";
import test from "node:test";
import { getDisplayAdSizes, mountDisplayAd } from "./rewardedAds.ts";

test("display requests use only 336x280 and 300x250 with Google expansion enabled", () => {
  const definitions: number[][][] = [];
  const mappings: number[][][] = [];
  const configs: unknown[] = [];
  let displays = 0;
  const slot = {
    addService() { return this; },
    setConfig(config: unknown) { configs.push(config); },
    defineSizeMapping() { return this; },
  };
  const mapping = {
    addSize(_viewport: number[], sizes: number[][]) { mappings.push(sizes); return this; },
    build() { return mappings; },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { googletag: {
    cmd: { push(fn: () => void) { fn(); } },
    defineSlot(_path: string, sizes: number[][]) { definitions.push(sizes); return slot; },
    sizeMapping() { return mapping; },
    pubads() { return { addEventListener() {}, removeEventListener() {} }; },
    display() { displays++; }, enableServices() {}, destroySlots() {},
  } } });
  const ad = mountDisplayAd({ adUnitPath: "/22677279144/display", elementId: "test", sizes: [
    [970, 250], [728, 90], [300, 600], [336, 280], [300, 250],
  ] });
  assert.deepEqual(definitions, [[[336, 280], [300, 250]]]);
  assert.deepEqual(configs, [{ adExpansion: { enabled: true } }]);
  assert.ok(mappings.flat().every(([, h]) => h <= 280));
  assert.equal(displays, 1);
  ad.destroy();
  mountDisplayAd({ adUnitPath: "/22677279144/display", elementId: "invalid", sizes: [[300, 600]] });
  assert.equal(displays, 1, "no request when all supplied sizes are invalid");
});

test("base display sizes fit the placement before Google-managed expansion", () => {
  for (const width of [280, 316, 390, 600, 896, 1024]) {
    const sizes = getDisplayAdSizes(width);
    assert.ok(sizes.every(([w, h]) => w <= width && h <= 280));
  }
  assert.deepEqual(getDisplayAdSizes(280), []);
  assert.deepEqual(getDisplayAdSizes(316), [[300, 250]]);
  assert.deepEqual(getDisplayAdSizes(896), [[336, 280], [300, 250]]);
  assert.deepEqual(getDisplayAdSizes(1024), [[336, 280], [300, 250]]);
});
