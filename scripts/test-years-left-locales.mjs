import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright-core";
import { localeLanguageTag } from "../lib/localePath.ts";

const base = new URL(process.env.QUIZ_TEST_URL ?? "http://127.0.0.1:3252");
assert(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Run against a local export");
const slug = process.env.QUIZ_TEST_SLUG ?? "years-left";
assert(["years-left", "memory"].includes(slug));
const read = (file) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${file}.json`, "utf8"));
const { activeLocales } = read("quiz");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 780 }, reducedMotion: "reduce" });
  await context.route("**/*", route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const locale of activeLocales) {
    const path = locale === "en" ? `/${slug}` : `/${locale}/${slug}`;
    const copy = read(locale);
    const lang = localeLanguageTag(locale);
    const direction = ["ar", "fa", "he", "ur"].includes(locale) ? "rtl" : "ltr";
    const errors = [];
    const onError = error => errors.push(error.message);
    page.on("pageerror", onError);
    try {
      assert.equal((await page.goto(new URL(path, base).href)).status(), 200, path);
      const landing = page.locator(".quiz-engine__landing");
      const button = landing.locator(".quiz-engine__primary");
      assert.equal(await page.locator("html").getAttribute("lang"), lang, path);
      assert.equal(await page.locator("html").getAttribute("dir"), direction, path);
      assert.equal((await landing.locator("h1").innerText()).trim(), copy.title, path);
      assert.equal((await button.innerText()).replace(/[→←]/g, "").trim(), copy.landing.cta, path);
      assert.equal(await landing.locator(".quiz-engine__quick-start").count(), 0, path);
      const layout = await landing.evaluate(card => {
        const frame = card.getBoundingClientRect();
        const group = card.querySelector(".quiz-engine__landing-copy").getBoundingClientRect();
        const start = card.querySelector(".quiz-engine__primary").getBoundingClientRect();
        const note = card.querySelector(".quiz-engine__ad-note").getBoundingClientRect();
        const midpoint = rect => (rect.top + rect.height / 2 - frame.top) / frame.height;
        return {
          contentMidpoint: midpoint(group),
          startMidpoint: midpoint(start),
          startHeight: start.height,
          disclosureGap: note.top - start.bottom,
          disclosureAboveFold: note.bottom <= innerHeight,
        };
      });
      assert(Math.abs(layout.contentMidpoint - .45) < .01, `${path}: landing group midpoint ${layout.contentMidpoint}`);
      // Headlines and disclosures wrap differently in translated editions.
      const [min, max] = locale === "en" ? [.55, .605] : [.52, .66];
      assert(layout.startMidpoint >= min && layout.startMidpoint <= max, `${path}: Start midpoint ${layout.startMidpoint}`);
      assert.equal(layout.startHeight, 88, `${path}: Start keeps its large height`);
      assert(layout.disclosureGap >= 0 && layout.disclosureGap <= 20, `${path}: ad disclosure stays directly below Start`);
      assert(layout.disclosureAboveFold, `${path}: ad disclosure below the fold`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path}: content overflows the viewport`);
      assert.deepEqual(errors, [], path);
    } finally {
      page.off("pageerror", onError);
    }
  }
  console.log(`${activeLocales.length} /${slug} landing editions passed mobile checks.`);
} finally {
  await browser.close();
}
