import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const base = new URL(process.env.PHOTO_TEST_URL ?? "http://localhost:3198");
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local build only");
const read = filename => JSON.parse(readFileSync(new URL(`../data/${filename}.json`, import.meta.url), "utf8"));
const localizedCopy = read("media/perfectly-timed-photos-ui");
const originals = read("media/perfectly-timed-photos");
const shared = read("beaches-campaign-copy");
const locales = ["ar", "de", "es", "fr", "hi", "id", "it", "nl", "pt"];
assert.deepEqual(Object.keys(localizedCopy).sort(), locales);
const galleryPath = locale => (locale === "en" ? "" : `/${locale}`) + "/perfectly-timed-photos";
const allPaths = ["en", ...locales].map(galleryPath).sort();
const english = {
  title: "The Timing Of This Was Just Perfect", galleryLabel: "Sports photo gallery", popupTitle: "Perfectly Timed Photos",
  popupStart: "CONTINUE", popupLoading: "LOADING...", nextPhoto: "Next photo", position: "Photo {number} of {total}",
  popupAdNote: "Watch one short ad to open the gallery.", reopen: "Open Gallery Popup",
  viewWithoutAd: "View without an ad", originalPhoto: "Original photo",
  adError: "No ad is available right now. Please try again shortly.",
};
const editions = [["en", english, Object.fromEntries(originals.map(photo => [photo.src.split("/").at(-1), photo]))]];
for (const locale of locales) {
  const captions = read(`media/perfectly-timed-photos.${locale}`);
  assert.deepEqual(Object.keys(captions).sort(), originals.map(photo => photo.src.split("/").at(-1)).sort());
  for (const photo of originals) {
    const { title, alt } = captions[photo.src.split("/").at(-1)];
    assert(title.trim() && title !== photo.title, `${locale}: untranslated caption for ${photo.src}`);
    assert(alt.trim() && alt !== photo.alt, `${locale}: untranslated alt text for ${photo.src}`);
  }
  assert(localizedCopy[locale].position.includes("{number}") && localizedCopy[locale].position.includes("{total}"));
  editions.push([locale, { ...localizedCopy[locale], popupStart: shared[locale].labels.start, popupLoading: shared[locale].labels.startLoading }, captions]);
}
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const cases = [[390, ""], [320, "utm_source"], [390, "utm_campaign"], [1240, "utm_medium"]];
  for (const [locale, copy, captions, width, campaign] of editions.flatMap(edition => cases.map(variant => [...edition, ...variant]))) {
    const url = new URL(galleryPath(locale), base);
    const rtl = locale === "ar";
    const digits = new Intl.NumberFormat(locale);
    const atPhoto = index => copy.position.replace("{number}", digits.format(index)).replace("{total}", digits.format(originals.length));
    const context = await browser.newContext({ viewport: { width, height: 840 }, reducedMotion: "reduce" });
    let releaseHydration;
    const hydration = new Promise(resolve => { releaseHydration = resolve; });
    await context.route("**/*", async (route) => {
      const request = route.request();
      const target = new URL(request.url());
      if (target.origin !== base.origin) return route.abort();
      if (request.resourceType() === "script" && target.pathname.startsWith("/_next/static/")) await hydration;
      await route.continue();
    });
    await context.addInitScript(() => {
      const listeners = new Map();
      const emit = (name, slot, extra = {}) => listeners.get(name)?.({ slot, ...extra });
      const state = { requests: [], displayed: null, noFill: false };
      window.sportsTest = state;
      const service = { addEventListener: (name, listener) => listeners.set(name, listener) };
      window.googletag = {
        cmd: { push: (run) => run() },
        pubads: () => service,
        enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
        defineOutOfPageSlot(path) {
          state.requests.push(path);
          return { addService() {} };
        },
        display(slot) {
          queueMicrotask(() => {
            if (state.noFill) emit("slotRenderEnded", slot, { isEmpty: true });
            else emit("rewardedSlotReady", slot, { makeRewardedVisible() { state.displayed = slot; return true; } });
          });
        },
      };
      state.close = (granted) => {
        if (granted) emit("rewardedSlotGranted", state.displayed);
        emit("rewardedSlotClosed", state.displayed);
        state.displayed = null;
      };
    });

    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(campaign ? `${url}?${campaign}=test` : url.href, { waitUntil: "commit" });
    await page.locator("h1").waitFor({ state: "attached" });
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator("h1").textContent(), copy.title);
    assert.equal(await page.locator("html").getAttribute("lang"), locale);
    assert.equal(await page.locator("html").getAttribute("dir"), rtl ? "rtl" : "ltr");
    assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).pathname, galleryPath(locale));
    const alternatePaths = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(links => links.map(link => new URL(link.href).pathname));
    assert.deepEqual([...new Set(alternatePaths)].sort(), allPaths);
    const gallery = page.getByRole("region", { name: copy.galleryLabel });
    const overlay = page.getByRole("dialog", { name: copy.popupTitle });
    const entry = overlay.getByRole("button", { name: copy.popupStart, exact: true });
    const next = gallery.getByRole("button", { name: copy.nextPhoto, exact: true });
    const requests = () => page.evaluate(() => window.sportsTest.requests.length);
    const close = (granted) => page.evaluate(granted => window.sportsTest.close(granted), granted);
    const waitForAd = () => page.waitForFunction(() => Boolean(window.sportsTest.displayed));

    // Inspect the actual first paint while every Next client script is held.
    const prerendered = page.locator("[data-campaign-guide-preview]");
    try {
      await prerendered.waitFor({ state: "attached" });
      if (campaign) {
        await entry.waitFor();
        await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
        assert.equal(await page.locator("html").getAttribute("data-campaign-guide-boot"), "");
        assert.equal(await page.locator(".site-shell").evaluate(node => getComputedStyle(node).visibility), "hidden");
        assert.equal(await prerendered.evaluate(node => getComputedStyle(node).position), "fixed");
        assert.equal(await prerendered.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(237, 246, 240)");
        assert.equal(await gallery.getByRole("img").count(), 0);
        assert.equal(await requests(), 0, "first paint does not preload or request a rewarded ad");
      } else {
        assert.equal(await page.locator("html").getAttribute("data-campaign-guide-boot"), null);
        assert.equal(await prerendered.isVisible(), false, "direct traffic must not flash the server-rendered popup");
      }
    } finally {
      releaseHydration();
    }
    await prerendered.waitFor({ state: "detached" });
    assert.equal(await page.locator("html").getAttribute("data-campaign-guide-boot"), null);

    if (campaign) {
      await entry.waitFor();
      assert.equal(await overlay.evaluate(node => getComputedStyle(node).position), "fixed");
      assert.equal(await overlay.evaluate(node => getComputedStyle(node).backgroundColor), "rgb(237, 246, 240)");
      assert.equal(await overlay.getByRole("button").count(), 1, "only the continue button is shown");
      assert.equal(await page.locator(".hub-header").isVisible(), false);
      const note = overlay.getByText(copy.popupAdNote, { exact: true });
      await note.waitFor();
      assert(await note.evaluate(el => innerHeight - el.getBoundingClientRect().bottom < 45));
      await entry.press("Escape");
      await overlay.waitFor({ state: "hidden" });
      await gallery.getByRole("button", { name: copy.reopen }).click();
      await overlay.click({ position: { x: 2, y: 2 } });
      await overlay.getByRole("heading", { name: copy.popupTitle }).click();
      if (locale === "en" && width === 390 && process.env.PHOTO_DEMO_SCREENSHOT) {
        await page.screenshot({ path: process.env.PHOTO_DEMO_SCREENSHOT, animations: "disabled" });
      }
      assert.equal(await requests(), 0);
      assert.equal(await gallery.getByRole("img").count(), 0);
      const action = overlay.getByRole("button").locator("span");
      const continueFontSize = await action.evaluate(el => getComputedStyle(el).fontSize);
      assert.equal(await action.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(24, 114, 67)");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      assert.equal(await action.evaluate(el => getComputedStyle(el).animationDuration), "1s");
      if (width === 1240) {
        await page.evaluate(() => { window.sportsTest.noFill = true; });
        await entry.click();
        await overlay.getByRole("button", { name: copy.viewWithoutAd }).click();
        await page.evaluate(() => { window.sportsTest.noFill = false; });
        assert.equal(await requests(), 1);
      } else {
        await entry.click();
        await waitForAd();
        const loading = overlay.getByRole("button", { name: copy.popupLoading, exact: true }).locator("span");
        assert.equal(await loading.evaluate(el => getComputedStyle(el).fontSize), continueFontSize);
        assert.equal(await loading.evaluate(el => getComputedStyle(el).animationName), "none");
        assert(await loading.evaluate(el => el.scrollWidth <= el.clientWidth), "localized loading copy fits");
        await close(false);
        assert.equal(await page.locator("figure img").count(), 0, "closing early must not open the gallery");
        await entry.click();
        await waitForAd();
        assert.equal(await requests(), 2, "each Continue click requests one ad; tapping the backdrop or heading requests none");
        assert.equal(await page.locator("figure img").count(), 0, "display alone must not open the gallery");
        await close(true);
      }
    }

    await gallery.getByText(atPhoto(1), { exact: true }).waitFor();
    assert.equal(await overlay.count(), 0, "the popup closes when the gallery opens and never appears for direct traffic");
    if (!campaign) assert.equal(await requests(), 0, "direct traffic has no entry ad");
    const image = gallery.getByRole("img");
    await page.waitForFunction(() => document.querySelector("figure img")?.naturalWidth > 0);
    assert.match(await image.getAttribute("src"), /242495\.jpg$/);
    assert.equal(await image.getAttribute("alt"), captions["242495.jpg"].alt);
    await gallery.getByRole("heading", { name: captions["242495.jpg"].title, exact: true }).waitFor();
    assert.equal(await gallery.getByRole("link", { name: copy.originalPhoto }).getAttribute("href"), originals[0].source);
    await gallery.getByRole("link", { name: "CC BY-SA 2.0", exact: true }).waitFor();

    const entryCount = await requests();
    for (let index = 2; index <= 5; index++) {
      await next.click();
      await gallery.getByText(atPhoto(index), { exact: true }).waitFor();
    }
    assert.equal(await requests(), entryCount);
    await page.evaluate(() => { window.sportsTest.noFill = true; });
    await next.click();
    await gallery.getByText(copy.adError, { exact: true }).waitFor();
    await gallery.getByText(atPhoto(5), { exact: true }).waitFor();
    await page.evaluate(() => { window.sportsTest.noFill = false; });
    await next.click();
    await waitForAd();
    await close(true);
    await gallery.getByText(atPhoto(6), { exact: true }).waitFor();
    await next.press(rtl ? "ArrowRight" : "ArrowLeft");
    await gallery.getByText(atPhoto(5), { exact: true }).waitFor();
    assert.equal(await requests(), entryCount + 2);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(`${locale} ${width}px ${campaign ? "campaign" : "direct"}: title, credits, photo navigation, and reward gates passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
