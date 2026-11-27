import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const base = new URL(process.env.CAMPAIGN_GUIDE_TEST_URL ?? "http://localhost:3217");
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local build only");
const readGallery = filename => JSON.parse(readFileSync(new URL(`../data/galleries/${filename}.json`, import.meta.url), "utf8"));
const readCopy = slug => JSON.parse(readFileSync(new URL(`../data/${slug}-campaign-copy.json`, import.meta.url), "utf8"));
const beachEditions = readCopy("beaches");
const campaignGalleryLocales = ["ar", "de", "es", "fr", "hi", "id", "it", "nl", "pt"];

function localizedCampaignGalleryCases(slug, filename, editions) {
  const english = readGallery(filename);
  assert.deepEqual(Object.keys(editions).sort(), campaignGalleryLocales);
  const localeAlternates = [`/${slug}`, ...campaignGalleryLocales.map(locale => `/${locale}/${slug}`)].sort();

  return Object.entries(editions).map(([locale, copy]) => {
    const article = readGallery(`${filename}.${locale}`);
    assert.equal(article.locale, locale);
    assert.equal(article.slug, english.slug);
    assert.deepEqual(article.items.map(item => [item.id, item.number]), english.items.map(item => [item.id, item.number]));
    for (const [index, item] of article.items.entries()) {
      assert(item.title.trim() && item.title !== english.items[index].title, `${locale}/${slug}: untranslated heading ${item.id}`);
      assert(item.paragraphs.length > 0 && item.paragraphs.every(text => text.trim() && !english.items[index].paragraphs.includes(text)),
        `${locale}/${slug}: empty or untranslated body ${item.id}`);
    }
    return {
      path: `/${locale}/${slug}`,
      locale,
      localeAlternates,
      popup: copy.popupTitle,
      continueLabel: copy.continueLabel,
      labels: beachEditions[locale].labels,
      teaser: copy.campaignIntro,
      actionColor: "rgb(162, 29, 44)",
      section: article.items[0].title,
      sectionCount: english.items.length + 1,
    };
  });
}
const defaultLabels = {
  start: "CONTINUE", startLoading: "LOADING...", loading: "Loading...", startNote: "Watch a short ad to continue",
  readNote: "Watch one short ad to read the rest.", unavailable: "No ad is available right now.",
  readWithoutAd: "Read without an ad", reopen: "Open Guide Popup", fullGuide: "Full guide",
};
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const guides = [
  {
    path: "/dental",
    popup: "Need Dental Work?",
    teaser: "That dental quote might not be your only option.",
    section: "2. Call a community clinic or dental school",
    source: "Canada: Canadian Dental Care Plan",
    notice: "Need urgent care?",
    screenshot: process.env.DENTAL_SCREENSHOT,
  },
  {
    path: "/mobility",
    popup: "Want A Mobility Scooter?",
    teaser: "Before you pay for a mobility scooter, check who might cover it.",
    section: "2. Ask about an assessment before buying",
    source: "United States: Medicare wheelchair and scooter coverage",
    screenshot: process.env.MOBILITY_SCREENSHOT,
  },
  {
    path: "/retired",
    popup: "Retired? Looking For A Job?",
    teaser: "You don’t have to go back to full-time work to earn again.",
    section: "2. Look for real openings",
    source: "United States: USAGov job search resources",
    screenshot: process.env.RETIRED_SCREENSHOT,
  },
  {
    path: "/retreats",
    popup: "Business Retreats Adults Only",
    teaser: "An adults-only venue can look perfect online and still be wrong for your team.",
    actionColor: "rgb(162, 29, 44)",
    section: "2. Make sure the venue fits the group",
    screenshot: process.env.RETREATS_SCREENSHOT,
  },
  {
    path: "/beaches",
    popup: "Adults Only Beaches",
    teaser: "An adults-only resort doesn’t always mean the beach is adults-only.",
    actionColor: "rgb(162, 29, 44)",
    section: "What Exactly Is An Adults-Only Beach?",
    sectionCount: 48,
    screenshot: process.env.BEACHES_SCREENSHOT,
  },
  {
    path: "/resorts",
    popup: "Adults Only Resorts",
    teaser: "Two adults-only resorts can look identical online.",
    actionColor: "rgb(162, 29, 44)",
    section: "2. Look past the pool photos",
    sectionCount: 4,
    screenshot: process.env.RESORTS_SCREENSHOT,
  },
  {
    path: "/jobs",
    popup: "Jobs Available Now",
    teaser: "A job marked ‘urgent’ can still be a dead end.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Start with live listings near you",
    sectionCount: 8,
    source: "United States: USAGov job search resources",
    screenshot: process.env.JOBS_SCREENSHOT,
  },
  {
    path: "/paradise",
    popup: "Adults Only Paradise",
    continueLabel: "See What Happens After Dark",
    teaser: "The pool may look peaceful by day, but some adults-only escapes change completely after sunset.",
    actionColor: "rgb(162, 29, 44)",
    section: "What Makes Adults-Only Resorts So Different?",
    sectionCount: 34,
    screenshot: process.env.PARADISE_SCREENSHOT,
  },
  {
    path: "/makemoney",
    popup: "Ready To Make Money?",
    continueLabel: "See Which Options Are Worth It",
    teaser: "Two online gigs can pay the same on paper.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Compare take-home pay, not the headline number",
    sectionCount: 8,
    source: "FTC guide to spotting task scams",
    screenshot: process.env.MAKE_MONEY_SCREENSHOT,
  },
  {
    path: "/governmenthelp",
    popup: "Government Help Options",
    continueLabel: "See What Help You Might Be Missing",
    teaser: "The help you’re looking for might not be called a grant.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Start with an official benefits finder",
    sectionCount: 8,
    source: "United States: USAGov Benefit Finder",
    screenshot: process.env.GOVERNMENT_HELP_SCREENSHOT,
  },
  {
    path: "/fullyfunded",
    popup: "Fully Funded Opportunities",
    continueLabel: "See What Can Be Fully Funded",
    teaser: "A mobility scooter is only one thing worth checking.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Mobility scooters, wheelchairs and walking aids",
    sectionCount: 8,
    source: "DVA electric mobility aid rules",
    screenshot: process.env.FULLY_FUNDED_SCREENSHOT,
  },
  {
    path: "/events",
    popup: "Adults Only Events",
    teaser: "The invitation tells you where to go, but not always what to expect.",
    actionColor: "rgb(162, 29, 44)",
    section: "What Really Happens At Adult-Only Events?",
    sectionCount: 61,
    screenshot: process.env.EVENTS_SCREENSHOT,
  },
  {
    path: "/prostate",
    popup: "Prostate Cancer Hidden Signs",
    continueLabel: "See Hidden Signs",
    teaser: "The surprising part is how little symptoms alone can tell you.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Early prostate cancer often has no symptoms",
    sectionCount: 7,
    source: "CDC’s prostate cancer symptoms guide",
    screenshot: process.env.PROSTATE_SCREENSHOT,
  },
  {
    path: "/tv",
    popup: "Unforgettable Forecast Slip-Ups",
    continueLabel: "See What Went Wrong",
    teaser: "One weather map showed impossible heat.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. The Arizona heat map that went off the scale",
    sectionCount: 5,
    source: "FOX 9: the original graphics glitch",
    screenshot: process.env.TV_SCREENSHOT,
  },
  {
    path: "/dating",
    popup: "Adults Only Dating",
    continueLabel: "See What to Check Before You Meet",
    teaser: "A great chat doesn’t always mean a great first date.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Pick a way to meet that suits you",
    sectionCount: 6,
    source: "FTC guide to romance scams",
  },
  {
    path: "/escapes",
    popup: "Adults Only Escapes",
    continueLabel: "See What the Photos Leave Out",
    teaser: "That pool looks deserted. That terrace looks private.",
    actionColor: "rgb(162, 29, 44)",
    section: "1. Ask for the room map",
    sectionCount: 7,
  },
  ...localizedCampaignGalleryCases("beaches", "adult-only-beaches", beachEditions),
  ...localizedCampaignGalleryCases("paradise", "adults-only-paradise", readCopy("paradise")),
];
const cases = [[320, "utm_source"], [390, "utm_campaign"], [1200, "utm_medium"], [390, "ref"], [390, ""]];

