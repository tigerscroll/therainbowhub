import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright-core";
import { localeLanguageTag } from "../lib/localePath.ts";

const base = new URL(process.env.QUIZ_TEST_URL ?? "http://127.0.0.1:3252");
assert(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "Run against a local export");
const read = (file) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${file}.json`, "utf8"));
const { activeLocales } = read("quiz");
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 780 }, reducedMotion: "reduce" });
  await context.route("**/*", route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const locale of activeLocales) {
    const path = locale === "en" ? "/years-left" : `/${locale}/years-left`;
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
      assert(await button.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), `${path}: CTA below the fold`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path}: content overflows the viewport`);
      assert.deepEqual(errors, [], path);
    } finally {
      page.off("pageerror", onError);
    }
  }
  console.log(`${activeLocales.length} Years Left landing editions passed mobile checks.`);
} finally {
  await browser.close();
}
