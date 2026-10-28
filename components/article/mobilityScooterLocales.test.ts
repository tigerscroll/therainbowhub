import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { answerPopupQuestion, createPopupQuestionProgress, getCurrentPopupQuestion, isArticlePopupQuestions } from "../gallery/popupQuestions.ts";

const english = JSON.parse(fs.readFileSync("data/galleries/mobilityscooter.json", "utf8"));

function compare(source: unknown, translated: unknown, path = ""): void {
  assert.equal(typeof translated, typeof source, path);
  if (Array.isArray(source)) {
    assert(Array.isArray(translated), path);
    assert.equal(translated.length, source.length, path);
    source.forEach((value, index) => compare(value, translated[index], `${path}/${index}`));
  } else if (source && typeof source === "object") {
    assert(translated && typeof translated === "object", path);
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(source).sort(), path);
    for (const [key, value] of Object.entries(source)) compare(value, (translated as Record<string, unknown>)[key], `${path}/${key}`);
  } else if (typeof source === "string") {
    assert.equal(typeof translated, "string");
    const localized = translated as string;
    if (/\/(id|slug|publishedAt|flow|presentation|ctaTone)$/.test(path) || path.includes("/requiredQuestionIds/") || source.startsWith("https://") || !source) {
      assert.equal(localized, source, path);
    } else if (path !== "/locale") {
      assert(localized.trim(), path);
      // An age-range label may legitimately be language-independent.
      if (!/^[\d–\s]+$/.test(source)) assert.notEqual(localized, source, `untranslated visible copy: ${path}`);
      assert.deepEqual(localized.match(/\{\w+\}/g)?.sort() ?? [], source.match(/\{\w+\}/g)?.sort() ?? [], path);
      assert.deepEqual(localized.match(/\d+/g) ?? [], source.match(/\d+/g) ?? [], `numeric facts: ${path}`);
    }
  } else {
    assert.equal(translated, source, path);
  }
}

for (const locale of ["de", "fr"]) {
  const translated = JSON.parse(fs.readFileSync(`data/galleries/mobilityscooter.${locale}.json`, "utf8"));
  test(`mobilityscooter ${locale}: every visible field is translated without changing structure or funding figures`, () => {
    compare(english, translated);
    assert.equal(translated.locale, locale);
    assert.equal(translated.items.length, 16);
    assert.equal(translated.metadata.title, translated.landing.title);
    assert.equal(translated.gallery.flow, "article");
    assert(isArticlePopupQuestions(translated.landing.followUpQuestions));
    const registry = fs.readFileSync("lib/galleries.ts", "utf8");
    const name = locale === "de" ? "mobilityScooterDe" : "mobilityScooterFr";
    assert(registry.includes(`import ${name} from "@/data/galleries/mobilityscooter.${locale}.json";`));
    assert(registry.match(/const galleryManifests = \[([\s\S]*?)\]\.map/)?.[1].includes(name));
  });

  test(`mobilityscooter ${locale}: all 27 answer paths preserve question order and the same rewarded unlock`, () => {
    const config = translated.landing.followUpQuestions;
    for (let combination = 0; combination < 27; combination++) {
      let progress = createPopupQuestionProgress(config);
      for (let index = 0; index < 3; index++) {
        const question = getCurrentPopupQuestion(config, progress)!;
        assert.equal(question.id, english.landing.followUpQuestions.requiredQuestionIds[index]);
        assert.deepEqual(question.choices.map(choice => choice.id), english.landing.followUpQuestions.questions[index].choices.map((choice: {id: string}) => choice.id));
        progress = answerPopupQuestion(config, progress, question.id, question.choices[Math.floor(combination / 3 ** index) % 3].id);
      }
      assert.equal(getCurrentPopupQuestion(config, progress), undefined);
      assert.equal(config.requireReward, true);
      assert.equal(config.unlockArticle, undefined, "existing post-popup article gate is unchanged");
    }
  });
}
