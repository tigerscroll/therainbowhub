import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const locales = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8")).activeLocales as string[];

test("every quiz locale has the reviewed shared Start label", () => {
  assert.equal(locales.length, 30);
  for (const locale of locales) {
    const translations = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, "utf8"));
    const memory = JSON.parse(fs.readFileSync(`data/quizzes/memory/${locale}.json`, "utf8"));
    assert.equal(translations.quiz.start, memory.landing.cta, locale);
    assert.equal(typeof translations.quiz.start, "string", locale);
    assert.ok(translations.quiz.start.trim(), locale);
    assert.equal("startTest" in translations.quiz, false, locale);
  }
});