try {
  const selected = process.env.CAMPAIGN_GUIDE_TEST_PATH
    ? guides.filter(guide => guide.path.endsWith(process.env.CAMPAIGN_GUIDE_TEST_PATH))
    : guides;
  assert(selected.length > 0, "No campaign pages selected");
  for (const [guide, width, key] of selected.flatMap(guide => cases.map(([width, key]) => [guide, width, key]))) {
    const campaign = key.startsWith("utm_");
    const labels = guide.labels ?? defaultLabels;
    const context = await browser.newContext({ viewport: { width, height: 760 } });
    let releaseHydration;
    const hydration = new Promise(resolve => { releaseHydration = resolve; });
    await context.route("**/*", async route => {
      const target = new URL(route.request().url());
      if (target.origin !== base.origin) return route.abort();
      if (target.pathname.startsWith("/_next/static/") && route.request().resourceType() === "script") await hydration;
      return route.continue();
    });
    await context.addInitScript(() => {
      const listeners = new Map();
      const state = { requests: 0, slot: null, noFill: false };
      window.guideTest = state;
      const emit = (event, slot, extra = {}) => listeners.get(event)?.({ slot, ...extra });
      const service = { addEventListener: (name, fn) => listeners.set(name, fn) };
      window.googletag = {
        cmd: { push: fn => fn() },
        pubads: () => service,
        enums: { OutOfPageFormat: { REWARDED: "rewarded" } },
        defineOutOfPageSlot() { state.requests += 1; return { addService() {} }; },
        display(slot) {
          queueMicrotask(() => {
            if (state.noFill) emit("slotRenderEnded", slot, { isEmpty: true });
            else emit("rewardedSlotReady", slot, { makeRewardedVisible() { state.slot = slot; return true; } });
          });
        },
      };
      state.close = (granted) => {
        if (granted) emit("rewardedSlotGranted", state.slot);
        emit("rewardedSlotClosed", state.slot);
        state.slot = null;
      };
    });

    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const dialog = page.getByRole("dialog", { name: guide.popup });
    const cta = dialog.getByRole("button", { name: labels.start, exact: true });
    const seeMore = page.getByRole("button", { name: guide.continueLabel ?? "See more", exact: true });
    const teaser = page.getByText(guide.teaser);
    const section = page.getByRole("heading", { name: guide.section });
    const prerendered = page.locator("[data-campaign-guide-preview]");
    const requests = () => page.evaluate(() => window.guideTest.requests);
    const waitAd = () => page.waitForFunction(() => Boolean(window.guideTest.slot));

    try {
      const url = new URL(guide.path, base);
      if (key) url.searchParams.set(key, "test");
      assert.equal((await page.goto(url.href, { waitUntil: "commit" })).status(), 200);
      await prerendered.waitFor({ state: "attached" });
      if (guide.locale) {
        assert.equal(await page.locator("html").getAttribute("lang"), guide.locale);
        assert.equal(await page.locator("html").getAttribute("dir"), guide.locale === "ar" ? "rtl" : "ltr");
        assert.equal(new URL(await page.locator('link[rel="canonical"]').getAttribute("href")).pathname, guide.path);
        const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll(links => links.map(link => new URL(link.href).pathname));
        assert.deepEqual([...new Set(alternates)].sort(), guide.localeAlternates);
      }
      if (campaign) {
        await cta.waitFor();
        await page.waitForFunction(() => performance.getEntriesByName("first-contentful-paint").length > 0);
        assert.equal(await page.locator("html").getAttribute("data-campaign-guide-boot"), "");
        assert.equal(await section.isVisible(), false);
      } else {
        assert.equal(await prerendered.isVisible(), false);
        await section.waitFor();
      }
      assert.equal(await requests(), 0);
    } finally {
      releaseHydration();
    }

    await prerendered.waitFor({ state: "detached" });
    if (campaign) {
      await cta.waitFor();
      assert.equal(await page.locator(".hub-header").isVisible(), false);
      assert.equal(await section.isVisible(), false);
      assert.equal(await requests(), 0, "no ad request until opt-in");
      assert.equal((await cta.boundingBox()).height, Math.min(112, Math.max(72, width * .25)));
      const pulse = await cta.locator("span").evaluate(el => [getComputedStyle(el).animationDuration, getComputedStyle(el).animationIterationCount]);
      assert.deepEqual(pulse, ["1s", "infinite"]);
      const note = dialog.getByText(labels.startNote, { exact: true });
      assert(await note.evaluate(el => window.innerHeight - el.getBoundingClientRect().bottom < 80), "disclosure sits at the bottom");
      assert.equal(await dialog.getByRole("button").count(), 1, "the default popup has no close button or secondary CTA");
      assert.equal(await dialog.getByRole("link").count(), 0, "the default popup only shows the single CTA and ad note");
      if (width === 390) {
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await cta.locator("span").evaluate(el => getComputedStyle(el).animationName), "none");
        assert.equal(await cta.locator("span").evaluate(el => getComputedStyle(el).backgroundColor), guide.actionColor ?? "rgb(24, 114, 67)");
        if (guide.screenshot) await page.screenshot({ path: guide.screenshot });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await dialog.press("Escape");
        if (guide.notice) await page.getByText(guide.notice, { exact: true }).waitFor();
        assert.equal(await section.isVisible(), false);
        assert.equal(await seeMore.count(), 0, "the second gate isn't offered before the intro is unlocked");
        assert.equal(await requests(), 0);
        await page.getByRole("button", { name: labels.reopen }).click();
      }

      if (width === 1200) {
        await page.evaluate(() => { window.guideTest.noFill = true; });
        await cta.click();
        await dialog.getByText(labels.unavailable).waitFor();
        assert.equal(await section.isVisible(), false);
        await dialog.getByRole("button", { name: labels.readWithoutAd }).click();
        assert.equal(await requests(), 1);
      } else {
        await cta.click();
        await waitAd();
        const loading = dialog.getByRole("button", { name: labels.startLoading, exact: true });
        assert.equal(await loading.locator("span").evaluate(el => getComputedStyle(el).animationName), "none");
        assert(await loading.locator("span").evaluate(el => el.scrollWidth <= el.clientWidth), "popup loading copy must fit");
        await page.evaluate(() => window.guideTest.close(false));
        await cta.waitFor();
        assert.equal(await section.isVisible(), false, "closing without a reward must not unlock the guide");
        assert.equal(await seeMore.count(), 0);
        await cta.click();
        await waitAd();
        await page.evaluate(() => window.guideTest.close(true));
        assert.equal(await requests(), 2);
      }

      await teaser.waitFor();
      await seeMore.waitFor();
      assert(await seeMore.evaluate(el => el.scrollWidth <= el.clientWidth), "article CTA copy must fit");
      await page.getByText(labels.readNote, { exact: true }).waitFor();
      assert.equal(await dialog.count(), 0);
      assert.equal(await section.isVisible(), false, "the first gate only opens the intro");
      const firstStageRequests = await requests();
      assert.equal(firstStageRequests, width === 1200 ? 1 : 2, "no second ad is requested until the article button is clicked");
      await seeMore.click();

      if (width === 1200) {
        await page.getByRole("status").getByText(labels.unavailable).waitFor();
        assert.equal(await section.isVisible(), false);
        await page.getByRole("button", { name: labels.readWithoutAd }).click();
        assert.equal(await requests(), firstStageRequests + 1);
      } else {
        await waitAd();
        await page.getByRole("button", { name: labels.loading, exact: true }).waitFor();
        assert.equal(await section.isVisible(), false);
        await page.evaluate(() => window.guideTest.close(false));
        await seeMore.waitFor();
        assert.equal(await section.isVisible(), false, "closing the second ad early must not open the full article");
        await seeMore.click();
        await waitAd();
        await page.evaluate(() => window.guideTest.close(true));
        assert.equal(await requests(), firstStageRequests + 2);
      }
    } else {
      assert.equal(await teaser.count(), 0);
      assert.equal(await requests(), 0);
    }
    await section.waitFor();
    assert.equal(await dialog.count(), 0);
    assert.equal(await seeMore.count(), 0);
    assert.equal(await page.locator("h1").count(), 1);
    if (guide.sectionCount) assert.equal(await page.getByRole("region", { name: labels.fullGuide }).locator("section").count(), guide.sectionCount);
    if (guide.source) await page.getByRole("link", { name: guide.source }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(`${guide.path} ${width}px ${key || "direct"}: passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
