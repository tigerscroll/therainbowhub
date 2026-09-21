import assert from "node:assert/strict";
import test from "node:test";
import { mountDisplayAd } from "./rewardedAds.ts";

test("display requests allow only rectangles up to 336x280 and disable slot expansion", () => {
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
  assert.deepEqual(configs, [{ adExpansion: { enabled: false } }]);
  assert.ok(mappings.flat().every(([w, h]) => w <= 336 && h <= 280));
  assert.equal(displays, 1);
  ad.destroy();
  mountDisplayAd({ adUnitPath: "/22677279144/display", elementId: "invalid", sizes: [[300, 600]] });
  assert.equal(displays, 1, "no request when all supplied sizes are invalid");
});
